/**
 * @file aiController.js
 * @description Controller handling AI requests: chat, search, comparison, budget, and risk analysis.
 */

import gemmaProvider from '../services/ai/gemmaProvider.js';
import Property from '../models/Property.js';
import { extractSearchCriteria } from '../services/ai/queryExtractor.js';
import { searchAndRankProperties } from '../services/ai/propertyMatcher.js';
import { generateMatchExplanations } from '../services/ai/explanationService.js';
import { compareProperties } from '../services/ai/comparisonService.js';
import { calculateHousingBudget } from '../services/ai/budgetAdvisor.js';
import { analyzeListingRisk } from '../services/ai/listingRiskService.js';
import { generateConversationalResponse } from '../services/ai/conversationalAdvisor.js';
import { generateGeneralResponse } from '../services/ai/generalAiAdvisor.js';
import conversationMemory from '../services/ai/conversationMemory.js';
import {
  chatRequestSchema,
  compareRequestSchema,
  budgetRequestSchema,
  riskAnalysisSchema,
} from '../validators/aiValidator.js';

/**
 * @desc Multi-turn conversational AI search and assistant
 * @route POST /api/ai/chat
 * @access Public (optionally authenticated)
 */
export const handleAiChat = async (req, res, next) => {
  try {
    const parseResult = chatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: parseResult.error.errors,
      });
    }

    const { message, sessionId, apiKey } = parseResult.data;
    if (apiKey) {
      gemmaProvider.configureKey(apiKey);
    }
    const userId = req.user ? req.user._id : null;

    // Retrieve or initialize session
    const session = conversationMemory.getOrCreateSession(sessionId, userId);
    conversationMemory.appendMessage(session.id, 'user', message);

    // 1. Extract criteria (using previous session criteria for cumulative refinement)
    const extracted = await extractSearchCriteria(message, session.criteria);

    // Check if the previous assistant message was an interview/onboarding asking for housing criteria
    const historyWithoutCurrent = (session.history || []).slice(0, -1);
    const lastAssistantMsg = historyWithoutCurrent.slice().reverse().find(m => m.role === 'assistant');
    const wasInterviewPrompt = Boolean(
      lastAssistantMsg && (
        lastAssistantMsg.content.includes('نطرح عليك الأسئلة') ||
        lastAssistantMsg.content.includes('questions essentielles') ||
        lastAssistantMsg.content.includes('4 quick questions') ||
        lastAssistantMsg.content.includes('إينا مدينة') ||
        lastAssistantMsg.content.includes('chmen mdina')
      )
    );

    const isUserSayingThatsAll = /\b(o\s*cfy|cfy|o\s*safi|safi|c['’]?est\s*tout|that['’]?s\s*all|baraka|khalas)\b/i.test(message);

    // If user is answering an interview prompt, treat as search refinement
    const isGeneralDomain = ['weather', 'programming', 'mathematics', 'translation', 'sports'].includes(extracted.intent);
    if (wasInterviewPrompt && !isGeneralDomain && extracted.intent !== 'user_correction' && extracted.intent !== 'greeting') {
      extracted.intent = 'search';
    }

    // If user indicates a correction or objection ("ba9i ma3titkch achno baghi", "rak zrebty"), wipe accidental filters
    if (extracted.intent === 'user_correction') {
      session.criteria = {
        transactionType: null,
        city: null,
        minPrice: null,
        maxPrice: null,
        propertyType: null,
        minBedrooms: null,
        minBathrooms: null,
        minGuests: null,
        amenities: [],
      };
    }

    // 2. Merge criteria in session state
    const cumulativeCriteria = conversationMemory.mergeCriteria(session.id, extracted);

    // 3. Check for special intents
    if (extracted.intent === 'risk_check') {
      const assistantReply = extracted.detectedLanguage === 'darija'
        ? 'لتحليل أمان أي إعلان، استعمل زر "تحليل الأمان" المتوفر فصفحة العقار. كايمكنني نفحص السعر، الصور، وتناسق المعلومات باش نبهك لأي نقطة مشبوهة.'
        : 'Pour vérifier la fiabilité d’une annonce, vous pouvez lancer l’Analyse de Sécurité depuis la fiche du bien. Je vérifie les prix anormaux, les incohérences et les demandes d’acompte suspectes.';

      conversationMemory.appendMessage(session.id, 'assistant', assistantReply);
      return res.status(200).json({
        success: true,
        sessionId: session.id,
        reply: assistantReply,
        criteria: cumulativeCriteria,
        properties: [],
        explanations: [],
        totalMatches: 0,
        intent: 'risk_check',
      });
    }

    // Mixed intent: general question + real-estate search in same turn
    if (extracted.intent === 'mixed') {
      const generalExplanation = await generateGeneralResponse({
        userMessage: message,
        intent: 'general_qa',
        detectedLanguage: extracted.detectedLanguage,
        history: session.history || [],
      });

      const searchResult = await searchAndRankProperties(cumulativeCriteria, { limit: 4, allowAlternatives: true });
      const explanations = await generateMatchExplanations(
        searchResult.properties,
        cumulativeCriteria,
        extracted.detectedLanguage
      );

      const locationName = cumulativeCriteria.city || (extracted.detectedLanguage === 'darija' ? 'Beni Mellal' : 'la ville demandée');
      const propertyIntro = extracted.detectedLanguage === 'darija'
        ? `\n\n---\n\n🏠 **L-3aqarat li tlbti f ${locationName}:**\nL9ayt lik ${searchResult.count} 3aqar f la base de données kaynasbo talab dyalek:`
        : `\n\n---\n\n🏠 **Logements demandés à ${locationName} :**\nVoici ${searchResult.count} bien(s) vérifié(s) correspondant à votre recherche :`;

      const fullReply = `${generalExplanation}${propertyIntro}`;
      conversationMemory.appendMessage(session.id, 'assistant', fullReply);

      const safeProperties = searchResult.properties.map(item => ({
        ...item.property,
        score: item.score,
        isAlternative: item.isAlternative,
        relaxedReasons: item.relaxedReasons || [],
      }));

      return res.status(200).json({
        success: true,
        sessionId: session.id,
        reply: fullReply,
        criteria: cumulativeCriteria,
        properties: safeProperties,
        explanations,
        totalMatches: searchResult.count,
        intent: 'mixed',
      });
    }

    // Conversational & General AI intents (Programming, Math, Weather, Translation, Sports, Chit-chat, etc.)
    const generalIntents = [
      'weather',
      'programming',
      'mathematics',
      'translation',
      'sports',
      'greeting',
      'identity',
      'chitchat',
      'faq_platform',
      'real_estate_advice',
      'city_guide',
      'general_qa',
      'general_chat',
      'clarification',
      'interview_request',
      'user_correction',
      'ping_allo',
    ];

    if (generalIntents.includes(extracted.intent)) {
      const generalReply = await generateGeneralResponse({
        userMessage: message,
        intent: extracted.intent,
        detectedLanguage: extracted.detectedLanguage,
        history: session.history || [],
      });

      conversationMemory.appendMessage(session.id, 'assistant', generalReply);
      return res.status(200).json({
        success: true,
        sessionId: session.id,
        reply: generalReply,
        criteria: cumulativeCriteria,
        properties: [],
        explanations: [],
        totalMatches: 0,
        intent: extracted.intent,
      });
    }

    // Browse intent: show a small sample of diverse, highly-rated listings with human guidance
    if (extracted.intent === 'browse') {
      const sampleProperties = await Property.find({ status: 'approved' })
        .sort({ averageRating: -1 })
        .limit(3)
        .populate('owner', 'name email phone avatar')
        .lean();

      const browseReply = extracted.detectedLanguage === 'darija'
        ? `Marhba bik! 3ndna kter men 100 3aqar mtno3 f mokhtalif modon l-Meghrib (Beni Mellal, Marrakech, Casablanca, Tanger, Rabat...). Ha homa 3 dyal l-3aqarat top mn a7san ma kayn. Bach nwarik bdebt dakchi li kaynasbek: chmen mdina katfeddel o chhal l-mizaniya dyalek ta9riban?`
        : `Bienvenue ! Nous avons 100 biens certifiés à travers le Maroc (Beni Mellal, Casablanca, Marrakech, Tanger...). Voici une sélection de 3 biens parmi les mieux notés. Pour affiner précisément selon vos envies : dans quelle ville cherchez-vous et quel est votre budget approximatif ?`;

      conversationMemory.appendMessage(session.id, 'assistant', browseReply);
      return res.status(200).json({
        success: true,
        sessionId: session.id,
        reply: browseReply,
        criteria: cumulativeCriteria,
        properties: sampleProperties,
        explanations: [],
        totalMatches: sampleProperties.length,
        intent: 'browse',
      });
    }

    // Verify whether actual search filters are present (city, amenity, propertyType, budget, bedrooms, or coastal search)
    const hasActiveFilters = Boolean(
      (cumulativeCriteria.city && (cumulativeCriteria.propertyType || cumulativeCriteria.maxPrice || cumulativeCriteria.minPrice || cumulativeCriteria.minBedrooms || cumulativeCriteria.transactionType)) ||
      (cumulativeCriteria.city && /\b(bghit|khasni|cherche|rent|sale|lkra|lbi3)\b/i.test(message)) ||
      (cumulativeCriteria.amenities && cumulativeCriteria.amenities.length > 0) ||
      cumulativeCriteria.propertyType ||
      cumulativeCriteria.maxPrice ||
      cumulativeCriteria.minPrice ||
      cumulativeCriteria.minGuests ||
      cumulativeCriteria.sortPreference === 'price_asc' ||
      cumulativeCriteria.minBedrooms ||
      wasInterviewPrompt ||
      isUserSayingThatsAll ||
      /\b(b[7h][ae]r|lb[7h][ae]r|bahr|mer|beach|plage|piscine|pool|ocean)\b/i.test(message)
    );

    // If intent was search but no filters were provided, do not dump 100 properties: ask clarification like a human
    if (!hasActiveFilters) {
      const askFiltersReply = extracted.detectedLanguage === 'darija'
        ? `Wakha 3la rass o l-3ayn! Bach n9der n3awnk tl9a l-3aqar li kaynasbek: chmen mdina katfeddel (Beni Mellal, Marrakech, Casablanca, Tanger...) o wach kat9elleb 3la lkra ola chra? O chhal l-mizaniya dyalek ta9riban?`
        : `Avec plaisir ! Pour vous orienter au mieux : dans quelle ville cherchez-vous (Beni Mellal, Casablanca, Marrakech, Tanger...), pour quel type de bien (appartement, villa, studio) et avec quel budget ?`;

      conversationMemory.appendMessage(session.id, 'assistant', askFiltersReply);
      return res.status(200).json({
        success: true,
        sessionId: session.id,
        reply: askFiltersReply,
        criteria: cumulativeCriteria,
        properties: [],
        explanations: [],
        totalMatches: 0,
        intent: 'clarification',
      });
    }

    // 4. Query real database and rank matching properties
    const searchResult = await searchAndRankProperties(cumulativeCriteria, { limit: 6, allowAlternatives: true });

    // 5. Generate grounded explanations
    const explanations = await generateMatchExplanations(
      searchResult.properties,
      cumulativeCriteria,
      extracted.detectedLanguage
    );

    // 6. Generate conversational response summary (warm, human tone)
    let reply = '';
    const lang = extracted.detectedLanguage;
    const locationName = cumulativeCriteria.city || (lang === 'darija' ? 'l-Meghrib' : 'le Maroc');

    if (searchResult.count > 0) {
      const isSeaSearch = cumulativeCriteria.amenities && cumulativeCriteria.amenities.includes('Vue sur mer');
      const isCheapSearch = cumulativeCriteria.sortPreference === 'price_asc' && !cumulativeCriteria.minPrice && !cumulativeCriteria.maxPrice;
      const isMinPrice = Boolean(cumulativeCriteria.minPrice);
      const isMaxPrice = Boolean(cumulativeCriteria.maxPrice);

      if (lang === 'darija') {
        if (isMinPrice && !cumulativeCriteria.city) {
          reply = `Wakha 3la rass o l-3ayn! 9ellabt lik f l-Meghrib o l9ayt ${searchResult.count} 3aqar ktar mn ${cumulativeCriteria.minPrice} DH kaynasbo talab dyalek b daqqa:`;
        } else if (isMaxPrice && !cumulativeCriteria.city) {
          reply = `Wakha 3la rass o l-3ayn! 9ellabt lik f l-Meghrib o l9ayt ${searchResult.count} 3aqar a9al mn ${cumulativeCriteria.maxPrice} DH kaynasbo talab dyalek b daqqa:`;
        } else if (isSeaSearch && !cumulativeCriteria.city) {
          reply = `Wakha 3la rass o l-3ayn! Ha homa ${searchResult.count} 3aqar kaynin 3la lb7ar o 3ndhom vue sur mer f modon sa7iliya (Tanger, Casablanca, Agadir, Essaouira):`;
        } else if (isCheapSearch && !cumulativeCriteria.city) {
          reply = `Wakha 3la rass o l-3ayn! Ha homa a7san l-3aqarat l-i9tisadiya o r-rkhissa f la base de données (bda men ${searchResult.properties[0]?.property?.pricePerNight || 240} DH/lila):`;
        } else {
          reply = `Wakha 3la rass o l-3ayn! 9ellabt lik f ${locationName} o l9ayt ${searchResult.count} 3aqar kaynasbo talab dyalek b daqqa:`;
        }
      } else if (lang === 'ar') {
        if (isMinPrice && !cumulativeCriteria.city) {
          reply = `على الرحب والسعة! لقد بحثت في المغرب ووجدت ${searchResult.count} عقار بسعر أكثر من ${cumulativeCriteria.minPrice} درهم:`;
        } else if (isMaxPrice && !cumulativeCriteria.city) {
          reply = `على الرحب والسعة! لقد بحثت في المغرب ووجدت ${searchResult.count} عقار بسعر أقل من ${cumulativeCriteria.maxPrice} درهم:`;
        } else if (isSeaSearch && !cumulativeCriteria.city) {
          reply = `على الرحب والسعة! إليك ${searchResult.count} عقار قرب البحر وإطلالة بحرية رائعة في مدن ساحلية (طنجة، الدار البيضاء، أكادير، الصويرة):`;
        } else if (isCheapSearch && !cumulativeCriteria.city) {
          reply = `على الرحب والسعة! إليك أرخص وأفضل العقارات الاقتصادية في قاعدة البيانات (ابتداءً من ${searchResult.properties[0]?.property?.pricePerNight || 240} درهم/ليلة):`;
        } else {
          reply = `على الرحب والسعة! لقد بحثت لك في ${locationName} ووجدت ${searchResult.count} عقار يطابق طلبك بدقة:`;
        }
      } else if (lang === 'fr') {
        if (isMinPrice && !cumulativeCriteria.city) {
          reply = `J'ai trouvé ${searchResult.count} bien(s) à plus de ${cumulativeCriteria.minPrice} DH correspondant à votre recherche :`;
        } else if (isMaxPrice && !cumulativeCriteria.city) {
          reply = `J'ai trouvé ${searchResult.count} bien(s) à moins de ${cumulativeCriteria.maxPrice} DH correspondant à votre recherche :`;
        } else if (isSeaSearch && !cumulativeCriteria.city) {
          reply = `Avec grand plaisir ! Voici ${searchResult.count} bien(s) en front de mer avec vue imprenable sur l'océan (Tanger, Casablanca, Agadir, Essaouira) :`;
        } else if (isCheapSearch && !cumulativeCriteria.city) {
          reply = `Avec grand plaisir ! Voici notre sélection de logements économiques et accessibles (à partir de ${searchResult.properties[0]?.property?.pricePerNight || 240} DH/nuit) :`;
        } else {
          reply = `C'est tout trouvé ! J'ai déniché ${searchResult.count} bien(s) correspondant exactement à vos critères à ${locationName} :`;
        }
      } else {
        reply = `I found ${searchResult.count} property/properties matching your criteria in ${locationName}:`;
      }
    } else if (searchResult.hasAlternatives) {
      const blockedText = searchResult.blockedCriteria.join(', ');
      if (lang === 'darija') {
        reply = `Ma l9itch chi 3aqar kiywafeq 100% ga3 had chourout (${blockedText}). Walakin l9ayt lik ${searchResult.properties.length} iqtira7at bdila 9riba bzaf l dakchi li bghiti:`;
      } else if (lang === 'ar') {
        reply = `لم يتم العثور على عقار يطابق تماماً جميع المعايير (${blockedText}). لكن إليك ${searchResult.properties.length} مقترحات بديلة قريبة جداً مما تبحث عنه:`;
      } else if (lang === 'fr') {
        reply = `Aucun bien ne réunit strictement l'intégralité de ces critères (${blockedText}). Voici ${searchResult.properties.length} excellentes alternatives très proches que je vous invite à consulter :`;
      } else {
        reply = `No properties matched all strict criteria (${blockedText}). Here are ${searchResult.properties.length} very close alternatives:`;
      }
    } else {
      if (lang === 'darija') {
        reply = `Sme7 lia, ma l9ina 7etta 3aqar b had l-mwasafat daba f la base de données. T9der tbeddel l-mdina ola t-zid chwiya f l-mizaniya?`;
      } else if (lang === 'ar') {
        reply = `عذراً، لم نجد أي عقار متوفر بهذه المواصفات حالياً في قاعدة البيانات. يمكنك تجربة تغيير المدينة أو تعديل الميزانية.`;
      } else if (lang === 'fr') {
        reply = `Désolé, aucun bien correspondant n'est disponible actuellement. Essayez d'élargir votre budget ou de choisir une autre ville.`;
      } else {
        reply = `Sorry, no available properties matched those criteria. Try expanding your search budget or choosing another city.`;
      }
    }

    conversationMemory.appendMessage(session.id, 'assistant', reply);

    // Prepare response with safe property fields
    const safeProperties = searchResult.properties.map(item => ({
      ...item.property,
      score: item.score,
      isAlternative: item.isAlternative,
      relaxedReasons: item.relaxedReasons || [],
    }));

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      reply,
      criteria: cumulativeCriteria,
      rawExtracted: extracted,
      totalMatches: searchResult.count,
      hasAlternatives: searchResult.hasAlternatives,
      blockedCriteria: searchResult.blockedCriteria,
      properties: safeProperties,
      explanations,
      intent: extracted.intent || 'search',
      history: session.history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Direct AI Natural Language Search
 * @route POST /api/ai/search
 * @access Public
 */
