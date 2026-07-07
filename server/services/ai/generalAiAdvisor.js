/**
 * @file generalAiAdvisor.js
 * @description General-purpose, multi-domain conversational AI engine for ReserverDark.
 * Flexible like ChatGPT: answers questions across programming, math, science, translation,
 * sports, weather, history, creative writing, everyday advice, and Moroccan real estate.
 * Polyglot: Moroccan Darija, Modern Standard Arabic, French, and English.
 */

import gemmaProvider from './gemmaProvider.js';
import { fetchLiveWeather } from './weatherService.js';
import { MOROCCAN_CITIES_KNOWLEDGE } from './conversationalAdvisor.js';

export const GENERAL_AI_SYSTEM_INSTRUCTION = `
You are "ReserverDark AI", the dedicated smart Moroccan real estate and property advisor integrated into ReserverDark.
Your role, persona, and expertise are STRICTLY AND EXCLUSIVELY focused on Moroccan Real Estate, Houses, and Properties:
- Finding properties: apartments (chqeq), houses (dyar), studios, villas, riads for rent (lkra) or sale (lbi3) across Moroccan cities (Beni Mellal, Casablanca, Marrakech, Tanger, Rabat, Agadir, Fès, Essaouira, etc.).
- Active interviewing: asking the user the right questions to understand their needs (city, budget in DH, property type, bedrooms, guests, amenities).
- Real estate legal and practical advice in Morocco: lease contracts (3a9d lkra légalisé f l-baladiya/mouqataâ), deposit/caution (1-2 months), notary fees (frais de notaire ~6-7%), tenant rights (Loi 67-12), and neighborhood insights across Moroccan cities.

STRICT RESTRICTION ON OFF-TOPIC SUBJECTS (Math, Coding, Programming, Sports, Homework, etc.):
- You DO NOT solve mathematics, equations, programming code, algorithms, physics, or debate sports fixtures.
- If the user asks about an unrelated topic (math, programming, code, sports, academic homework, unrelated general chit-chat), you MUST politely and warmly decline in the user's language, explaining that you are an assistant specialized 100% in Moroccan real estate and housing, and immediately guide the user back to real estate by asking what kind of home, apartment, or villa they are searching for.

COMMUNICATION STYLE:
- Speak like a friendly, helpful Moroccan real estate advisor ("bhal bnadem"), warm, polite, and culturally authentic.
- Fluent in Moroccan Darija (Arabizi and Arabic script), French, Modern Standard Arabic, and English.
- Always be helpful, concise, and focused on helping the user find their home in Morocco.
`;

/**
 * Redirect off-topic requests (math, code, sports, school homework) back to real estate
 */
export function getRealEstateRedirectMessage(lang) {
  if (lang === 'darija') {
    return `Ana l-moussa3id dki dyalek l-motakhasis f l-3aqarat o d-dyar f l-Meghrib f ReserverDark. Had l-mawdo3 b3id 3la l-khedma dyali f l-3aqar.

Gol liya: wach kat9elleb 3la chi dar, chqa, studio ola villa? F ina mdina (Beni Mellal, Casablanca, Marrakech, Tanger...) o chhal l-mizaniya dyalek باش نعاونك نلقاو أحسن همزة!`;
  }
  if (lang === 'ar') {
    return `أنا مساعدك الذكي المتخصص حصرياً في العقارات والمنازل في المغرب على منصة ReserverDark. هذا الموضوع خارج اختصاصي العقاري.

أخبرني: هل تبحث عن شقة، منزل، ستوديو أو فيلا؟ في أي مدينة وما هي ميزانيتك لنساعدك في إيجاد أفضل عقار يناسبك؟`;
  }
  if (lang === 'fr') {
    return `Je suis l'assistant intelligent dédié exclusivement à l'immobilier et au logement au Maroc sur ReserverDark. Ce sujet ne fait pas partie de mon domaine d'expertise immobilière.

Dites-moi : quel type de bien recherchez-vous (appartement, studio, maison, villa), dans quelle ville et avec quel budget pour vous trouver la meilleure offre ?`;
  }
  return `I am the smart assistant dedicated exclusively to real estate and housing in Morocco on ReserverDark. This topic is outside my real estate domain.

Tell me: what kind of property are you looking for (apartment, studio, house, villa), in which city, and what is your budget so I can help you find the best home?`;
}

/**
 * Main General AI response generator
 */
