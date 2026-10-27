/**
 * @file queryExtractor.js
 * @description Extracts structured real estate criteria from multi-lingual user input
 * Supports Moroccan Darija, Modern Standard Arabic, French, and English.
 */

import gemmaProvider from './gemmaProvider.js';
import { searchCriteriaSchema } from '../../validators/aiValidator.js';

// Standardized Moroccan cities supported by ReserverDark
export const SUPPORTED_CITIES = [
  'Beni Mellal',
  'Casablanca',
  'Marrakech',
  'Rabat',
  'Agadir',
  'Tanger',
  'Fès',
  'Essaouira',
  'Chefchaouen',
  'Ouarzazate',
  'Meknès',
  'Ifrane',
  'Tétouan',
  'Oujda',
  'Kenitra',
  'El Jadida',
  'Nador',
  'Safi',
  'Mohammedia',
];

// Standardized property types in Property schema
export const PROPERTY_TYPES = [
  'Appartement',
  'Villa',
  'Maison',
  'Studio',
  'Chambre',
  'Riad',
  'Autre',
];

// Standardized amenities
export const AMENITIES_LIST = [
  'WiFi',
  'Climatisation',
  'Chauffage',
  'Cuisine équipée',
  'Parking gratuit',
  'Piscine',
  'Jardin',
  'Terrasse',
  'Vue sur mer',
  'Balcon',
  'Machine à laver',
  'Lave-vaisselle',
  'Télévision',
  'Eau chaude',
  'Petit-déjeuner inclus',
  'Animaux acceptés',
  'Fumeurs acceptés',
  'Accessible fauteuil roulant',
];

/**
 * Detect language of query
 */
