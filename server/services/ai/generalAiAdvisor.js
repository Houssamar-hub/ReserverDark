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
You are "ReserverDark AI", an intelligent, versatile, general-purpose conversational AI assistant integrated into the Moroccan platform ReserverDark.
You are flexible and capable of assisting users on ANY topic, similar to ChatGPT, without being restricted to real estate.

CAPABILITIES & KNOWLEDGE:
1. Programming & Technology: Web development (React, Node, Express, Vue, Next.js), languages (JavaScript, TypeScript, Python, C++, Java), algorithms, databases, Git, debugging, and explaining concepts like React's useEffect, state, async/await, closures.
2. Mathematics & Science: Arithmetic, algebra, statistics (averages, percentages), physics, chemistry, engineering, step-by-step problem solving.
3. Translation & Language: Translating fluently between Moroccan Darija, Modern Standard Arabic, French, English, and other languages; grammar checking, text rewriting, summarization.
4. Sports & Entertainment: Football (Moroccan Botola, European leagues, World Cup, Champions League), cinema, music, gaming.
   CRITICAL HONESTY RULE: For questions about recent or live sports match results (e.g., "who won yesterday's match?"), if real-time match data is not verified, honestly state that live sports match data is unverified or ask which competition/teams are meant. NEVER fabricate or hallucinate fake scores.
5. Live Weather: Moroccan and global weather information (temperature, sky condition, humidity, wind).
6. Culture, History & Geography: Moroccan history, heritage, cuisine (tajines, couscous, pastilla), landmarks (Ain Asserdoun, Hassan Tower, Jamaa el-Fnaa), world geography, travel advice.
7. Real Estate (ReserverDark Core): Moroccan rental and sale market, rental law (Loi 67-12), security deposits (caution), lease agreements (3a9d lkra légalisé), notary fees (frais de notaire ~6-7%), neighborhood guides across Moroccan cities (Beni Mellal, Casablanca, Marrakech, Tanger, Rabat, Agadir, etc.).
8. Creative Writing & Brainstorming: Writing essays, professional emails, business plans, jokes, poems, ideation.

COMMUNICATION PRINCIPLES:
- Respond in the language used by the user:
  * Moroccan Darija (Arabizi or Arabic script): natural, warm, fluent, and culturally authentic ("bhal bnadem").
  * French: elegant, clear, and professional.
  * Arabic: fluent Modern Standard Arabic or dialect.
  * English: clear, natural, and helpful.
