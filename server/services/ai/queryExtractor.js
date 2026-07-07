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
    transactionType: null,
    city: null,
    minPrice: null,
    maxPrice: null,
    propertyType: null,
    minBedrooms: null,
    minBathrooms: null,
    minGuests: null,
    amenities: [],
    removeAmenities: [],
    clearAmenities: false,
    clearAllFilters: false,
    clearMaxPrice: false,
    clearMinPrice: false,
    clearPropertyType: false,
    clearCity: false,
    sortPreference: 'best_match',
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

  // Change of mind / Reset / Dropping previous search
  // e.g. "cfy mab9itch baghiha", "mab9itch baghi hadchi", "bdel l-fikra", "annuler"
  const isChangeOfMind = /\b(?:mab9itch\s*baghiha|mab9itx\s*baghiha|mabghithach|mab9itch\s*baghi\s*hadchi|bdel\s*l-?fikra|beddel\s*l-?fikra|ghiyer|annuler|cancel)\b/i.test(lower);
  if (isChangeOfMind) {
    criteria.clearAmenities = true;
    criteria.clearPropertyType = true;
  }

  // Negation of Sea view
  // e.g. "mab9itch baghi dar hdalbhar", "bla b7ar", "machi 3la lbhar", "pas de vue mer"
  const isNegatingSea = /(?:mab9itch|mab9itx|mabghitch|mab4itch|ma\s*bghitch|ma\s*b4itch|machi|bla|ne\s*veux\s*plus|pas\s*de|sans|no\s*longer\s*want|don['’]?t\s*want|without|لا\s*أريد|لم\s*أعد\s*أريد|بدون)\s+.*?(?:hda|3la)?\s*(?:l-?|el\s*)?(?:b[7h][ae]r|bahr|plage|mer|ocean|beach)/i.test(lower);
  if (isNegatingSea) {
    criteria.removeAmenities.push('Vue sur mer');
  }

  // Property types
  // Check if text is an interview request or general phrase where "dar" just means housing in general
  const isCasualDar = isInterviewRequest || isUserCorrection || isPingAllo || /\b(t9dar\s*t3awni|bghit\s*n-?skon|sakan)\b/i.test(lower);

  // Appartement / Shqa / شقة
  if (/\b(appartement|apartment|appart|apt|flat)\b/i.test(lower) || /\b(chqa|cheqa|shqa)\b/i.test(lower) || /شقة/.test(text)) {
    criteria.propertyType = 'Appartement';
  } else if (/\b(villa|villas)\b/i.test(lower) || /فيلا|فيلات/.test(text)) {
    criteria.propertyType = 'Villa';
  } else if (!isCasualDar && !isChangeOfMind && ((/\b(maison|house)\b/i.test(lower) || /منزل/.test(text) || (/\bdar\b/i.test(lower) && (criteria.city || criteria.maxPrice || criteria.minBedrooms)))) && !/دار\s*البيضاء/.test(text)) {
    criteria.propertyType = 'Maison';
  } else if (/\b(studio|studios)\b/i.test(lower) || /ستوديو|استوديو/.test(text)) {
    criteria.propertyType = 'Studio';
  } else if (/\b(riad|riads)\b/i.test(lower) || /رياض/.test(text)) {
    criteria.propertyType = 'Riad';
  } else if (/\b(chambre|bit|room)\b/i.test(lower) || /غرفة|بيت/.test(text)) {
    if (!criteria.propertyType) criteria.propertyType = 'Chambre';
  }

  // Budget / Prices:
  // 1. Min price extraction (must check before generic price number)
  // e.g. "ktar mn 1000 dh", "ktarmn 500", "kter men 1500", "plus de 1000", "fo9 500", "more than 1000", "min 1000"
  const minPriceMatch = text.match(
    /(?:ktar\s*m[ne]|ktarmn|kter\s*m[ne]|ktermn|kber\s*m[ne]|kbermn|fo9\s*m[ne]|fo9mn|foug\s*m[ne]|fougmn|fo9|foug|fawq|aktar\s*m[ne]|ktar\s*3la|kter\s*3la|plus\s*de|plus\s*que|au\s*dessus\s*de|supérieur\s*à|more\s*than|above|over|higher\s*than|at\s*least|min|minimum|أكثر\s*من|فوق|أكبر\s*من|أقل\s*شيء)\s*:?\s*(\d+[\d\s]*)/i
  );
  if (minPriceMatch) {
    const rawMin = minPriceMatch[1].replace(/\s+/g, '');
    const numMin = parseInt(rawMin, 10);
    if (!isNaN(numMin) && numMin > 0) {
      criteria.minPrice = numMin;
      criteria.clearMaxPrice = true;
      criteria.sortPreference = 'price_asc';
    }
  }

  // 2. Max price extraction
  // e.g. "9al mn 500", "9almn 500", "rkhass mn 500 dh", "a9al mn 800", "max 2500 dh", "ta7t 500"
  const maxPriceMatch =
    text.match(
      /(?:9al\s*m[ne]|9almn|9el\s*m[ne]|9elmn|a9al\s*m[ne]|a9almn|rkhass\s*m[ne]|rkhassmn|rkhis\s*(?:3la|m[ne])|sgher\s*m[ne]|sghermn|ta7t\s*m[ne]|ta7tmn|ta7t|moins\s*de|inférieur\s*à|sous|less\s*than|under|below|max|maximum|budget|mizaniya|mizaneya|plafon|jusqu['’]?à|أقل\s*من|تحت|أرخص\s*من|أقصى|حد\s*أقصى|ميزانية)\s*:?\s*(\d+[\d\s]*)/i
    ) ||
    (!minPriceMatch ? text.match(/(\d+)\s*(?:dh|mad|dirham|dirhams|درهم)/i) : null) ||
    text.match(/(?:khlli\s+budget|update\s+budget)\s*(\d+)/i);

  if (maxPriceMatch) {
    const rawNum = maxPriceMatch[1].replace(/\s+/g, '');
    const num = parseInt(rawNum, 10);
    if (!isNaN(num) && num > 0) {
      criteria.maxPrice = num;
      if (!minPriceMatch) {
        criteria.clearMinPrice = true;
      }
      if (/(?:9al|9el|a9al|rkhass|rkhis|sgher|ta7t|moins)/i.test(maxPriceMatch[0])) {
        criteria.sortPreference = 'price_asc';
      }
    }
  }

  // 3. Price sort preference / Cheap ("rkhissa", "rkhis", "pas cher", "cheap", "économique")
  if (/\b(?:rkhissa|rkhis|rkhess|rkhass|pas\s*cher|cheap|cheapest|économique|bon\s*marché|رخيص|رخيصة|الأرخص)\b/i.test(lower)) {
    criteria.sortPreference = 'price_asc';
  }

  // Number of guests / people (e.g. "lchakhss 1", "pour 1 personne", "solo", "2 people")
  if (/\b(?:l-?chakhss?\s*1|chakhs\s*wahed|pour\s*1\s*personne|pour\s*une\s*personne|for\s*1\s*person|for\s*one\s*person|solo|wahdi|bwa7di|لشخص\s*واحد|فرد\s*واحد)\b/i.test(lower)) {
    criteria.minGuests = 1;
  } else {
    const guestsMatch = lower.match(/(?:pour|for|l)\s*(\d+)\s*(?:personnes?|people|nass|chakhs)\b/i);
    if (guestsMatch) {
      criteria.minGuests = parseInt(guestsMatch[1], 10);
    }
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
    { key: 'Piscine', patterns: [/piscine/i, /pool/i, /swimming pool/i, /مسبح/i, /\bla\s*piscine\b/i, /\bb\s*piscine\b/i] },
    { key: 'Climatisation', patterns: [/climatisation/i, /clim/i, /ac\b/i, /air condition/i, /مكيف/i, /كليما/i] },
    { key: 'Parking gratuit', patterns: [/parking/i, /garage/i, /باركينغ/i, /كراج/i, /مرآب/i] },
    { key: 'Jardin', patterns: [/jardin/i, /garden/i, /حديقة/i] },
    { key: 'Terrasse', patterns: [/terrasse/i, /terrace/i, /سطح/i, /تراس/i] },
    { key: 'Cuisine équipée', patterns: [/cuisine/i, /kitchen/i, /مطبخ/i, /كوزينة/i] },
    {
      key: 'Vue sur mer',
      patterns: [
        /vue sur mer/i,
        /vue mer/i,
        /sea view/i,
        /ocean view/i,
        /front de mer/i,
        /bord de mer/i,
        /إطلالة على البحر/i,
        /\b(hda|3la|9rib\s*l|face|près|vue)?\s*(l-?|el\s*)?(b[7h][ae]r|bahr)\b/i,
        /\b(mer|plage|beach|ocean|côte|sa7il)\b/i,
        /بحر|البحر|شاطئ|الشاطئ|ساحل|قرب البحر|على البحر/,
      ],
    },
  ];

  for (const { key, patterns } of amenityMap) {
    if (key === 'Vue sur mer' && (isNegatingSea || isChangeOfMind)) {
      continue;
    }
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
    /\b(appartement|appartements|studio|studios|villa|villas|chambre|chambres|riad|riads|sakan|3aqar|3aqarat|logement|logements)\b/i.test(lower) ||
    /\b(bghit|b4it|bghitk|b4itk|khasni|bghina|b4ina|3tini|a3tini|ta3tini|werini|warini|jib\s*lia|chouf\s*lia|cherche|chercher|looking\s*for|je\s*veux|i\s*want|i\s*need|find\s*me|kan9elleb|kan9leb)\b.*?\b(dar|dyar|appartement|appartements|studio|studios|villa|villas|riad|riads|sakan|logement|3aqar|3aqarat|blasa)\b/i.test(lower) ||
    /\b(dyar|dar)\s+(li\s+)?(kaynin|9rab|hda|f)\b/i.test(lower) ||
    /\b(b4it|b4itk|bghit|bghitk|3tini|ta3tini|a3tini|werini|warini|jib\s*lia)\s+.*?\b(hda|3la)?\s*(l-?|el\s*)?(b[7h][ae]r|bahr|plage|mer|piscine|vue\s*sur\s*mer)\b/i.test(lower) ||
    /\b(mdina\s+hda\s+(l-?|el\s*)?b[7h][ae]r|hda\s+(l-?|el\s*)?b[7h][ae]r|3la\s+(l-?|el\s*)?b[7h][ae]r|mdina\s+sa7iliya|ville\s+c[oô]ti[eè]re)\b/i.test(lower) ||
    /شقة|شقق|ستوديو|فيلا|فيلات|غرفة|رياض|عقار|عقارات|أبحث عن|أريد|دور|ديار|قرب البحر|على البحر|مدينة قرب البحر|مدينة ساحلية/.test(text);

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
    criteria.minPrice ||
    criteria.minBedrooms ||
    criteria.minGuests ||
    criteria.sortPreference === 'price_asc' ||
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
  } else if (hasSpecificSearchCriteria) {
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
  // Always run deterministic extraction first
  const deterministic = extractCriteriaDeterministic(userText, existingCriteria);

  // If provider not configured, use robust deterministic parser
  if (!gemmaProvider.getStatus().isConfigured) {
    return deterministic;
  }

  // If deterministic detects strong conversational intent, negation, change of mind, or sorting,
  // use deterministic directly to avoid LLM hallucination and criteria staleness
  const hasStrongIntent = [
    'interview_request',
    'user_correction',
    'ping_allo',
    'weather',
    'programming',
    'mathematics',
    'translation',
    'sports',
    'greeting',
    'identity',
    'chitchat',
    'mixed',
  ].includes(deterministic.intent);

  const hasNegationOrReset =
    deterministic.clearAmenities ||
    deterministic.clearAllFilters ||
    deterministic.clearPropertyType ||
    deterministic.clearCity ||
    deterministic.clearMaxPrice ||
    deterministic.clearMinPrice ||
    (deterministic.removeAmenities && deterministic.removeAmenities.length > 0) ||
    deterministic.sortPreference === 'price_asc' ||
    deterministic.minPrice != null ||
    deterministic.maxPrice != null;

  if (hasStrongIntent || hasNegationOrReset) {
    return deterministic;
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

    // Merge deterministic signals if any were missed
    if (deterministic.removeAmenities?.length > 0) {
      validated.removeAmenities = deterministic.removeAmenities;
      validated.amenities = (validated.amenities || []).filter(a => !deterministic.removeAmenities.includes(a));
    }
    if (deterministic.clearAmenities) validated.clearAmenities = true;
    if (deterministic.clearPropertyType) validated.clearPropertyType = true;
    if (deterministic.clearCity) validated.clearCity = true;
    if (deterministic.clearMaxPrice) validated.clearMaxPrice = true;
    if (deterministic.clearMinPrice) validated.clearMinPrice = true;
    if (deterministic.clearAllFilters) validated.clearAllFilters = true;

    return validated;
  } catch (error) {
    console.warn('⚠️ Gemma query extraction failed, using deterministic fallback:', error.message);
    return deterministic;
  }
}