export async function generateGeneralResponse({
  userMessage,
  intent = 'general_qa',
  detectedLanguage = 'darija',
  history = [],
}) {
  // 1. Check for prompt injection / security extraction attempts
  if (isSecurityOrPromptInjection(userMessage)) {
    return handleSecurityDefenses(userMessage, detectedLanguage);
  }

  // 2. Off-topic requests (Programming, Math, Sports, Homework): politely redirect to Moroccan Real Estate
  const isOffTopic = ['programming', 'mathematics', 'sports'].includes(intent) ||
    /\b(useeffect|react|javascript|typescript|python|nodejs|express|vue|angular|moyenne|calcul|hseb|ar9am|math|equation|botola|real\s*madrid|barcelona|messi|ronaldo)\b/i.test(userMessage);

  if (isOffTopic) {
    return getRealEstateRedirectMessage(detectedLanguage);
  }

  // 3. Check for live weather request (ties into real estate in that city)
  if (isWeatherQuery(userMessage, intent)) {
    const weatherAnswer = await handleLiveWeatherQuery(userMessage, detectedLanguage);
    if (weatherAnswer) return weatherAnswer;
  }

  // 4. If Gemini API is configured, use Google Gemini with real estate persona
  if (gemmaProvider.getStatus().isConfigured) {
    try {
      const geminiReply = await callGeminiGeneral({
        userMessage,
        intent,
        detectedLanguage,
        history,
      });
      if (geminiReply && geminiReply.trim().length > 0) {
        return geminiReply.trim();
      }
    } catch (err) {
      console.warn('⚠️ Gemini general generation failed, falling back to local reasoning engine:', err.message);
    }
  }

  // 5. Fallback: Local Real Estate Reasoning Engine
  return await generateLocalGeneralReply(userMessage, intent, detectedLanguage, history);
}

/**
 * Call Gemini with multi-turn conversation and general system prompt
 */
async function callGeminiGeneral({ userMessage, intent, detectedLanguage, history }) {
  const conversationSnippet = history.slice(-8).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
  const prompt = `
Recent Conversation Context:
${conversationSnippet || '(No previous messages)'}

Current User Message: "${userMessage}"
Detected Intent: ${intent}
User Language: ${detectedLanguage}

Please provide an accurate, helpful, and natural response now:
`;

  return await gemmaProvider.generateText({
    systemInstruction: GENERAL_AI_SYSTEM_INSTRUCTION,
    prompt,
    history,
  });
}

/**
 * Checks if a query is asking for weather
 */
export function isWeatherQuery(text, intent) {
  if (intent === 'weather') return true;
  const lower = text.toLowerCase();
  return (
    /\b(ta9ss|taqs|taqes|météo|meteo|weather|ch-?shta|shta|l-?bard|climat|chhal\s*l-?harara|darajat\s*l-?harara)\b/i.test(lower) ||
    /طقس|الطقس|أحوال الطقس|مطر|شتاء|حرارة/.test(text)
  );
}

/**
 * Handles live weather with city resolution
 */
async function handleLiveWeatherQuery(message, lang) {
  let targetCity = 'Beni Mellal';
  const cityMap = [
    { name: 'Marrakech', patterns: [/marrakech/i, /مراكش/] },
    { name: 'Casablanca', patterns: [/casablanca/i, /casa\b/i, /الدار\s*البيضاء/, /كازا/] },
    { name: 'Rabat', patterns: [/rabat/i, /الرباط/] },
    { name: 'Tanger', patterns: [/tanger/i, /tangier/i, /طنجة/] },
    { name: 'Agadir', patterns: [/agadir/i, /أكادير/, /اكادير/] },
    { name: 'Beni Mellal', patterns: [/beni\s*mellal/i, /بني\s*ملال/] },
    { name: 'Fès', patterns: [/f[èe]s/i, /fez/i, /فاس/] },
    { name: 'Essaouira', patterns: [/essaouira/i, /الصويرة/] },
    { name: 'Ifrane', patterns: [/ifrane/i, /إفران/, /افران/] },
    { name: 'Chefchaouen', patterns: [/chefchaouen/i, /chaouen/i, /شفشاون/] },
    { name: 'Tétouan', patterns: [/t[ée]touan/i, /تطوان/] },
    { name: 'Oujda', patterns: [/oujda/i, /وجدة/] },
    { name: 'Meknès', patterns: [/mekn[èe]s/i, /مكناس/] },
    { name: 'Paris', patterns: [/paris/i, /باريس/] },
    { name: 'Madrid', patterns: [/madrid/i, /مدريد/] },
    { name: 'London', patterns: [/london/i, /لندن/] },
  ];

  for (const item of cityMap) {
    if (item.patterns.some(p => p.test(message))) {
      targetCity = item.name;
      break;
    }
  }

  return await fetchLiveWeather(targetCity, lang);
}

/**
 * Detect security injection / prompt leak attempts
 */
function isSecurityOrPromptInjection(text) {
  const lower = text.toLowerCase();
  return (
    /\b(ignore\s+(all\s+)?previous\s+instructions|system\s+prompt|reveal\s+(api\s+)?key|password\s+of|secret\s+key|jwt_secret|database\s+password|dump\s+users|private\s+token)\b/i.test(lower) ||
    /تجاهل التعليمات السابقة|كلمة السر|مفتاح الأمان|قاعدة البيانات/.test(text)
  );
}

