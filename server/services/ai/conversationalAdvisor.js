/**
 * @file conversationalAdvisor.js
 * @description Natural, human-like Moroccan real estate conversational engine for ReserverDark.
 * Speaks authentic Moroccan Darija (Arabizi & Arabic script), French, Modern Standard Arabic, and English.
 * Answers greetings, platform FAQs, city/neighborhood guides, Moroccan real estate advice (caution, 3a9d lkra, notaire),
 * and general questions like a real human ("bhal bnadem").
 */

import gemmaProvider from './gemmaProvider.js';
import { fetchLiveWeather } from './weatherService.js';
import { generateGeneralResponse } from './generalAiAdvisor.js';

export const MOROCCAN_CITIES_KNOWLEDGE = {
  'Beni Mellal': {
    name: 'Beni Mellal',
    arabicName: 'بني ملال',
    overview_darija: 'Beni Mellal mdina hadya o zwiina f rejlin jbel Tassemmit, ma3roufa b 3in Asserdoun o l-khdora. L-as3ar fiha monasiba bzaf.',
    neighborhoods: [
      { name: 'Ain Asserdoun', desc: 'Mentaqa touristique hadya, zwiina bzaf l l-3a2ilat o fiha l-hedwa o l-mnazer.' },
      { name: 'Hay Al Amal', desc: 'Hay résidentiel modern o nqi, fih les commerces o 9rib l kolchi.' },
      { name: 'Al Qods / Massira', desc: 'A7yae cha3biya o nqiya b as3ar jidd monasiba.' },
      { name: 'Quartier Universitaire', desc: '9rib l jami3at Sultan Moulay Slimane, ideal l talaba (studios o byout b 800-1500 DH).' },
    ],
    averageRent: {
      studio: '800 - 1,500 DH',
      apartment: '1,800 - 3,000 DH',
      villa: '4,000 - 7,000 DH',
    },
  },
  'Casablanca': {
    name: 'Casablanca',
    arabicName: 'الدار البيضاء',
    overview_darija: 'L-3asima l-iqtisadiya, mdina 7ayyawiye fiha foras khtira walakin l-as3ar fiha tl3in chwiya.',
    neighborhoods: [
      { name: 'Maârif / Gauthier', desc: 'Qalb l-mdina, cafés, boutiques, très animé o modern.' },
      { name: 'Bourgogne / Racine', desc: 'A7yae raqiya 9riba l la corniche o Hassan II.' },
      { name: 'Sidi Maârouf', desc: 'Qrib l Nearshore, ideal l li khdamin f l-multinationales o l-IT.' },
      { name: 'Ain Diab', desc: 'Vue sur mer, villas, résidences de luxe.' },
    ],
    averageRent: {
      studio: '3,500 - 6,000 DH',
      apartment: '4,500 - 10,000+ DH',
      villa: '15,000 - 35,000+ DH',
    },
  },
  'Marrakech': {
    name: 'Marrakech',
    arabicName: 'مراكش',
    overview_darija: 'L-bahja o l-3asima s-siya7iya, fiha le choix kbir bin les Riads t-taqlidiya o les appartements l-moderne.',
    neighborhoods: [
      { name: 'Guéliz', desc: 'L-quartier modern, restaurants, art, 9rib l kolchi.' },
      { name: 'Hivernage', desc: 'Quartier chic, hôtels de luxe, calme o sécurisé.' },
      { name: 'La Médina', desc: 'Les Riads authentiques, charme taqlidi f qalb l-tarikh.' },
      { name: 'Targa & Palmeraie', desc: 'Villas b les piscines o les jardins, idéal l l-hedwa.' },
    ],
    averageRent: {
      studio: '2,500 - 4,500 DH',
      apartment: '3,500 - 7,500 DH',
      villa_riad: '8,000 - 25,000 DH',
    },
  },
  'Rabat': {
    name: 'Rabat',
    arabicName: 'الرباط',
    overview_darija: 'L-3asima l-idariya, mdina nqiya, khadra, calme o fiha sécurité 3aliya.',
    neighborhoods: [
      { name: 'Agdal', desc: 'Quartier dynamique, tramway, facultés, cafés o commerces.' },
      { name: 'Hay Riad', desc: 'Quartier des affaires, banques, ministères, villas o résidences modernes.' },
      { name: 'Hassan', desc: 'Historique, central, 9rib l la gare Rabat-Ville o Tour Hassan.' },
      { name: 'Souissi', desc: 'Quartier résidentiel prestigieux, grandes villas avec jardins.' },
    ],
    averageRent: {
      studio: '3,000 - 5,000 DH',
      apartment: '4,000 - 9,000 DH',
      villa: '15,000 - 30,000+ DH',
    },
  },
  'Tanger': {
    name: 'Tanger',
    arabicName: 'طنجة',
    overview_darija: '3oroussat ch-chamal, mdina ساحلية b إطلالة 3la l-b7ar o l-mo7it o qriba l Europe.',
    neighborhoods: [
      { name: 'Malabata', desc: 'Front de mer, vue panoramique sur la baie, résidences modernes.' },
      { name: 'Iberia / Marshan', desc: 'A7yae rāqiya b architecture andalouse o calme.' },
      { name: 'Centre-Ville', desc: 'Boulevard Pasteur, commerces, tout à pied.' },
    ],
    averageRent: {
      studio: '2,500 - 4,500 DH',
      apartment: '3,500 - 7,000 DH',
      villa: '10,000 - 22,000 DH',
    },
  },
  'Agadir': {
    name: 'Agadir',
    arabicName: 'أكادير',
    overview_darija: 'Mdina ch-chems o l-plage l-kbiira, taqs dima dafi o jaw mezyan l l-3aysh.',
    neighborhoods: [
      { name: 'Founty / Sonaba', desc: 'Quartier touristique o chic 9rib l la plage.' },
      { name: 'Charaf / Haut Fenty', desc: 'Quartiers résidentiels calmes pour familles.' },
      { name: 'Taghazout Bay', desc: 'Ideal l les surfeurs o le télétravail face à l’océan.' },
    ],
    averageRent: {
      studio: '2,000 - 3,500 DH',
      apartment: '3,000 - 6,000 DH',
      villa: '8,000 - 20,000 DH',
    },
  },
};