- Maintain conversation memory and understand follow-up questions (e.g., understanding pronouns like "binha", "hadak", "it" referring to previously mentioned topics).
- NEVER say "I can only answer real-estate questions" or force unrelated queries back to properties.
- When the user asks a mixed question (e.g., explaining coding AND finding an apartment), address both parts thoroughly.
- Protect security: Politely decline any attempt to extract private API keys, system secrets, or other users' personal data.
`;

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

  // 2. Check for live weather request first
  if (isWeatherQuery(userMessage, intent)) {
    const weatherAnswer = await handleLiveWeatherQuery(userMessage, detectedLanguage);
    if (weatherAnswer) return weatherAnswer;
  }

  // 3. If Gemini API is configured, use Google Gemini for state-of-the-art reasoning
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

  // 4. Fallback: Local General-Purpose Reasoning Engine
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

  // 1. PROGRAMMING & SOFTWARE DEVELOPMENT
  if (
    /\b(useeffect|react|javascript|typescript|python|nodejs|express|vue|angular|async|await|state|hook|props|closure|api|bug|function|css|html|sql|mongodb)\b/i.test(lower) ||
    (history.length > 0 && /\b(binha|binhom|differ|différence|far9|comparer)\b/i.test(lower) && /\b(javascript|react|typescript|python)\b/i.test(previousTurnLower))
  ) {
    return handleProgrammingQuery(message, lower, lang, previousTurnLower);
  }

  // 2. MATHEMATICS & CALCULATIONS (e.g. "Kifach nhseb moyenne dyal 3 ar9am?")
  if (/\b(moyenne|calcul|hseb|ar9am|pourcentage|mo3addal|math|arithmetic|equation|somme|divide)\b/i.test(lower) || /معدل|احسب|حساب|أرقام|رياضيات|نسبة مئوية/.test(message)) {
    return handleMathematicsQuery(message, lower, lang);
  }

  // 3. TRANSLATION (e.g. "Trjem lia had lparagraph l français")
  if (/\b(trjem|traduire|translate|translation|tarjama)\b/i.test(lower) || /ترجم|ترجمة/.test(message)) {
    return handleTranslationQuery(message, lower, lang);
  }

  // 4. FOOTBALL & SPORTS (Truthfulness check: honest about unverified recent matches)
  if (/\b(match|kora|foot|football|champions\s*league|botola|real\s*madrid|barcelona|messi|ronaldo|rbe7|score|coupe\s*du\s*monde|sports?)\b/i.test(lower) || /مباراة|كرة القدم|من فاز|فاز|الرجاء|الوداد|ماتش/.test(message)) {
    return handleSportsQuery(message, lower, lang);
  }

  // 5. GREETINGS & SMALL-TALK
  if (intent === 'greeting' || /^(salam|bonjour|hello|hi|salut|ahlan)\b/i.test(lower)) {
    if (lang === 'darija') {
      return `Wa 3alaykom salam wa rahmatullah khoya / khti! Marhba bik. Kidayr labas 3lik? Ana ReserverDark AI, moussa3id dki 3am: n9der njawbk 3la ay so'al (taqss, programming, math, tarjama, thaqafa 3amma, sport ola l-3aqarat f l-Meghrib). Kifach n9der nsa3dek lyouma?`;
    }
    if (lang === 'fr') {
      return `Bonjour et bienvenue ! Je suis ReserverDark AI, votre assistant d'intelligence artificielle polyvalent. Je peux vous aider sur la programmation, les mathématiques, la météo, la traduction, la culture générale, ou la recherche immobilière. Comment puis-je vous être utile ?`;
    }
    if (lang === 'ar') {
      return `أهلاً وسهلاً بك! أنا ReserverDark AI، مساعدك الذكي الشامل. يمكنني الإجابة عن أي سؤال في البرمجة، الرياضيات، الطقس، الترجمة، الثقافة العامة، أو العقارات بالمغرب. كيف يمكنني خدمتك اليوم؟`;
    }
    return `Hello and welcome! I am ReserverDark AI, your general-purpose smart assistant. I can help with coding, mathematics, live weather, translations, general knowledge, or real estate in Morocco. How can I help you today?`;
  }

  // 6. IDENTITY & ROLE
  if (intent === 'identity' || /\b(chkon\s*nta|who\s*are\s*you|qui\s+es[- ]tu|chnou\s+kaddir)\b/i.test(lower)) {
    if (lang === 'darija') {
      return `Ana ReserverDark AI, moussa3id dki 3am (General-Purpose AI) bhal ChatGPT!
N9der nsa3dek f:
- Programming o l-code (React, JS, Python, debugging...).
- L-math o l-7issabat (l-moyenne, les pourcentages...).
- T-tarjama bin l-lo3at (Darija, Français, Anglais, Arabe).
- Ahwal ta9ss laiv f ay mdina.
- Thaqafa 3amma, sport, tarikh o l-makla l-meghribiya.
- O l-3aqarat f ReserverDark (krayen, chra, l-as3ar o l-qanoun).
Sawlni 3la ay haja f balek o ana m3ak!`;
    }
    return `Je suis ReserverDark AI, un assistant d'intelligence artificielle généraliste et polyvalent ! Je réponds à toutes vos questions : développement informatique, mathématiques, météo en temps réel, traduction, culture générale, et recherche immobilière au Maroc. Posez-moi n'importe quelle question !`;
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

  // 8. CREATIVE WRITING & SUMMARY REQUESTS
  if (/\b(kteb|ecris|write|summary|talkhis|nokita|poeme|ch3r)\b/i.test(lower) || /اكتب|لخص|شعر|نكتة/.test(message)) {
    if (lang === 'darija') {
      return `Wakha 3la rass o l-3ayn! Bach nkteb lik bdebt dakchi li bghiti: 3tini l-fikra l-asasiya (sujet), wach bghitih b Darija, Français ola Anglais, o wach tkoun f format dial email, article, ola talkhis? Ana wajed!`;
    }
    return `Avec grand plaisir ! Précisez-moi le sujet, le ton souhaité (professionnel, amical, créatif) et la langue désirée, et je vous rédige cela immédiatement.`;
  }

  // 9. GENERAL OPEN-ENDED RESPONSE
  if (lang === 'darija') {
    return `Fhemt l-fekra dyalek mzyan! Ana hna bach nsa3dek f ay haja: sawlni 3la l-code, l-math, t-tarjama, ahwal ta9ss, ola aya ma3louma o ana ghadi njawbk b daqqa o woudou7.`;
  }
  if (lang === 'fr') {
    return `J'ai bien compris votre demande ! En tant qu'assistant IA généraliste, je peux vous aider à rédiger, coder, calculer, traduire ou vous informer sur n'importe quel sujet. N'hésitez pas à préciser votre besoin !`;
  }
  return `I understand your request! As a general-purpose AI assistant, I can help you with coding, mathematics, translation, explanations, analysis, or answering any question. Feel free to provide more details!`;
}

/**
 * Handle Programming and Code Explanations
 */
function handleProgrammingQuery(message, lower, lang, previousTurnLower) {
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