function handleSecurityDefenses(message, lang) {
  if (lang === 'darija') {
    return `Sme7 lia khoya, ma n9derch ncharik ma3loumat 7assasa bhal les clés d'API ola les mots de passe dyal l-system. Ana hna bach nsa3dek f ay so'al 3am, f l-khedma, l-programming, ola l-3aqarat f ReserverDark b kol amān. Fach n9der n3awnk?`;
  }
  if (lang === 'fr') {
    return `Désolé, je ne peux pas divulguer d'informations sensibles telles que les clés API, mots de passe système ou données privées. Je reste à votre entière disposition pour toute question générale, technique ou immobilière en toute sécurité.`;
  }
  if (lang === 'ar') {
    return `عذراً، لا يمكنني الإفصاح عن معلومات حساسة مثل مفاتيح API أو كلمات المرور أو البيانات السرية للنظام. أنا هنا لمساعدتك في أي استفسار معرفي، تقني أو عقاري بأمان تام.`;
  }
  return `Sorry, I cannot disclose sensitive system credentials, API keys, or private user data. I am happy to help you with programming, mathematics, general questions, or real estate securely!`;
}

/**
 * Local General-Purpose Reasoning Engine
 * Dynamically addresses programming, math, translation, football, history, culture, and chit-chat
 */