/**
 * Build a human-like, natural response to conversational inputs
 */
export async function generateConversationalResponse({
  userMessage,
  intent,
  detectedLanguage = 'darija',
  history = [],
}) {
  return generateGeneralResponse({
    userMessage,
    intent,
    detectedLanguage,
    history,
  });
}

/**
 * Call Gemma via Gemini API with a rich Moroccan Persona system instruction
 */
async function callGemmaConversational({ userMessage, intent, detectedLanguage, history }) {
  const systemInstruction = `
Tu es "ReserverDark AI", le meilleur conseiller immobilier et assistant d'intelligence artificielle au Maroc.
Tu es extrêmement intelligent, chaleureux, polyglotte et capable de répondre à TOUTES les questions :
- Immobilier au Maroc : quartiers, prix moyens par ville (Beni Mellal, Casablanca, Marrakech, Tanger, Rabat, Agadir...), types de biens (Appartements, Studios, Villas, Riads), démarches légales (caution, contrat de bail légalisé à la mouqataâ, frais de notaire).
- Questions générales : culture marocaine, météo, histoire, universités, gastronomie marocaine, calculs, conseils de vie, tech, etc.

LANGUES & TON :
1. DARIJA MAROCAINE (Lettres latines ou arabes) : Parle en Darija 100% authentique, chaleureuse et naturelle comme un ami marocain serviable ("Wa 3alaykom salam khoya/khti", "3la rass o l-3ayn", "Lhamdullah").
2. FRANÇAIS : Français soigné, élégant et chaleureux.
3. ARABE : Arabe fluide et professionnel.
4. ANGLAIS : Anglais naturel et accueillant.

RÈGLES CAPITALES :
- Parle comme un être humain ("bhal bnadem"), pas comme un robot.
- Sois direct, utile, empathique et brillant. Ne liste pas de faux numéros ou de biens inventés.
`;

  const conversationSnippet = history.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
  const prompt = `
Historique récent:
${conversationSnippet}

Message de l'utilisateur: "${userMessage}"
Intention détectée: ${intent}
Langue détectée: ${detectedLanguage}

Réponds maintenant de manière brillante, humaine et naturelle :
`;

  return await gemmaProvider.generateText({
    systemInstruction,
    prompt,
  });
}