export const handleAiSearch = async (req, res, next) => {
  try {
    const { query, language = 'darija' } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const criteria = await extractSearchCriteria(query);
    const searchResult = await searchAndRankProperties(criteria, { limit: 12, allowAlternatives: true });
    const explanations = await generateMatchExplanations(searchResult.properties, criteria, language);

    const safeProperties = searchResult.properties.map(item => ({
      ...item.property,
      score: item.score,
      isAlternative: item.isAlternative,
      relaxedReasons: item.relaxedReasons || [],
    }));

    res.status(200).json({
      success: true,
      criteria,
      totalMatches: searchResult.count,
      hasAlternatives: searchResult.hasAlternatives,
      blockedCriteria: searchResult.blockedCriteria,
      properties: safeProperties,
      explanations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Compare 2 or 3 properties
 * @route POST /api/ai/compare
 * @access Public
 */
export const handleAiCompare = async (req, res, next) => {
  try {
    const parseResult = compareRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comparison parameters',
        errors: parseResult.error.errors,
      });
    }

    const { propertyIds, userPreferences, language } = parseResult.data;
    const comparison = await compareProperties(propertyIds, userPreferences, language);

    res.status(200).json({
      success: true,
      ...comparison,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Calculate housing budget and breakdown
 * @route POST /api/ai/budget
 * @access Public
 */
export const handleAiBudget = async (req, res, next) => {
  try {
    const parseResult = budgetRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid budget parameters',
        errors: parseResult.error.errors,
      });
    }

    const { propertyId, monthlyIncome, durationMonths } = parseResult.data;
    const budget = await calculateHousingBudget(propertyId, { monthlyIncome, durationMonths });

    res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Analyze listing risk indicators
 * @route POST /api/ai/analyze-listing
 * @access Public
 */
export const handleAiAnalyzeListing = async (req, res, next) => {
  try {
    const parseResult = riskAnalysisSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid risk analysis parameters',
        errors: parseResult.error.errors,
      });
    }

    const { propertyId, userReportedPaymentRequest, language } = parseResult.data;
    const analysis = await analyzeListingRisk(propertyId, userReportedPaymentRequest, language);

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reset conversation session
 * @route POST /api/ai/reset
 * @access Public
 */
export const handleAiReset = async (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    conversationMemory.resetSession(sessionId);
  }
  res.status(200).json({
    success: true,
    message: 'Conversation reset successfully',
  });
};

/**
 * @desc Check AI status and configuration
 * @route GET /api/ai/status
 * @access Public
 */
export const handleAiStatus = (req, res) => {
  res.status(200).json({
    success: true,
    ...gemmaProvider.getStatus(),
  });
};

/**
 * @desc Configure Gemini / Gemma API Key dynamically
 * @route POST /api/ai/configure-key
 * @access Public
 */
export const handleAiConfigureKey = (req, res) => {
  const { apiKey, model } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid API key is required' });
  }

  gemmaProvider.configureKey(apiKey);
  if (model) gemmaProvider.modelName = model;

  res.status(200).json({
    success: true,
    message: 'Google Gemini AI Key configured successfully!',
    status: gemmaProvider.getStatus(),
  });
};