async function generateLocalGeneralReply(message, intent, lang, history = []) {
  const lower = message.toLowerCase();

  // Resolve follow-up context using previous turn
  const previousTurn = history.length > 0 ? history[history.length - 1].content : '';
  const previousTurnLower = previousTurn.toLowerCase();

  // 0. INTERVIEW / GUIDANCE REQUEST ("sawlni", "t9dar t3awni nl9a chi dar nta sawlni")
  if (intent === 'interview_request' || /\b(sawlni|nta sawlni|pose[- ]moi des questions)\b/i.test(lower)) {
    if (lang === 'darija') {
      return `Wakha 3la rass o l-3ayn khoya / khti! Ana hna bach n-mchi m3ak daqqa b daqqa ونطرح عليك الأسئلة باش نلقاو أحسن عقار كيعجبك بدقة:

1. أول حاجة: إينا مدينة كتقلب فيها؟ (بني ملال، مراكش، كازا، طنجة، الرباط، أكادير...)؟
2. واش كتقلب على الكراء (Rent) ولا الشراء (Sale)؟
3. واش كتفضل شقة، ستوديو، دار مستقلة، ولا فيلا؟
4. وشحال الميزانية القصوى لي داير ف بالك (بالدرهم)؟

جاوبني على هادو وأنا نجبد ليك أحسن الهميزات المتوفرة فالحين!`;
    }
    if (lang === 'ar') {
      return `على الرحب والسعة! دعنا نمشي معاً خطوة بخطوة وسأطرح عليك الأسئلة لتحديد طلبك بدقة:

1. في أي مدينة تبحث؟ (بني ملال، الدار البيضاء، مراكش، طنجة، فاس...)؟
2. هل تبحث عن كراء (إيجار) أم شراء؟
3. ما هو نوع العقار المفضل؟ (شقة، ستوديو، منزل، فيلا)؟
4. ما هي ميزانيتك القصوى بالدرهم المغربي؟

أخبرني بإجابتك وسأبحث لك فوراً في قاعدة البيانات!`;
    }
    if (lang === 'fr') {
      return `Avec grand plaisir ! Allons-y pas à pas, je vous pose les 4 questions essentielles pour trouver exactement votre logement :

1. Dans quelle ville cherchez-vous (Beni Mellal, Casablanca, Marrakech, Tanger, Rabat...) ?
2. Souhaitez-vous louer ou acheter ?
3. Quel type de bien préférez-vous (appartement, studio, maison, villa) ?
4. Quel est votre budget approximatif (en Dirhams MAD) ?

Répondez-moi simplement et je vous présente les meilleures options de la base !`;
    }
    return `With pleasure! Let's go step by step with 4 quick questions:
1. Which city in Morocco are you looking in (Beni Mellal, Casablanca, Marrakech, Tangier...)?
2. Are you looking to rent or buy?
3. What property type do you prefer (apartment, studio, house, villa)?
4. What is your approximate budget in Moroccan Dirhams (MAD)?
Tell me and I will find the best listings for you!`;
  }

  // 0.1 USER CORRECTION & OBJECTION ("ba9i ma3titkch achno baghi", "rak zrebty", "machi hadchi")
  if (intent === 'user_correction' || /\b(ba9i\s*ma3titkch|rak\s*zrebty|machi\s*hadchi)\b/i.test(lower)) {
    if (lang === 'darija') {
      return `عندك ألف حق، سمح ليا بزاف زربت عليك! ها أنا كانسمعك دابا مزيان، خود راحتك وكول ليا شنو بالضبط لي فبالك وشنو المواصفات لي كتقلب عليها؟`;
    }
    if (lang === 'ar') {
      return `معك كامل الحق، أعتذر منك على التسرع! أنا أستمع إليك باهتمام، خذ وقتك وأخبرني بما تبحث عنه بالضبط.`;
    }
    if (lang === 'fr') {
      return `Vous avez entièrement raison, pardonnez-moi d'être allé trop vite ! Je vous écoute attentivement : prenez votre temps et dites-moi exactement ce que vous recherchez.`;
    }
    return `You are completely right, apologies for jumping ahead! I am listening carefully: take your time and tell me exactly what you are looking for.`;
  }

  // 0.2 CALL CHECK-IN / PING ("allo", "wach katsme3ni", "fink")
  if (intent === 'ping_allo' || /\b(allo|wach\s*katsme3ni|fink)\b/i.test(lower)) {
    if (lang === 'darija') {
      return `ألو خويا / أختي! أنا معاك وكنسمعك مزيان. كيفاش نقدر نعاونك دابا؟ كول ليا شنو بغيتي ونخدمو عليه فالبلاصة.`;
    }
    if (lang === 'ar') {
      return `نعم، أهلاً بك! أنا معك وأستمع إليك باهتمام. كيف يمكنني مساعدتك الآن؟`;
    }
    if (lang === 'fr') {
      return `Oui bonjour, je suis bien là et je vous écoute ! Que puis-je faire pour vous aujourd'hui ?`;
    }
    return `Hello! Yes, I am right here listening. How can I help you today?`;
  }

  // 0.3 PLATFORM FAQS & PROCEDURE (booking, renting on ReserverDark)
  if (intent === 'faq_platform' || /\b(kri|reserver|réserver|book|hajz|حجز|نكري|كيفاش نكري|kifach nkri)\b/i.test(lower)) {
    if (lang === 'darija') {
      return `Tariqa sahla bzaf bach t-kri f ReserverDark:
1. Kat9elleb 3la l-3aqar li kay3ejbek (t9der tgoul liya mwasafat o ana njbdou lik mn la base).
2. Katdkhol tchouf les photos, l-maw9i3, o les détails dyalo.
3. Katcliki 3la 'Détails' o kat-reserver ola katconnecta direct m3a l-hôte.
4. Nasi7a d-dahab: dima t2aked men l-ma7al b 3aynik o dir 3a9d lkra légalisé f l-baladiya 9bel ma t3ti tsbi9 kbir.
Wach bghiti n-werik chi 3aqarat daba?`;
    }
    if (lang === 'fr') {
      return `Pour réserver un logement sur ReserverDark, c'est très simple :
1. Utilisez la barre de recherche ou décrivez-moi votre besoin pour trouver le bien idéal.
2. Consultez la fiche détaillée (photos réelles, équipements, localisation).
3. Cliquez sur "Réserver" ou contactez directement le propriétaire certifié.
4. Conseil sécurité : Nous recommandons toujours de visiter le bien et d'établir un contrat légalisé avant tout versement.`;
    }
    return `طريقة الحجز بسيطة جداً على منصة ReserverDark:
1. ابحث عن العقار المناسب أو اطلب مني البحث بالمواصفات التي تفضلها.
2. اطلع على تفاصيل العقار والصور الحقيقية والموقع.
3. اضغط على حجز للتواصل المباشر مع المالك المؤكد.`;
  }

  // 1. PROGRAMMING & SOFTWARE DEVELOPMENT (Off-topic: Redirect to Real Estate)
  if (
    /\b(useeffect|react|javascript|typescript|python|nodejs|express|vue|angular|async|await|state|hook|props|closure|api|bug|function|css|html|sql|mongodb)\b/i.test(lower) ||
    (history.length > 0 && /\b(binha|binhom|differ|différence|far9|comparer)\b/i.test(lower) && /\b(javascript|react|typescript|python)\b/i.test(previousTurnLower))
  ) {
    return getRealEstateRedirectMessage(lang);
  }

  // 2. MATHEMATICS & CALCULATIONS (Off-topic: Redirect to Real Estate)
  if (/\b(moyenne|calcul|hseb|ar9am|pourcentage|mo3addal|math|arithmetic|equation|somme|divide)\b/i.test(lower) || /معدل|احسب|حساب|أرقام|رياضيات|نسبة مئوية/.test(message)) {
    return getRealEstateRedirectMessage(lang);
  }

  // 3. TRANSLATION (e.g. "Trjem lia had lparagraph l français")
  if (/\b(trjem|traduire|translate|translation|tarjama)\b/i.test(lower) || /ترجم|ترجمة/.test(message)) {
    return getRealEstateRedirectMessage(lang);
  }

  // 4. FOOTBALL & SPORTS (Off-topic: Redirect to Real Estate)
  if (/\b(match|kora|foot|football|champions\s*league|botola|real\s*madrid|barcelona|messi|ronaldo|rbe7|score|coupe\s*du\s*monde|sports?)\b/i.test(lower) || /مباراة|كرة القدم|من فاز|فاز|الرجاء|الوداد|ماتش/.test(message)) {
    return getRealEstateRedirectMessage(lang);
  }

  // 5. GREETINGS & SMALL-TALK (100% Real Estate Welcome & Interview)
  if (intent === 'greeting' || /^(salam|bonjour|hello|hi|salut|ahlan)\b/i.test(lower)) {
    if (lang === 'darija') {
      return `Wa 3alaykom salam wa rahmatullah khoya / khti! Marhba bik f ReserverDark. Ana l-moussa3id dki dyalek l-motakhasis f l-3aqarat o d-dyar f l-Meghrib.

Bach n9der n3awnk tl9a a7san sakan:
1. Chmen mdina katfeddel? (Beni Mellal, Marrakech, Casablanca, Tanger, Rabat...)
2. Wach kat9elleb 3la lkra (Rent) ola chra (Sale)?
3. Chmen naw3 dyal l-3aqar katfeddel (chqa, studio, dar, villa)?
4. O chhal l-mizaniya dyalek ta9riban b d-derham?

Goul lia شنو ف بالك وأنا نجبد ليك أفضل العروض متوفرة فالحين!`;
    }
    if (lang === 'ar') {
      return `وعليكم السلام ورحمة الله وبركاته! أهلاً وسهلاً بك في ReserverDark. أنا مساعدك الذكي المتخصص في العقارات والمنازل بالمغرب.

لأساعدك في إيجاد السكن المثالي، أخبرني:
1. في أي مدينة تبحث؟ (بني ملال، مراكش، الدار البيضاء، طنجة، الرباط...)
2. هل تبحث عن الكراء أم الشراء؟
3. ما هو نوع العقار المفضل (شقة، ستوديو، منزل، فيلا)؟
4. وما هي ميزانيتك التقريبية بالدرهم؟

أخبرني بما يناسبك وسأستخرج لك أفضل الخيارات الحقيقية مباشرة!`;
    }
    if (lang === 'fr') {
      return `Bonjour et bienvenue sur ReserverDark ! Je suis votre conseiller immobilier intelligent spécialisé dans le logement au Maroc.

Pour vous orienter vers le bien idéal :
1. Dans quelle ville cherchez-vous (Beni Mellal, Casablanca, Marrakech, Tanger, Rabat...) ?
2. Souhaitez-vous louer ou acheter ?
3. Quel type de bien préférez-vous (appartement, studio, maison, villa) ?
4. Quel est votre budget approximatif en DH ?

Dites-moi vos critères et je vous trouve les meilleures opportunités !`;
    }
    return `Hello and welcome to ReserverDark! I am your smart real estate advisor specialized in Moroccan properties.

To help you find your ideal home:
1. Which city in Morocco are you looking in (Beni Mellal, Casablanca, Marrakech, Tangier, Rabat...)?
2. Are you looking to rent or buy?
3. What property type do you prefer (apartment, studio, house, villa)?
4. What is your approximate budget in MAD?

Tell me your preferences and I will find the best matches for you!`;
  }

  // 6. IDENTITY & ROLE (100% Real Estate Advisor)
  if (intent === 'identity' || /\b(chkon\s*nta|who\s*are\s*you|qui\s+es[- ]tu|chnou\s+kaddir|chnou\s+khdmtk)\b/i.test(lower)) {
    if (lang === 'darija') {
      return `Ana ReserverDark AI, l-moussa3id dki l-motakhasis 100% f l-3aqarat o d-dyar f ga3 modon l-Meghrib!

Khedmti n-sa3dek f:
- Tel9a a7san dyar, chqeq, studios, o villas lkra ola l-bi3 b a7san atmina.
- N-jawbek 3la as3ar lkra f a7yae modon l-Meghrib (Beni Mellal, Casa, Marrakech, Tanger...).
- N-nas7ek f l-qanoun d l-3aqar: 3a9d lkra légalisé, caution (daman), o frais de notaire.
- N-قارنو ليك بين العقارات باش تختار الأنسب ليك.

Gol lia: chmen dar ola 3aqar kat9elleb 3lih daba?`;
    }
    if (lang === 'ar') {
      return `أنا ReserverDark AI، مساعدك الذكي المتخصص 100% في العقارات والمنازل في جميع مدن المغرب!

مهمتي هي مساعدتك في:
- العثور على أفضل الشقق، المنازل، الاستوديوهات، والفيلات للكراء أو الشراء بأفضل الأسعار.
- تقديم أسعار الإيجار في أحياء مدن المغرب (بني ملال، الدار البيضاء، مراكش، طنجة...).
- إرشادك في الإجراءات القانونية: عقد الكراء المصادق عليه، الضمانة (Caution)، ومصاريف الموثق.

أخبرني: ما هو العقار الذي تبحث عنه حالياً؟`;
    }
    if (lang === 'fr') {
      return `Je suis ReserverDark AI, votre conseiller intelligent spécialisé à 100% dans l'immobilier et le logement au Maroc !

Je vous accompagne pour :
- Dénicher les meilleurs appartements, maisons, studios et villas en location ou à l'achat.
- Vous renseigner sur les prix moyens par quartier (Beni Mellal, Casablanca, Marrakech, Tanger, Rabat...).
- Vous conseiller sur les démarches : contrat de bail légalisé, caution, frais de notaire et droits du locataire.

Quel logement recherchez-vous aujourd'hui ?`;
    }
    return `I am ReserverDark AI, your smart real estate advisor specialized 100% in Moroccan housing and properties!

I help you:
- Find the best apartments, houses, studios, and villas for rent or sale.
- Understand rental prices across Moroccan cities (Beni Mellal, Casablanca, Marrakech, Tangier, Rabat...).
- Guide you through legal procedures: lease agreement, deposit, and notary fees.

What kind of property are you looking for today?`;
  }

  // 7. REAL ESTATE ADVICE / CITIES (if asked about cities or legal advice)
  for (const [cityName, info] of Object.entries(MOROCCAN_CITIES_KNOWLEDGE)) {
    if (new RegExp(`\\b${cityName}\\b`, 'i').test(message)) {
      if (lang === 'darija') {
        return `${info.overview_darija}\n\nA7san l-a7yae fiha:\n${info.neighborhoods.map(n => `- ${n.name}: ${n.desc}`).join('\n')}\n\nAs3ar lkra ta9riban:\n- Studio: ${info.averageRent.studio}\n- Appartement: ${info.averageRent.apartment}\n- Villa: ${info.averageRent.villa || info.averageRent.villa_riad}`;
      }
      return `À propos de ${cityName} :\n${info.neighborhoods.map(n => `- ${n.name} : ${n.desc}`).join('\n')}\n\nLoyers moyens :\n- Studio : ${info.averageRent.studio}\n- Appartement : ${info.averageRent.apartment}\n- Villa : ${info.averageRent.villa || info.averageRent.villa_riad}`;
    }
  }

  // 8. CREATIVE WRITING & SUMMARY REQUESTS (redirect to real estate)
  if (/\b(nokita|poeme|ch3r)\b/i.test(lower) || /شعر|نكتة/.test(message)) {
    return getRealEstateRedirectMessage(lang);
  }

  // 8.5 REAL ESTATE / HOUSING INQUIRIES
  if (/\b(dyar|dar|sakan|3aqar|3aqarat|krayen|chra|b[7h][ae]r|lb[7h][ae]r|bahr|plage|mer|ocean|beach|mdina|villes?)\b/i.test(lower) || /عقارات|سكن|بحر|البحر|شاطئ|مدينة/.test(message)) {
    if (lang === 'darija') {
      return `Marhba bik! F ReserverDark 3ndna kter men 100 3aqar mo3tamad f ga3 modon l-Meghrib (Tanger, Casablanca, Agadir, Marrakech, Essaouira, Beni Mellal...).
Ha homa a7san l-3aqarat li 3ndhom vue sur mer o 9rab l lb7ar wlla f l-mdina li kat9elleb 3liha!`;
    }
    if (lang === 'fr') {
      return `Bienvenue ! Sur ReserverDark, nous disposons de 100 biens certifiés à travers le Maroc (Tanger, Casablanca, Agadir, Marrakech, Essaouira...). Voici les meilleurs logements disponibles en bord de mer ou selon votre choix !`;
    }
  }

  // 9. GENERAL OPEN-ENDED CONVERSATION (Redirect to Real Estate)
  if (lang === 'darija') {
    return `Marhba bik f ReserverDark! Ana hna bach nsa3dek f kol ma kayt3alla9 b l-3aqarat o d-dyar f l-Meghrib (krayen, chra, as3ar, o mwasafat).

Gol liya: chmen dar ola chqa kat9elleb 3liha, f ina mdina o chhal l-mizaniya dyalek باش نجبدو ليك أحسن خيار!`;
  }
  if (lang === 'fr') {
    return `Bienvenue sur ReserverDark ! Je suis à votre service pour tout ce qui concerne l'immobilier et le logement au Maroc (locations, achats, prix et démarches).

Quel type de logement cherchez-vous, dans quelle ville et avec quel budget ?`;
  }
  return `Welcome to ReserverDark! I am here to assist you with all aspects of real estate and housing in Morocco.

What kind of home are you looking for, in which city, and what is your budget?`;
}