/**
 * Local Human Dialogue Engine (expert Moroccan advisor + live tools)
 */
async function getLocalHumanReply(message, intent, lang) {
  const text = message.toLowerCase();

  // LIVE WEATHER CHECK ("ahwal ta9ss", "météo", "weather", "ch-shta", "l-bard")
  if (/\b(ta9ss|taqs|taqes|météo|meteo|weather|ch-?shta|shta|l-?bard|darajat\s*l-?harara|climat)\b/i.test(text) || /طقس|الطقس|أحوال الطقس|مطر|شتاء|حرارة/.test(message)) {
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
    ];
    for (const item of cityMap) {
      if (item.patterns.some(p => p.test(message))) {
        targetCity = item.name;
        break;
      }
    }
    const weather = await fetchLiveWeather(targetCity, lang);
    if (weather) return weather;
  }

  // 0. INTERVIEW / GUIDANCE REQUEST ("sawlni", "t9dar t3awni nl9a chi dar nta sawlni")
  if (intent === 'interview_request') {
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
  if (intent === 'user_correction') {
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
  if (intent === 'ping_allo') {
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

  // 1. GREETINGS
  if (intent === 'greeting') {
    if (lang === 'darija') {
      const greetingsDarija = [
        `Wa 3alaykom salam wa rahmatullah khoya / khti! Marhba bik f ReserverDark. Ana hna bach nsa3dek f ay haja bghitiha: wach kat9elleb 3la chi dar ola appartement lkra ola lbi3? Ola bghiti t3ref ma3loumat 3la chi mdina f l-Meghrib? Marhba b ay so'al dyalek!`,
        `Ahlan wa sahlan bik f ReserverDark! Kidayr labas 3lik? Ana l-moussa3id dki dyalek f l-3aqarat. Gol liya chno f balek: kat9elleb 3la sakan f chi mdina mo3ayana (Beni Mellal, Casa, Marrakech...) ola bghiti chi nasi7a?`,
        `Marhba bik alf marhba! Ntmenna tkoun bkhir o 3la khir. Kifach n9der nsa3dek lyouma f l-krayen ola chra dyal l-3aqarat f l-Meghrib?`,
      ];
      return greetingsDarija[Math.floor(Math.random() * greetingsDarija.length)];
    }
    if (lang === 'ar') {
      return `وعليكم السلام ورحمة الله وبركاته! مرحباً بك في منصة ReserverDark. أنا مستشارك العقاري الذكي هنا لمساعدتك في العثور على المسكن المناسب للإيجار أو الشراء، والإجابة عن أي استفسار حول العقارات في المغرب. كيف يمكنني خدمتك اليوم؟`;
    }
    if (lang === 'fr') {
      return `Bonjour et bienvenue sur ReserverDark ! Je suis votre conseiller immobilier intelligent. Que recherchez-vous aujourd'hui : une location, un achat, ou des conseils sur une ville marocaine (Beni Mellal, Casablanca, Marrakech...) ? Je suis à votre entière écoute !`;
    }
    return `Hello and welcome to ReserverDark! I am your smart real estate advisor. How can I help you today? Are you looking for a rental, a property to buy, or local housing advice in Morocco?`;
  }

  // 2. IDENTITY (chkon nta / qui es-tu / who are you)
  if (intent === 'identity') {
    if (lang === 'darija') {
      return `Ana l-moussa3id dki (AI Assistant) dyal plateforme ReserverDark! Khdmt bhal sadiq o conseillé immobilier dyalek f l-Meghrib:
- Kan3awnk tl9a a7san dar, studio, riad ola appartement lkra ola lbi3 b daqqa.
- Kanjawbk 3la as3ar lkra o l-a7yae f kol mdina (Beni Mellal, Marrakech, Casa, Rabat, Tanger...).
- Kan7seb lik l-budget, l-masarif dyal lkra (caution / tsbi9) o l-notaire.
- O kanfhes lik l-amān dyal les annonces باش ما تصيدش.
Aya haja bghiti t3refha ola swelti 3liha, ana m3ak! Chno f balek daba?`;
    }
    if (lang === 'ar') {
      return `أنا المساعد الذكي لمنصة ReserverDark للعقارات بالمغرب. وظيفتي هي مرافقتك كخبير عقاري: مساعدتك في إيجاد العقار المثالي للإيجار أو الشراء، تقديم استشارات حول الأسعار والأحياء، حساب التكاليف، والتأكد من أمان الإعلانات. أي استفسار يخطر ببالك، أنا رهن إشارتك!`;
    }
    if (lang === 'fr') {
      return `Je suis l’assistant intelligent officiel de ReserverDark ! Mon rôle est d'être votre conseiller immobilier personnel au Maroc : je vous aide à dénicher le logement parfait (location ou achat), je réponds à toutes vos questions sur les quartiers et prix des villes marocaines, et j'estime vos coûts en toute transparence. Que souhaitez-vous savoir ?`;
    }
    return `I am ReserverDark's AI real estate assistant! Think of me as your local Moroccan property advisor: I help you search certified properties for rent or sale, provide neighborhood insights across Moroccan cities, calculate move-in budgets, and assess listing safety. How can I help you today?`;
  }

  // 3. CHITCHAT (kidayr / labas / cv / merci / chokran)
  if (intent === 'chitchat') {
    if (/\b(chokran|chokrane|merci|thanks|thank you|barak allah|lah ykhelik)\b/i.test(text) || /شكرا|بارك الله/.test(text)) {
      if (lang === 'darija') {
        return `L3afw khoya / khti, hada wajib! Ana dima f l-khidma dyalek. Ila bghiti t9elleb 3la chi 3aqar ola swelti 3la chi haja okhra, marhba f ay waqt!`;
      }
      if (lang === 'fr') {
        return `Avec grand plaisir ! N'hésitez pas si vous avez d'autres questions ou si vous souhaitez débuter une recherche. Je reste à votre disposition !`;
      }
      return `العفو بكل سرور! أنا دائماً في خدمتك لمساعدتك في أي وقت.`;
    }

    // Asking about status (kidayr, labas)
    if (lang === 'darija') {
      return `Lhamdullah rebbi ikhllik, koulchi bkhir o 3la khir! Ntmenna hta nta tkoun f a7san a7wal. Gol liya, chno bghiti nchoufo lyouma f l-3aqarat?`;
    }
    if (lang === 'fr') {
      return `Tout va très bien, merci beaucoup ! Et vous, comment allez-vous ? Que puis-je faire pour vous accompagner dans votre projet immobilier ?`;
    }
    return `الحمد لله بأفضل حال، شكراً لسؤالك اللطيف! كيف يمكنني مساعدتك اليوم في مشروعك السكني؟`;
  }

  // 4. PLATFORM FAQS (how to book, how to list, payment)
  if (intent === 'faq_platform') {
    if (/\b(kri|reserver|réserver|book|hajz|حجز|نكري|كيفاش نكري)\b/i.test(text)) {
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

    if (/\b(publier|zid|ajouter|moul|annonce|نشر|إعلان|نزيد)\b/i.test(text)) {
      if (lang === 'darija') {
        return `Ila 3ndek dar ola studio ola villa bghiti t-kriha ola tbi3ha f ReserverDark:
1. Dir Inscription / Connexion f le site.
2. Dkhol l espace 'Espace Propriétaire' ola 'Ajouter une propriété'.
3. 3emmer l-ma3loumat (titre, mdina, quartier, prix f lila ola f ch-har, o les équipements).
4. Zid des photos nqiyin o b daqqa 3aliya باش تجيب les clients b zzerba!
5. L'équipe d'administration kat-valider l'annonce bch tkoun certifiée.`;
      }
      return `Pour publier votre bien sur ReserverDark : connectez-vous, accédez à votre Espace Propriétaire, cliquez sur 'Ajouter une propriété', renseignez les détails avec de vraies photos nettes, et soumettez votre annonce pour validation rapide par l'administration.`;
    }
  }

  // 5. REAL ESTATE ADVICE (Caution / 3a9d lkra / Notaire)
  if (intent === 'real_estate_advice') {
    if (/\b(caution|daman|tsbi9|ضمان|ضمانة|تسبيق)\b/i.test(text)) {
      if (lang === 'darija') {
        return `F l-Meghrib (qanoun 67-12 dyal lkra):
- D-daman (la caution / dépôt de garantie) 3adatan kaykoun ch-har wahed (1 mois) f l-mahalat l-khawya (vide).
- O kaywsel l juj d-ch-hour (2 mois) f l-mahalat l-meublé.
- Mouhim bzaf: had l-mablagh khas ikoun mektoub f l-3a9d, o kaytrje3 lik kamel fash katsellem s-swaret ila kan l-mahal nqi bhal nhar lwel!`;
      }
      return `Concernant le dépôt de garantie (caution) au Maroc selon la loi 67-12 : il correspond généralement à 1 mois de loyer pour un logement vide et jusqu'à 2 mois pour un bien meublé. Il doit être obligatoirement mentionné dans le contrat et restitué à la sortie si le bien est rendu en bon état.`;
    }

    if (/\b(notaire|3adoul|frais|notari|موثق|عدول|مصاريف)\b/i.test(text)) {
      if (lang === 'darija') {
        return `F lbi3 o chra f l-Meghrib, masarif l-notaire (frais d'acquisition) ta9riban kaykouno bin 6% tal 7% mn taman l-3aqar:
- 4% Droits d'enregistrement (l-idara d-dara2ib)
- 1.5% Conservation foncière (t-tahfiz l-3aqari)
- 1% Honoraires du notaire + TVA
Wach bghiti n7seb lik l-masarif b daqqa l chi 3aqar f l-bal dyalek?`;
      }
      return `Pour un achat immobilier au Maroc, les frais de notaire et d'enregistrement s'élèvent globalement entre 6% et 7% du prix de vente (4% droits d'enregistrement, 1.5% conservation foncière, ~1% honoraires du notaire + formalités).`;
    }
  }

  // 6. CITY & REGIONAL GUIDES
  for (const [cityName, info] of Object.entries(MOROCCAN_CITIES_KNOWLEDGE)) {
    const cityRegex = new RegExp(`\\b${cityName.replace(/\s+/g, '\\s*')}\\b`, 'i');
    if (cityRegex.test(message) || (info.arabicName && message.includes(info.arabicName))) {
      if (lang === 'darija') {
        const neighborhoodsList = info.neighborhoods.map(n => `- ${n.name}: ${n.desc}`).join('\n');
        return `${info.overview_darija}

A7san l-a7yae fiha:
${neighborhoodsList}

As3ar lkra ta9riban:
- Studio: ${info.averageRent.studio}
- Appartement: ${info.averageRent.apartment}
- Villa: ${info.averageRent.villa || info.averageRent.villa_riad}

Wach bghiti nchouf lik chi 3aqar متوفر حالياً f ${cityName}? Gol liya chno l-mizaniya dyalek!`;
      }
      if (lang === 'fr') {
        const neighborhoodsList = info.neighborhoods.map(n => `- ${n.name} : ${n.desc}`).join('\n');
        return `Voici ce qu'il faut savoir sur ${cityName} :
${neighborhoodsList}

Loyers moyens constatés :
- Studio : ${info.averageRent.studio}
- Appartement : ${info.averageRent.apartment}
- Villa / Riad : ${info.averageRent.villa || info.averageRent.villa_riad}

Souhaitez-vous que je recherche un bien disponible à ${cityName} correspondant à votre budget ?`;
      }
    }
  }

  // 7. GENERAL BROWSING (User asks "werini chno 3ndkom", "montre moi les logements")
  if (intent === 'browse') {
    if (lang === 'darija') {
      return `Marhba bik! 3ndna kter men 100 3aqar mtno3 f mokhtalif modon l-Meghrib: Beni Mellal, Marrakech, Casablanca, Tanger, Rabat, Agadir, Essaouira...
Fiha appartements, studios, villas, riads taqlidiya o dyour.
Bach nwarik bdebt dakchi li kaynasbek:
1. Chmen mdina katfeddel?
2. Wach kat9elleb 3la lkra ola chra?
3. O chhal l-mizaniya dyalek ta9riban?`;
    }
    return `Bienvenue ! Nous disposons de 100 biens certifiés à travers le Maroc (Appartements, Studios, Villas, Riads traditionnels à Beni Mellal, Casablanca, Marrakech, Tanger...). Pour vous orienter vers la sélection parfaite : dans quelle ville cherchez-vous et quel est votre budget approximatif ?`;
  }

  // 7.5 FUN & MOROCCAN CULTURE & LANDMARKS
  if (/\b(nokita|nokat|nokta|joke|ضحك|نكتة)\b/i.test(text)) {
    return `Hada wahed bgha ykri dar, mcha 3nd moul l-3imara gal lih: "Chhal lkra?". Gal lih moul l-3imara: "2000 DH l ch-har lwel, o 1500 DH l ch-houra l-khrin". Noud l-kray gal lih: "Safy wakha, ana ghadi nji nskon 3ndk men ch-har t-tani!" 😂

Daba gol liya khoya, chno l-3aqar li kat9elleb 3lih bseh? 😉`;
  }

  if (/\b(asserdoun|aserdoun|عين\s*أسردون)\b/i.test(text)) {
    return `3in Asserdoun (Ain Asserdoun) jat f rejlin jbel Tassemmit f Beni Mellal! Manba3 ma2i se7ri b l-khdora o l-chlalat, o lfou9 kayn Qser Ain Asserdoun li fih vue panoramique wa3ra 3la l-mdina kamla o sehl Tadla. Mentaqa touristique hadya o zwiina bzaf l l-3a2ilat. Wach kat9elleb 3la chi appartement 9rib l 3in Asserdoun?`;
  }

  if (/\b(makla|chhiwat|tajin|couscous|أكل|طعام)\b/i.test(text)) {
    return `A7san makla f l-Meghrib bla chakk: t-tajin d-lhem b l-berqouq o l-louz, l-couscous b seb3 khdari d nhar jeme3a, o l-bastilla d-l7out! O dima berrad d-atay mche7er b n-n3na3 m3a l-3ser. Bach n-fouto l-khedma: kat9elleb 3la chi dar fiha cuisine équipée wa3ra l t-tyab?`;
  }

  // 8. GENERAL SMART HUMAN RESPONSE FALLBACK
  if (lang === 'darija') {
    return `Fhemtk khoya / khti! Ana m3ak bhal conseiller immobilier f l-Meghrib. T9der tgol liya ay haja:
- Wach bghiti n9elbo 3la chi appartement, studio ola villa f chi mdina mo3ayana (Beni Mellal, Marrakech, Casa...)?
- Ola 3ndek chi so'al 3la as3ar lkra, l-a7yae, ola tariqat l-krayen?
3tini les détails li f balek o ana nsa3dek f l-blast!`;
  }
  if (lang === 'fr') {
    return `J'ai bien compris votre demande. En tant que conseiller immobilier expert sur le Maroc, je peux vous orienter sur les prix des quartiers, vous assister dans vos démarches de location/achat, ou vous dénicher le logement parfait dans notre base. Précisez-moi votre ville de prédilection ou votre question !`;
  }
  return `I understand! As your personal real estate advisor in Morocco, I can help you find verified properties, advise you on Moroccan market rates, or guide you through neighborhood choices. Feel free to tell me what city you're interested in or what questions you have!`;
}