export function detectLanguage(text) {
  if (!text) return 'darija';
  const lower = text.toLowerCase();

  // Arabic script check
  if (/[\u0600-\u06FF]/.test(text)) {
    // Check for Moroccan Darija words in Arabic script
    if (/(بغيت|ديال|باش|كاين|شحال|زوين|بزاف|مزيان|فالبلاصة|كرا|للكرا|شقة)/.test(text)) {
      return 'darija';
    }
    return 'ar';
  }

  // Latin script Darija indicators
  if (/\b(bghit|khasni|dyal|dial|lkra|lbi3|fih|fiha|juj|zouj|tlata|arba3a|khamsa|wakha|khlli|mzyan|drari|dar|bit|bitat|fin|chhal|chhal|bzaf)\b/i.test(lower)) {
    return 'darija';
  }

  // French indicators
  if (/\b(je|cherche|appartement|maison|vendre|louer|chambre|avec|dans|prix|budget|pour|près|de|météo|meteo|quelle|quel|est|la|le|les|aujourd'hui|comment|bonjour|salut)\b/i.test(lower)) {
    return 'fr';
  }

  // English indicators
  if (/\b(i|need|want|looking|for|rent|sale|buy|bedroom|apartment|house|with|near|budget|max|weather|what|how|today|is|the|tell|can|you)\b/i.test(lower)) {
    return 'en';
  }

  return 'darija';
}

/**
 * Deterministic criteria extractor (runs offline or as fallback)
 */
export function extractCriteriaDeterministic(text, existingCriteria = {}) {
  const lower = text.toLowerCase();
  const criteria = {
    transactionType: existingCriteria.transactionType || null,
    city: existingCriteria.city || null,
    minPrice: existingCriteria.minPrice || null,
    maxPrice: existingCriteria.maxPrice || null,
    propertyType: existingCriteria.propertyType || null,
    minBedrooms: existingCriteria.minBedrooms || null,
    minBathrooms: existingCriteria.minBathrooms || null,
    minGuests: existingCriteria.minGuests || null,
    amenities: [...(existingCriteria.amenities || [])],
    sortPreference: existingCriteria.sortPreference || 'best_match',
    intent: 'search',
    isAmbiguous: false,
    clarificationQuestion: null,
    detectedLanguage: detectLanguage(text),
  };

  // Transaction type: rent or sale
  // Darija: lkra / kra / nekri / lilkra / للـكراء / كراء
  // French: louer / location / à louer
  // English: rent / rental
  if (/\b(lkra|kra|nekri|lilkra|louer|location|à louer|a louer|rent|rental)\b/i.test(lower) || /للكراء|كراء|نكري/.test(text)) {
    criteria.transactionType = 'rent';
  }
  // Sale: lbi3 / nchri / chra / للبيع / شراء / بيع
  // French: vendre / achat / à vendre / acheter
  // English: buy / sale / purchase
  if (/\b(lbi3|bi3|chra|nchri|vendre|vente|à vendre|a vendre|achat|acheter|sale|buy|purchase)\b/i.test(lower) || /للبيع|بيع|شراء|نشري/.test(text)) {
    criteria.transactionType = 'sale';
  }

  // City detection
  for (const city of SUPPORTED_CITIES) {
    const cityRegex = new RegExp(`\\b${city.replace(/\s+/g, '\\s*')}\\b`, 'i');
    if (cityRegex.test(text)) {
      criteria.city = city;
      break;
    }
  }

  // Arabic script city names
  if (/بني\s*ملال/.test(text)) criteria.city = 'Beni Mellal';
  if (/الدار\s*البيضاء|كازا/.test(text)) criteria.city = 'Casablanca';
  if (/مراكش/.test(text)) criteria.city = 'Marrakech';
  if (/الرباط/.test(text)) criteria.city = 'Rabat';
  if (/طنجة/.test(text)) criteria.city = 'Tanger';
  if (/أكادير|اكادير/.test(text)) criteria.city = 'Agadir';
  if (/فاس/.test(text)) criteria.city = 'Fès';
  if (/الصويرة/.test(text)) criteria.city = 'Essaouira';

  // Intent pre-checks
  const isInterviewRequest =
    /\b(sawlni|nta\s*sawlni|sewelni|pose[- ]moi|ask\s*me|t9dar\s*t3awni|3awnni|kifach\s*nbdaw)\b/i.test(lower) ||
    /سولني|نتا سولني|اسألني|اطرح عليا أسئلة|عاوني نلقى/.test(text);

  const isUserCorrection =
    /\b(ba9i\s*ma|ba9i\s*ma3titkch|rak\s*zrebty|zrebti|machi\s*hadchi|rak\s*ghalat|ma\s*fhamtinich|pas\s*encore|tu\s*te\s*trompes|pas\s*ca|attends?|not\s*yet|wrong|wait)\b/i.test(lower) ||
    /باقي ما|باقي ما عطيتك|زربتي|ماشي هادشي|غالط|ما فهمتينيش|انتظر|ليس هذا/.test(text);

  const isPingAllo =
    /^(allo|alo|allo\?|alo\?|wach\s*katsme3ni|fink|rak\s*hna|khedam|tu\s*es\s*l[aà]|are\s*you\s*there)\b/i.test(lower) ||
    /^(ألو|الو|واش كتسمعني|فينك|هل أنت هنا)/.test(text);

  // Property types
  // Check if text is an interview request or general phrase where "dar" just means housing in general
  const isCasualDar = isInterviewRequest || isUserCorrection || isPingAllo || /\b(t9dar\s*t3awni|bghit\s*n-?skon|sakan)\b/i.test(lower);

  // Appartement / Shqa / شقة
  if (/\b(appartement|apartment|appart|apt|flat)\b/i.test(lower) || /\b(chqa|cheqa|shqa)\b/i.test(lower) || /شقة/.test(text)) {
    criteria.propertyType = 'Appartement';
  } else if (/\b(villa|villas)\b/i.test(lower) || /فيلا|فيلات/.test(text)) {
    criteria.propertyType = 'Villa';
  } else if (!isCasualDar && ((/\b(maison|house)\b/i.test(lower) || /منزل/.test(text) || (/\bdar\b/i.test(lower) && (criteria.city || criteria.maxPrice || criteria.minBedrooms)))) && !/دار\s*البيضاء/.test(text)) {
    criteria.propertyType = 'Maison';
  } else if (/\b(studio|studios)\b/i.test(lower) || /ستوديو|استوديو/.test(text)) {
    criteria.propertyType = 'Studio';
  } else if (/\b(riad|riads)\b/i.test(lower) || /رياض/.test(text)) {
    criteria.propertyType = 'Riad';
  } else if (/\b(chambre|bit|room)\b/i.test(lower) || /غرفة|بيت/.test(text)) {
    if (!criteria.propertyType) criteria.propertyType = 'Chambre';
  }

  // Budget / Prices: e.g. "max 2500 dh", "budget 3000", "2500dh", "3000 dirhams", "2500 درهم", "khlli budget 3000"
  const maxPriceMatch =
    text.match(/(?:max|maximum|budget|mizaniya|mizaneya|plafon|jusqu['’]?à|under|below|قل من|أقصى|حد أقصى|ميزانية)\s*:?\s*(\d+[\d\s]*)/i) ||
    text.match(/(\d+)\s*(?:dh|mad|dirham|dirhams|درهم)/i) ||
    text.match(/(?:khlli\s+budget|update\s+budget|budget)\s*(\d+)/i);

  if (maxPriceMatch) {
    const rawNum = maxPriceMatch[1].replace(/\s+/g, '');
    const num = parseInt(rawNum, 10);
    if (!isNaN(num) && num > 0) {
      criteria.maxPrice = num;
    }
  }

  // Min price: "min 1000", "au moins 1000"
  const minPriceMatch = text.match(/(?:min|minimum|au moins|at least|أقل شيء)\s*:?\s*(\d+)/i);
  if (minPriceMatch) {
    criteria.minPrice = parseInt(minPriceMatch[1], 10);
  }

  // Bedrooms:
  // "juj dyal lbitat" / "2 lbitat" / "3 chambres" / "trois chambres" / "two bedrooms" / "غرفتين" / "3 غرف"
  if (/\b(wahed\s+(?:lbit|bit)|1\s*(?:chambre|bedroom|bit)|une\s+chambre|one\s+bedroom)\b/i.test(lower) || /غرفة واحدة|بيت واحد/.test(text)) {
    criteria.minBedrooms = 1;
  } else if (/\b(juj|zouj|deux|two|2)\s*(?:dyal\s*)?(?:lbitat|bitat|bit|chambres?|bedrooms?)\b/i.test(lower) || /غرفتين|2 غرف|جوج بيتات|جوج بيوت/.test(text)) {
    criteria.minBedrooms = 2;
  } else if (/\b(tlata|trois|three|3)\s*(?:dyal\s*)?(?:lbitat|bitat|bit|chambres?|bedrooms?)\b/i.test(lower) || /3 غرف|ثلاث غرف|تلاتة بيتات/.test(text)) {
    criteria.minBedrooms = 3;
  } else if (/\b(arba3a|quatre|four|4)\s*(?:dyal\s*)?(?:lbitat|bitat|bit|chambres?|bedrooms?)\b/i.test(lower) || /4 غرف|أربع غرف/.test(text)) {
    criteria.minBedrooms = 4;
  } else if (/\b(khamsa|cinq|five|5)\s*(?:dyal\s*)?(?:lbitat|bitat|bit|chambres?|bedrooms?)\b/i.test(lower) || /5 غرف|خمس غرف/.test(text)) {
    criteria.minBedrooms = 5;
  } else {
    const genericBedMatch = lower.match(/(\d+)\s*(?:dyal\s*)?(?:chambres?|bedrooms?|lbitat|bitat|bit)\b/);
    if (genericBedMatch) {
      criteria.minBedrooms = parseInt(genericBedMatch[1], 10);
    }
  }

  // Amenities detection
  const amenityMap = [
    { key: 'Balcon', patterns: [/balcon/i, /balcony/i, /بالكون/i, /شرفة/i] },
    { key: 'WiFi', patterns: [/wifi/i, /wi-fi/i, /واي فاي/i, /انترنت/i, /internet/i] },
    { key: 'Piscine', patterns: [/piscine/i, /pool/i, /swimming pool/i, /مسبح/i] },
    { key: 'Climatisation', patterns: [/climatisation/i, /clim/i, /ac\b/i, /air condition/i, /مكيف/i, /كليما/i] },
    { key: 'Parking gratuit', patterns: [/parking/i, /garage/i, /باركينغ/i, /كراج/i, /مرآب/i] },
    { key: 'Jardin', patterns: [/jardin/i, /garden/i, /حديقة/i] },
    { key: 'Terrasse', patterns: [/terrasse/i, /terrace/i, /سطح/i, /تراس/i] },
    { key: 'Cuisine équipée', patterns: [/cuisine/i, /kitchen/i, /مطبخ/i, /كوزينة/i] },
    { key: 'Vue sur mer', patterns: [/vue sur mer/i, /sea view/i, /ocean view/i, /إطلالة على البحر/i] },
  ];

  for (const { key, patterns } of amenityMap) {
    if (patterns.some(p => p.test(text))) {
      if (!criteria.amenities.includes(key)) {
        criteria.amenities.push(key);
      }
    }
  }

  // Check intent with priority order
  const isWeather =
    /\b(ta9ss|taqs|taqes|météo|meteo|weather|ch-?shta|shta|l-?bard|climat|jaw\s*lyoum)\b/i.test(lower) ||
    /طقس|الطقس|أحوال الطقس|مطر|شتاء|حرارة/.test(text);

  const isProgramming =
    /\b(useeffect|react|javascript|typescript|python|nodejs|express|vue|angular|hook|state|props|closure|async|await|debug|function|css|html|algorithm)\b/i.test(lower);

  const isMath =
    /\b(moyenne|calcul|hseb|ar9am|pourcentage|mo3addal|math|arithmetic|equation)\b/i.test(lower) ||
    /معدل|احسب|حساب|أرقام|رياضيات|نسبة مئوية/.test(text);

  const isTranslation =
    /\b(trjem|traduire|translate|translation|tarjama)\b/i.test(lower) ||
    /ترجم|ترجمة/.test(text);

  const isSports =
    /\b(match|kora|foot|football|champions\s*league|botola|rbe7|score|messi|ronaldo)\b/i.test(lower) ||
    /مباراة|كرة القدم|من فاز|فاز|الرجاء|الوداد/.test(text);

  const hasExplicitPropertyNeed =
    /\b(appartement|studio|villa|chambre|riad|sakan)\b/i.test(lower) ||
    /\b(bghit|khasni|cherche|chercher|looking\s*for|je\s*veux|i\s*want|i\s*need)\s+(chi\s+)?(dar|appartement|studio|villa|riad|sakan|logement)\b/i.test(lower) ||
    /شقة|ستوديو|فيلا|غرفة|رياض|عقار|أبحث عن شقة|أريد كراء/.test(text);

  // Mixed intent: general question + real estate request in same prompt
  const isGeneralDomain = isProgramming || isMath || isTranslation || isWeather || isSports;
  const isMixed = isGeneralDomain && hasExplicitPropertyNeed;

  const isGreeting =
    /^(salam|salam\s*3laikom|salamo\s*3alaykom|salut|bonjour|bonsoir|hello|hi|hey|coucou|sbah\s*lkhir|sba7\s*lkhir|msae\s*lkhir|ahlan|marhaba|mrehba|mrba)\b/i.test(lower) ||
    /^(سلام|أهلا|مرحبا|صباح الخير|مساء الخير|السلام عليكم)/.test(text);

  const isIdentity =
    /\b(chkon\s*nta|chkoune\s*nta|chkoun\s*nta|chkounik|qui\s+es[- ]tu|who\s+are\s+you|chnou\s+kaddir|chnou\s+khdmtk|khedam\s+m3amen|role\s+dyalek)\b/i.test(lower) ||
    /شكون نتا|من أنت|أش كادير|ما هي وظيفتك|ما هو دورك/.test(text);

  const isChitchat =
    /\b(kidayr|kidayra|labas|la\s*bas|bikhir|kolchi\s*mzyan|koulchi\s*bkhir|cv\b|ca\s*va|chokran|chokrane|merci|thanks|thank\s*you|barak\s*allah)\b/i.test(lower) ||
    /كيداير|لاباس|بخير|صافا|شكرا|بارك الله/.test(text);

  const isFaq =
    /\b(kifach\s*n-?kri|kifach\s*n-?reserver|comment\s*réserver|how\s*to\s*book|kifach\s*nzid|comment\s*publier|tariqat\s*l-?hajz|wach\s*securisé)\b/i.test(lower) ||
    /كيفاش نكري|طريقة الحجز|كيف أحجز|نشر إعلان|طريقة الكراء/.test(text);

  const isRealEstateAdvice =
    /\b(daman|caution|notaire|3adoul|frais\s*de\s*notaire|3a9d\s*lkra|contrat\s*de\s*bail)\b/i.test(lower) ||
    /الضمانة|الضمان|الموثق|عقد الكراء|مصاريف الموثق/.test(text);

  const isBrowse =
    /\b(werini\s*chno|werini\s*l-?3aqarat|arani\s*les\s*annonces|les\s*offres|montre[- ]moi|show\s*me\s*properties|show\s*me\s*listings|browse)\b/i.test(lower) ||
    /وريني العقارات|أرني الإعلانات|أريد رؤية العروض/.test(text);

  const isCompare =
    /\b(compare|moqawana|differ|comparer)\b/i.test(lower) ||
    /مقارنة|قارن/.test(text);

  const isBudgetCalc =
    /\b(afford|cout|frais|calcul|hisab)\b/i.test(lower) ||
    /حساب التكلفة|مصاريف/.test(text);

  const isRiskCheck =
    /\b(risk|secur|scam|fraude|khatar|arnaque)\b/i.test(lower) ||
    /خطر|احتيال|نصب/.test(text);

  // Check if user has explicit search criteria or search intent
  const hasSpecificSearchCriteria = Boolean(
    criteria.propertyType ||
    criteria.maxPrice ||
    criteria.minBedrooms ||
    criteria.amenities.length > (existingCriteria.amenities?.length || 0) ||
    hasExplicitPropertyNeed
  );

  // City guide question: mentions a city, but asks "chhal kaydir lkra", "kifach دايرة", "a7san blasa"
  const isCityGuideQuestion = Boolean(
    criteria.city &&
    (/\b(chhal|as3ar|prix|a7yae|quartier|a7san|meilleur|ma3loumat|conseil|kifach)\b/i.test(lower) ||
     /أسعار|معلومات|أفضل|أحسن|أحياء/.test(text)) &&
    !hasExplicitPropertyNeed
  );

  if (isMixed) {
    criteria.intent = 'mixed';
  } else if (isWeather) {
    criteria.intent = 'weather';
  } else if (isProgramming) {
    criteria.intent = 'programming';
  } else if (isMath) {
    criteria.intent = 'mathematics';
  } else if (isTranslation) {
    criteria.intent = 'translation';
  } else if (isSports) {
    criteria.intent = 'sports';
  } else if (isUserCorrection) {
    criteria.intent = 'user_correction';
  } else if (isInterviewRequest) {
    criteria.intent = 'interview_request';
  } else if (isPingAllo) {
    criteria.intent = 'ping_allo';
  } else if (isGreeting && !hasSpecificSearchCriteria) {
    criteria.intent = 'greeting';
  } else if (isIdentity) {
    criteria.intent = 'identity';
  } else if (isChitchat && !hasSpecificSearchCriteria) {
    criteria.intent = 'chitchat';
  } else if (isFaq) {
    criteria.intent = 'faq_platform';
  } else if (isRealEstateAdvice) {
    criteria.intent = 'real_estate_advice';
  } else if (isCityGuideQuestion) {
    criteria.intent = 'city_guide';
  } else if (isBrowse) {
    criteria.intent = 'browse';
  } else if (isCompare) {
    criteria.intent = 'compare';
  } else if (isBudgetCalc) {
    criteria.intent = 'budget';
  } else if (isRiskCheck) {
    criteria.intent = 'risk_check';
  } else if (hasSpecificSearchCriteria && (criteria.city || criteria.maxPrice || criteria.minBedrooms)) {
    criteria.intent = 'search';
  } else if (lower.includes('?') || /\b(wach|chnou|fin|kifach|pourquoi|comment|what|how|where|هل|أين|كيف)\b/i.test(lower)) {
    criteria.intent = 'general_qa';
  } else if (isGreeting) {
    criteria.intent = 'greeting';
  } else {
    criteria.intent = hasSpecificSearchCriteria ? 'search' : 'general_chat';
  }

  return criteria;
}

/**
 * Main query extraction method
 * Uses Gemma 4 on Gemini API when available, falls back to deterministic extraction
 */
export async function extractSearchCriteria(userText, existingCriteria = {}) {
  // If provider not configured, use robust deterministic parser
  if (!gemmaProvider.getStatus().isConfigured) {
    return extractCriteriaDeterministic(userText, existingCriteria);
  }

  const systemInstruction = `
You are the Natural Language Understanding engine for ReserverDark, a Moroccan real estate platform.
Analyze the user's message in Darija (Moroccan Arabic), Standard Arabic, French, or English.
Extract criteria according to these specific rules:
1. transactionType: "rent" or "sale" (or null if unspecified). Note: "lkra" / "nekri" = "rent"; "lbi3" / "chra" = "sale".
2. city: One of [${SUPPORTED_CITIES.join(', ')}] or null. Normalize Moroccan city names (e.g., "Beni Mellal", "Casablanca").
3. minPrice: number in Moroccan Dirham (MAD/DH) or null.
4. maxPrice: number in Moroccan Dirham (MAD/DH) or null.
5. propertyType: One of [${PROPERTY_TYPES.join(', ')}] or null.
6. minBedrooms: integer number of bedrooms or null. (Note: "juj lbitat" = 2 bedrooms).
7. minBathrooms: integer number of bathrooms or null.
8. minGuests: integer number of guests or null.
9. amenities: array of matched amenities from [${AMENITIES_LIST.join(', ')}].
10. intent: "search", "compare", "budget", "risk_check", "clarification", "general_chat", "greeting", "identity", "chitchat", "faq_platform", "real_estate_advice", "city_guide", "browse", or "general_qa".
11. isAmbiguous: boolean (true if request is too vague to search).
12. clarificationQuestion: concise question in the user's language if ambiguous, else null.
13. detectedLanguage: "darija", "ar", "fr", or "en".

If existing criteria are provided, preserve them and update or add new requirements (conversational refinement).
Do NOT invent unmentioned criteria.
`;

  const prompt = `
User Query: "${userText}"
Existing State: ${JSON.stringify(existingCriteria || {})}

Extract the criteria now in strictly valid JSON matching this schema:
{
  "transactionType": "rent" | "sale" | null,
  "city": string | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "propertyType": string | null,
  "minBedrooms": number | null,
  "minBathrooms": number | null,
  "minGuests": number | null,
  "amenities": string[],
  "sortPreference": "best_match" | "price_asc" | "price_desc" | "rating",
  "intent": "search" | "compare" | "budget" | "risk_check" | "clarification" | "general_chat" | "greeting" | "identity" | "chitchat" | "faq_platform" | "real_estate_advice" | "city_guide" | "browse" | "general_qa",
  "isAmbiguous": boolean,
  "clarificationQuestion": string | null,
  "detectedLanguage": "darija" | "ar" | "fr" | "en"
}
`;

  try {
    const rawResult = await gemmaProvider.generateJson({
      systemInstruction,
      prompt,
    });

    // Validate with Zod
    const validated = searchCriteriaSchema.parse(rawResult);
    return validated;
  } catch (error) {
    console.warn('⚠️ Gemma query extraction failed, using deterministic fallback:', error.message);
    return extractCriteriaDeterministic(userText, existingCriteria);
  }
}