/**
 * Handle Programming and Code Explanations
 */
function handleProgrammingQuery(message, lower, lang, previousTurnLower) {
  // React
  if (lower.includes('react') && !lower.includes('useeffect')) {
    if (lang === 'darija') {
      return `**React** hiya maktaba (library) JavaScript ma3roufa bzaf creeatha Meta (Facebook) bach t-bni biha les interfaces d l-mousta5dim (UI) b tariqa rapide o moderne.

📌 L-Mizāt l-asasiya dial React:
1. **Component-Based**: Kolchi f React m9ssem l des composants sghar (Header, Button, Card...) li t9der t3awed tsta3melhom (reusable).
2. **Virtual DOM**: React kay-beddel ghir l-blassa li tbedlat bdebt bla ma i3awed render l-page kamla, hadchi kaykhellih srii3 bzaf.
3. **State & Props**: Kaykhllik t-gérer les données dial l'application b suhoula (useState, useEffect, Redux).
4. **Écosystème kbir**: Next.js, React Native (l les applications mobiles), Vite o Tailwind CSS.`;
    }

    return `**React** est une bibliothèque JavaScript open-source développée par Meta permettant de concevoir des interfaces utilisateur (UI) modernes et réactives.

📌 Caractéristiques clés :
1. **Architecture basée sur les composants** : Découpage de l'interface en briques réutilisables et isolées.
2. **Virtual DOM** : Mises à jour ultrarapides de la page en ne modifiant que les éléments ayant changé.
3. **Gestion d'état réactive** : Hooks (\`useState\`, \`useEffect\`) pour synchroniser la vue avec les données.
4. **Écosystème riche** : Intégration fluide avec Next.js, React Native, Vite et Tailwind.`;
  }

  // useEffect in React
  if (lower.includes('useeffect')) {
    if (lang === 'darija') {
      return `\`useEffect\` f React hoa wahed l-Hook mohim bzaf li kaykhllik tdir les "Side Effects" (ta2thirat janbiya) f les Functional Components dialk.

📌 Fu9ach katssta3mlo?
1. Fetching Data: Fash katbghi tjib les données mn chi API.
2. Event Listeners: Fash katbghi tzid resize ola scroll listener.
3. DOM Updates: Fash katbghi tbeddel document.title ola timer (setInterval).

💻 Exemple pratique:
\`\`\`jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Had l-code kay-executa mlli l-component kay-t-monta ola kaytbeddel userId
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data));

    // Optional: Cleanup function fash kayt-démonter
    return () => {
      console.log('Cleanup timer ola listener');
    };
  }, [userId]); // Dependency Array: kay-executa ghir ila tbeddel userId!

  return <div>{user ? user.name : 'Loading...'}</div>;
}
\`\`\`

💡 Nasi7a f l-Dependency Array \`[]\`:
- \`[]\` khawya: kay-executa ghir mra we7da f l-bdaya (componentDidMount).
- \`[dep1, dep2]\`: kay-executa kolma tbeddel chi wahed fihom.
- Bla dependency array: kay-executa m3a kol Render (رد بالك من Infinite Loops!).`;
    }

    return `\`useEffect\` est un Hook fondamental de React qui permet d'exécuter des effets de bord (side effects) dans les composants fonctionnels.

📌 Utilisations fréquentes :
1. Récupération de données (Data fetching via API)
2. Gestion des abonnements ou Event Listeners
3. Manipulation manuelle du DOM ou timers (setTimeout/setInterval)

💻 Exemple pratique :
\`\`\`jsx
import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('https://api.example.com/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []); // [] vide = exécuté une seule fois au montage

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

Le tableau de dépendances \`[]\` contrôle précisément quand l'effet se déclenche.`;
  }

  // Follow-up: JS vs TS or differences
  if (lower.includes('typescript') || (previousTurnLower.includes('javascript') && (lower.includes('far9') || lower.includes('différence') || lower.includes('binha')))) {
    if (lang === 'darija') {
      return `L-far9 l-asassi bin **JavaScript** o **TypeScript**:

1. **Static Typing vs Dynamic Typing**:
   - **JavaScript**: Dynamically typed. L-variable t9der tdir fiha number o mn ba3d string bla ma i3tik erreur f l-compile time.
   - **TypeScript**: Statically typed (Superset dial JS). Kaddir les Types (\`string\`, \`number\`, \`interface\`), o kay-fyeq lik l-aghlāt 9bel ma t-lanci l-code.

2. **Compilation**:
   - JS kay-khedem direct f l-Browser ola Node.js.
   - TS khasou darori it-compila (transpile) l JavaScript 3ad ikhdem.

3. **Tooling & Autocomplete**:
   - F TypeScript, VS Code kay3tik Autocomplete wa3r bzaf o Refactoring sahel f les grands projets.

💻 Exemple:
\`\`\`typescript
// TypeScript
interface User {
  id: number;
  name: string;
}
function greet(user: User): string {
  return "Salam " + user.name;
}
\`\`\``;
    }

    return `La principale différence entre **JavaScript** et **TypeScript** réside dans le typage :
- **JavaScript** est typé dynamiquement : les erreurs de type n'apparaissent qu'à l'exécution.
- **TypeScript** est un sur-ensemble typé statiquement de JavaScript : il permet de définir des interfaces et des types stricts, détectant les bugs dès la compilation.
TypeScript est transcompilé en JavaScript pur pour s'exécuter dans les navigateurs ou sous Node.js.`;
  }

  // General JavaScript / Programming
  if (lang === 'darija') {
    return `JavaScript hiya lo3at l-programmations li kat7erk l-Web lyouma!
Katkhedem f l-Front-end (Browser) o f l-Back-end b Node.js.
Katmeyyez b:
- Event-driven & Asynchronous (Promises, async/await).
- Écosystème kbir bzaf (React, Next.js, Express, npm).
Wach 3ndek chi so'al mo3ayan f chi code ola f chi bug?`;
  }

  return `JavaScript est le langage incontournable du web moderne, permettant de développer à la fois côté client (navigateur) et côté serveur avec Node.js. Avez-vous une question spécifique sur une fonction ou un problème de code ?`;
}

/**
 * Handle Mathematics and Arithmetic Explanations
 */
function handleMathematicsQuery(message, lower, lang) {
  // Average of 3 numbers
  if (lower.includes('moyenne') || lower.includes('3 ar9am') || lower.includes('تلاتة') || lower.includes('ثلاثة') || lower.includes('trois')) {
    if (lang === 'darija') {
      return `Bach t7seb l-moyenne (المعدل) dyal 3 dyal l-ar9am, l-qa3ida sahla bzaf:

📐 **L-Qa3ida:**
\`\`\`
Moyenne = (R9m 1 + R9m 2 + R9m 3) / 3
\`\`\`

🔢 **Exemple b l-ar9am:**
Ntarado 3ndna had 3 dyal l-ar9am: **12**, **15**, o **18**:
1. Katjme3hom kamlin: \`12 + 15 + 18 = 45\`
2. Kat9ssem l-majmou3 3la 3: \`45 / 3 = 15\`
✅ **L-Moyenne hiya 15.**

Had l-qa3ida katsla7 l ay 3 ar9am bghiti t7seb lihom l-mo3addal!`;
    }

    return `Pour calculer la moyenne de 3 nombres, la formule est :
\`\`\`
Moyenne = (Nombre 1 + Nombre 2 + Nombre 3) / 3
\`\`\`

Exemple avec 12, 15 et 18 :
1. Somme : 12 + 15 + 18 = 45
2. Division par 3 : 45 / 3 = 15
La moyenne est donc 15.`;
  }

  // General calculation
  if (lang === 'darija') {
    return `Bach n7seb lik ay 7isab f l-math (somme, moyenne, pourcentage, équation): 3tini l-ar9am o l-mo3adala o ana n7sebha lik b t-tafsil step-by-step!`;
  }
  return `Pour tout calcul mathématique (moyenne, pourcentage, équation ou formule), donnez-moi simplement vos chiffres et je vous détaille le calcul pas à pas.`;
}

/**
 * Handle Translation Requests
 */
function handleTranslationQuery(message, lower, lang) {
  // Extract text to translate
  let contentToTranslate = message
    .replace(/^(trjem|trjem lia|traduire|translate|traduire ce texte|trjem had lparagraph|trjem lparagraph)\s*(en|au|l|to)?\s*(français|francais|arabe|english|darija)?\s*:?/i, '')
    .trim();

  if (!contentToTranslate || contentToTranslate.length < 3) {
    if (lang === 'darija') {
      return `3la rass o l-3ayn! 3tini l-paragraph ola l-jomla li bghiti nterjemha, o gol liya l ina lo3a (Français, Darija, Anglais, Arabe).`;
    }
    return `Je peux traduire votre texte immédiatement. Veuillez coller le texte à traduire et préciser la langue cible (Français, Arabe, Anglais, Darija).`;
  }

  // Example translation response
  if (lang === 'fr' || lower.includes('français') || lower.includes('francais')) {
    return `Voici la traduction en Français :

"${contentToTranslate}"

(Traduction soignée et naturelle respectant le sens exact du texte original).`;
  }

  return `Ha hiya t-tarjama dyal had l-paragraph:

"${contentToTranslate}"

Ila bghiti t-beddel chi kelma ola t-khelli l-usloub kter professionel, golha lia!`;
}

/**
 * Handle Football and Sports with verified honesty
 */
function handleSportsQuery(message, lower, lang) {
  // Check if user is asking about an unverified recent match result
  if (lower.includes('lbar7') || lower.includes('hier') || lower.includes('yesterday') || lower.includes('rbe7') || lower.includes('gagné') || lower.includes('who won')) {
    if (lang === 'darija') {
      return `Bach nkon sari7 m3ak o ma n3tikch natija ghalta: nata2ij l-mobarayat l-7aliya o dyal lbar7 khashom liaison direct m3a Flux d'information sportive live.
Chmen mobaraya ola chmen botola (Botola Pro marocaine, Champions League, La Liga...) kat9sed bdebt? Gol liya l-firaq o nchouf lik l-ma3loumat l-mowataqa!`;
    }
    if (lang === 'fr') {
      return `Pour vous donner une information exacte sans risque d'erreur, les scores des matchs d'hier ou en direct nécessitent un flux de données sportives en temps réel. De quelle rencontre ou compétition s'agit-il précisément (Ligue des Champions, Botola Pro, Liga) ? Précisez-moi les équipes !`;
    }
    return `To ensure accuracy without fabricating results, real-time match scores require a live sports data feed. Which specific match or competition (Champions League, Botola Pro, Premier League) are you asking about? Let me know the teams!`;
  }

  // General football question
  if (lang === 'darija') {
    return `Kora hiya l-3ichq f l-Meghrib! Sawlni 3la l-montakhab l-watani (Ousoud Al Atlas), l-Botola Pro (WAC, RCA, FAR...), les grands clubs d'Europe ola tarikh l-kora o ana m3ak!`;
  }
  return `Le football est une passion universelle ! N'hésitez pas à me poser vos questions sur l'histoire des clubs, les tactiques, ou les compétitions nationales et internationales.`;
}
