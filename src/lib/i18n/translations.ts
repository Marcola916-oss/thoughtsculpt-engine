import type { Lang } from "./types";

/**
 * MindReset translations.
 * Use {name} as placeholder for the user's name.
 * Quiz options are short — the long-form sales copy lives separately.
 */
export type Dict = {
  meta: { title: string; description: string };
  common: {
    continue: string; back: string; start: string; next: string; loading: string;
    accept: string; essential: string; required: string; email: string; emailPlaceholder: string;
    yourName: string; yourNamePlaceholder: string; selectGender: string;
    male: string; female: string; neutral: string;
    gdpr: string; privacy: string; terms: string; login: string; logout: string;
  };
  hero: { kicker: string; headline: string; sub: string; cta: string; trust: string };
  identity: { title: string; sub: string };
  questions: { title: (n: number, total: number) => string; intro: (name: string) => string };
  q: Array<{ q: string; options: string[] }>;
  emailCapture: { title: (name: string) => string; sub: string; cta: string };
  loader: { steps: string[] };
  archetypes: Record<"AO" | "SS" | "EA" | "HI", { name: string; tagline: string; hooks: string[] }>;
  reveal: { kicker: (name: string) => string; sub: string; cta: string };
  sales: {
    h1: (name: string, arch: string) => string;
    promise: string;
    bullets: string[];
    why: string;
    whyBody: string;
    cta: string;
  };
  plans: {
    title: string; sub: string; mostPopular: string; perDay: (v: string) => string;
    p30: string; p6m: string; p1y: string;
    chooseCta: string; guarantee: string;
  };
  share: { title: (name: string, arch: string) => string; cta: string; views: (n: number) => string };
  legal: { privacyBody: string; termsBody: string };
  cookies: { body: string };
};

const PT: Dict = {
  meta: { title: "MindReset — Descobre o teu arquétipo financeiro", description: "Diagnóstico comportamental que revela porque ganhas, gastas e perdes dinheiro como ganhas." },
  common: {
    continue: "Continuar", back: "Voltar", start: "Começar agora", next: "Seguinte", loading: "A processar…",
    accept: "Aceitar tudo", essential: "Apenas essenciais", required: "Obrigatório",
    email: "E-mail", emailPlaceholder: "tuemail@exemplo.com",
    yourName: "O teu primeiro nome", yourNamePlaceholder: "Ex.: Sofia",
    selectGender: "Como te identificas?", male: "Masculino", female: "Feminino", neutral: "Prefiro não dizer",
    gdpr: "Aceito a Política de Privacidade e a partilha de dados para personalizar o meu diagnóstico.",
    privacy: "Privacidade", terms: "Termos", login: "Entrar", logout: "Sair",
  },
  hero: {
    kicker: "Finanças comportamentais • 14 perguntas • 3 minutos",
    headline: "O dinheiro não te falta. Falta-te conhecer o teu padrão.",
    sub: "MindReset diagnostica o teu arquétipo financeiro e entrega um protocolo personalizado de ação. Sem orçamentos. Sem ligação bancária. Só psicologia que muda comportamento.",
    cta: "Fazer o diagnóstico grátis",
    trust: "+12.000 diagnósticos • Sem cartão para começar",
  },
  identity: { title: "Antes de começar, quem és tu?", sub: "Vamos usar o teu nome ao longo do diagnóstico para o tornar pessoal." },
  questions: {
    title: (n, total) => `Pergunta ${n} de ${total}`,
    intro: (name) => `${name}, escolhe a opção que mais se parece contigo — não há respostas erradas.`,
  },
  q: [
    { q: "Recebes uma quantia inesperada equivalente ao teu salário. Qual é o teu primeiro impulso?",
      options: ["Guardo quase tudo — segurança em primeiro lugar","Aproveito para algo que vai impressionar quem está à minha volta","Deixo na conta e tento não pensar nisso","Compro o que sempre quis — vivo agora, planeio depois"] },
    { q: "Quando gastas mais do que devias, o gatilho costuma ser:",
      options: ["Medo de que o dinheiro não chegue (e gasto a controlar)","Pressão social ou desejo de pertencer","Cansaço, evitar pensar em dinheiro","Emoção do momento — vejo, quero, levo"] },
    { q: "Quando pensas no teu futuro financeiro sentes sobretudo:",
      options: ["Ansiedade — preciso de mais, sempre","Preocupação com a imagem que vou conseguir manter","Bloqueio — prefiro não pensar","Otimismo — algo se resolve"] },
    { q: "No fim do mês a tua conta normalmente está:",
      options: ["Com mais do que esperavas — poupaste demais","Vazia depois de subscrições, jantares, marcas","Não sei ao certo — não confiro","Vazia, mas valeu cada momento"] },
    { q: "Antes de uma compra importante tu:",
      options: ["Pesquisas durante semanas, comparas tudo","Pensas no que vão dizer/notar","Compras rápido para tirar do caminho","Decides no impulso, com o coração"] },
    { q: "A palavra que melhor descreve a tua relação com dinheiro é:",
      options: ["Controlo","Estatuto","Evasão","Liberdade"] },
    { q: "A tua maior aspiração financeira é:",
      options: ["Acumular uma reserva que nunca acabe","Mostrar resultados visíveis às pessoas certas","Esquecer o dinheiro e viver tranquilo","Experimentar tudo o que a vida oferece"] },
    { q: "Se pudesses mudar UMA coisa no teu comportamento financeiro seria:",
      options: ["Parar de viver em modo escassez","Comprar por mim e não pelos outros","Olhar para as minhas contas sem fugir","Conseguir adiar uma compra por 24h"] },
  ],
  emailCapture: {
    title: (name) => `${name}, o teu diagnóstico está pronto.`,
    sub: "Indica o teu e-mail para receberes o relatório completo e desbloquear a tua página de arquétipo.",
    cta: "Ver o meu arquétipo",
  },
  loader: { steps: [
    "A cruzar 8 respostas com 4 arquétipos…",
    "A identificar o teu padrão dominante…",
    "A preparar a tua revelação…",
  ] },
  archetypes: {
    AO: { name: "Acumulador Obsessivo", tagline: "Vives em modo escassez — mesmo quando há.",
      hooks: ["Poupas mas nunca te sentes seguro","Sentes culpa quando gastas em ti","Trocas presente por um futuro que nunca chega"] },
    SS: { name: "Status Seeker", tagline: "Compras a versão de ti que queres que os outros vejam.",
      hooks: ["Gastas para sinalizar pertença","Tens medo de parecer pequeno","Trocas conta corrente por validação"] },
    EA: { name: "Evasivo Alienado", tagline: "O dinheiro existe — tu evitas olhar.",
      hooks: ["Não abres extratos","Decides rápido para acabar com o desconforto","Pagas a paz com juros invisíveis"] },
    HI: { name: "Hedonista Impulsivo", tagline: "Vives o agora — e o agora é sempre caro.",
      hooks: ["Compras pela emoção, justificas depois","Adiar parece-te perder","Tens tudo, menos margem"] },
  },
  reveal: { kicker: (name) => `${name}, o teu arquétipo é:`, sub: "Isto não é sorte. É um padrão — e padrões mudam-se.", cta: "Quero o meu protocolo" },
  sales: {
    h1: (name, arch) => `${name}, foi por isto que nada do que tentaste antes funcionou.`,
    promise: "Em 30 dias, vais reconhecer o gatilho antes de ele acontecer.",
    bullets: [
      "Diagnóstico psicológico em 4 dimensões (financeira, profissional, romântica, pessoal)",
      "Matriz de Ação: 30 dias de tarefas pessoais e executáveis",
      "Compass: analisa o arquétipo de quem te rodeia",
      "Progresso gamificado — streaks, conquistas, relatórios mensais",
    ],
    why: "Porque isto funciona quando dietas financeiras falham",
    whyBody: "Orçamentos atacam o sintoma. MindReset trabalha o padrão — primeiro a psicologia, depois a ação. É por isso que pessoas com o teu arquétipo mantêm o protocolo onde outras técnicas duraram 3 dias.",
    cta: "Escolher o meu plano",
  },
  plans: {
    title: "Escolhe a duração do teu Reset", sub: "Subscrição recorrente. Cancelas quando quiseres.",
    mostPopular: "MAIS POPULAR", perDay: (v) => `${v} / dia`,
    p30: "30 dias", p6m: "6 meses", p1y: "1 ano",
    chooseCta: "Começar agora",
    guarantee: "7 dias de reembolso integral — sem perguntas.",
  },
  share: { title: (name, arch) => `${name} é ${arch}.`, cta: "Descobre o teu arquétipo", views: (n) => `${n} pessoas viram` },
  legal: {
    privacyBody: "MindReset recolhe nome, e-mail, respostas ao quiz e dados de geolocalização aproximada (país) para personalizar o diagnóstico. Não vendemos os teus dados. Podes solicitar exportação ou eliminação a qualquer momento em privacy@mindreset.app. Retenção: 24 meses após o último login.",
    termsBody: "MindReset oferece análise comportamental educativa. NÃO substitui aconselhamento médico, psicológico ou financeiro profissional. Subscrições renovam automaticamente. Direito a reembolso integral nos primeiros 7 dias após a primeira compra. Cancelamento disponível a qualquer momento no portal de cliente.",
  },
  cookies: { body: "Usamos tecnologias de localização para personalizar a tua experiência. Ao continuar concordas com a nossa Política de Privacidade." },
};

// English (master fallback)
const EN: Dict = {
  meta: { title: "MindReset — Discover your financial archetype", description: "A behavioral diagnosis that reveals why you earn, spend and lose money the way you do." },
  common: {
    continue: "Continue", back: "Back", start: "Start now", next: "Next", loading: "Processing…",
    accept: "Accept all", essential: "Essential only", required: "Required",
    email: "Email", emailPlaceholder: "you@example.com",
    yourName: "Your first name", yourNamePlaceholder: "e.g. Alex",
    selectGender: "How do you identify?", male: "Male", female: "Female", neutral: "Prefer not to say",
    gdpr: "I accept the Privacy Policy and consent to data use to personalize my diagnosis.",
    privacy: "Privacy", terms: "Terms", login: "Log in", logout: "Log out",
  },
  hero: {
    kicker: "Behavioral finance • 14 questions • 3 minutes",
    headline: "It's not the money. It's the pattern you can't see.",
    sub: "MindReset diagnoses your financial archetype and ships a personalized action protocol. No budgets. No bank linking. Just psychology that changes behavior.",
    cta: "Take the free diagnosis",
    trust: "+12,000 diagnoses • No card to start",
  },
  identity: { title: "Before we start — who are you?", sub: "We'll use your name throughout the diagnosis to make it personal." },
  questions: {
    title: (n, total) => `Question ${n} of ${total}`,
    intro: (name) => `${name}, pick the option that sounds most like you — no wrong answers.`,
  },
  q: [
    { q: "You receive an unexpected sum equal to your salary. First impulse?",
      options: ["Save almost all of it — safety first","Spend on something that will impress those around me","Leave it in the account and try not to think about it","Buy what I've always wanted — live now, plan later"] },
    { q: "When you overspend, the trigger is usually:",
      options: ["Fear money won't last (and I spend to control)","Social pressure or wanting to belong","Tiredness — avoiding thinking about money","Heat of the moment — see it, want it, take it"] },
    { q: "Thinking about your financial future you mostly feel:",
      options: ["Anxious — I need more, always","Worried about the image I can keep up","Blocked — I'd rather not think","Optimistic — it'll work out"] },
    { q: "At month's end your account is usually:",
      options: ["More than expected — you saved too much","Empty after subscriptions, dinners, brands","Not sure — I don't check","Empty, but worth every moment"] },
    { q: "Before a major purchase you:",
      options: ["Research for weeks, compare everything","Think about what others will notice","Buy fast to get it over with","Decide on impulse, with your heart"] },
    { q: "The word that best describes your relationship with money is:",
      options: ["Control","Status","Escape","Freedom"] },
    { q: "Your biggest financial aspiration is:",
      options: ["Build a reserve that never ends","Show visible results to the right people","Forget money and live in peace","Experience everything life offers"] },
    { q: "If you could change ONE thing in your money behavior it would be:",
      options: ["Stop living in scarcity mode","Buy for me, not for others","Look at my bills without running","Delay one purchase by 24h"] },
  ],
  emailCapture: {
    title: (name) => `${name}, your diagnosis is ready.`,
    sub: "Drop your email to receive the full report and unlock your archetype page.",
    cta: "Reveal my archetype",
  },
  loader: { steps: [
    "Cross-checking 8 answers across 4 archetypes…",
    "Identifying your dominant pattern…",
    "Preparing your reveal…",
  ] },
  archetypes: {
    AO: { name: "Obsessive Accumulator", tagline: "You live in scarcity mode — even when there's plenty.",
      hooks: ["You save but never feel safe","You feel guilty spending on yourself","You trade today for a future that never arrives"] },
    SS: { name: "Status Seeker", tagline: "You buy the version of you you want others to see.",
      hooks: ["You spend to signal belonging","You're afraid of looking small","You trade balance for validation"] },
    EA: { name: "Avoidant Escapist", tagline: "Money exists — you choose not to look.",
      hooks: ["You don't open statements","You decide fast to end the discomfort","You pay for peace with invisible interest"] },
    HI: { name: "Impulsive Hedonist", tagline: "You live for now — and now is always expensive.",
      hooks: ["You buy with emotion, justify after","Delay feels like losing","You have everything except margin"] },
  },
  reveal: { kicker: (name) => `${name}, your archetype is:`, sub: "This isn't luck. It's a pattern — and patterns can change.", cta: "I want my protocol" },
  sales: {
    h1: (name, arch) => `${name}, this is why nothing you tried before worked.`,
    promise: "In 30 days you'll recognize the trigger before it happens.",
    bullets: [
      "Psychological diagnosis across 4 dimensions (financial, professional, romantic, personal)",
      "Action Matrix: 30 days of personal, executable tasks",
      "Compass: analyze the archetype of people around you",
      "Gamified progress — streaks, achievements, monthly reports",
    ],
    why: "Why this works where financial diets fail",
    whyBody: "Budgets attack the symptom. MindReset works the pattern — psychology first, then action. That's why people with your archetype stick with it where other tools lasted 3 days.",
    cta: "Choose my plan",
  },
  plans: {
    title: "Choose your Reset length", sub: "Recurring subscription. Cancel anytime.",
    mostPopular: "MOST POPULAR", perDay: (v) => `${v} / day`,
    p30: "30 days", p6m: "6 months", p1y: "1 year",
    chooseCta: "Start now",
    guarantee: "7-day full refund — no questions asked.",
  },
  share: { title: (name, arch) => `${name} is ${arch}.`, cta: "Discover your archetype", views: (n) => `${n} people viewed` },
  legal: {
    privacyBody: "MindReset collects name, email, quiz answers and approximate geolocation (country) to personalize your diagnosis. We never sell your data. Export and deletion requests: privacy@mindreset.app. Retention: 24 months after last login.",
    termsBody: "MindReset provides educational behavioral analysis. It does NOT replace professional medical, psychological or financial advice. Subscriptions auto-renew. Full refund within 7 days of first purchase. Cancel anytime from the customer portal.",
  },
  cookies: { body: "We use location technologies to personalize your experience. By continuing you agree to our Privacy Policy." },
};

const PL: Dict = {
  ...EN,
  meta: { title: "MindReset — Poznaj swój finansowy archetyp", description: "Diagnoza behawioralna, która pokazuje dlaczego zarabiasz, wydajesz i tracisz pieniądze tak jak teraz." },
  common: { ...EN.common,
    continue: "Dalej", back: "Wstecz", start: "Zacznij teraz", next: "Dalej", loading: "Przetwarzanie…",
    accept: "Akceptuję wszystko", essential: "Tylko niezbędne", required: "Wymagane",
    yourName: "Twoje imię", yourNamePlaceholder: "np. Anna",
    selectGender: "Jak się określasz?", male: "Mężczyzna", female: "Kobieta", neutral: "Wolę nie mówić",
    gdpr: "Akceptuję Politykę Prywatności i wyrażam zgodę na przetwarzanie danych w celu personalizacji diagnozy.",
    privacy: "Prywatność", terms: "Regulamin", login: "Zaloguj", logout: "Wyloguj",
  },
  hero: {
    kicker: "Finanse behawioralne • 14 pytań • 3 minuty",
    headline: "To nie pieniądze. To wzorzec, którego nie widzisz.",
    sub: "MindReset diagnozuje Twój finansowy archetyp i dostarcza spersonalizowany protokół działania. Bez budżetów. Bez łączenia z bankiem. Tylko psychologia, która zmienia zachowanie.",
    cta: "Zrób darmową diagnozę",
    trust: "+12 000 diagnoz • Bez karty na start",
  },
  identity: { title: "Zanim zaczniemy — kim jesteś?", sub: "Użyjemy Twojego imienia w całej diagnozie, żeby była osobista." },
  questions: { title: (n, total) => `Pytanie ${n} z ${total}`, intro: (name) => `${name}, wybierz odpowiedź najbliższą Tobie — nie ma złych.` },
  emailCapture: { title: (name) => `${name}, Twoja diagnoza jest gotowa.`, sub: "Podaj e-mail, aby otrzymać pełny raport i odblokować stronę archetypu.", cta: "Pokaż mój archetyp" },
  loader: { steps: ["Krzyżuję 8 odpowiedzi z 4 archetypami…","Identyfikuję dominujący wzorzec…","Przygotowuję wynik…"] },
  reveal: { kicker: (name) => `${name}, Twój archetyp to:`, sub: "To nie przypadek. To wzorzec — a wzorce można zmieniać.", cta: "Chcę swój protokół" },
  plans: { ...EN.plans, title: "Wybierz długość swojego Resetu", sub: "Subskrypcja odnawialna. Anulujesz kiedy chcesz.", mostPopular: "NAJPOPULARNIEJSZE", p30: "30 dni", p6m: "6 miesięcy", p1y: "1 rok", chooseCta: "Zacznij teraz", guarantee: "7 dni pełnego zwrotu — bez pytań." },
  cookies: { body: "Używamy technologii lokalizacyjnych do personalizacji Twojego doświadczenia. Kontynuując zgadzasz się z naszą Polityką Prywatności." },
};

const RO: Dict = {
  ...EN,
  meta: { title: "MindReset — Descoperă-ți arhetipul financiar", description: "O diagnoză comportamentală care arată de ce câștigi, cheltui și pierzi banii așa cum o faci." },
  common: { ...EN.common,
    continue: "Continuă", back: "Înapoi", start: "Începe acum", next: "Mai departe", loading: "Se procesează…",
    accept: "Accept tot", essential: "Doar esențiale", required: "Obligatoriu",
    yourName: "Prenumele tău", yourNamePlaceholder: "ex. Andrei",
    selectGender: "Cum te identifici?", male: "Masculin", female: "Feminin", neutral: "Prefer să nu spun",
    gdpr: "Accept Politica de Confidențialitate și prelucrarea datelor pentru personalizarea diagnozei.",
    privacy: "Confidențialitate", terms: "Termeni", login: "Autentificare", logout: "Ieșire",
  },
  hero: {
    kicker: "Finanțe comportamentale • 14 întrebări • 3 minute",
    headline: "Nu sunt banii. E tiparul pe care nu-l vezi.",
    sub: "MindReset îți diagnostichează arhetipul financiar și îți livrează un protocol personalizat. Fără bugete. Fără cont bancar. Doar psihologie care schimbă comportamentul.",
    cta: "Fă diagnoza gratuită",
    trust: "+12.000 de diagnoze • Fără card pentru a începe",
  },
  identity: { title: "Înainte să începem — cine ești?", sub: "Vom folosi prenumele tău în toată diagnoza ca să fie personală." },
  questions: { title: (n, total) => `Întrebarea ${n} din ${total}`, intro: (name) => `${name}, alege opțiunea care îți seamănă cel mai mult — nu există răspunsuri greșite.` },
  emailCapture: { title: (name) => `${name}, diagnoza ta este gata.`, sub: "Lasă e-mailul pentru a primi raportul complet și a-ți debloca pagina arhetipului.", cta: "Vezi-mi arhetipul" },
  loader: { steps: ["Cross-check pe 8 răspunsuri și 4 arhetipuri…","Identific tiparul dominant…","Pregătesc revelația…"] },
  reveal: { kicker: (name) => `${name}, arhetipul tău este:`, sub: "Nu e noroc. E un tipar — iar tiparele se schimbă.", cta: "Vreau protocolul meu" },
  plans: { ...EN.plans, title: "Alege durata Resetului", sub: "Abonament recurent. Anulezi oricând.", mostPopular: "CEL MAI ALES", p30: "30 zile", p6m: "6 luni", p1y: "1 an", chooseCta: "Începe acum", guarantee: "7 zile rambursare integrală — fără întrebări." },
  cookies: { body: "Folosim tehnologii de localizare pentru a-ți personaliza experiența. Continuând ești de acord cu Politica noastră de Confidențialitate." },
};

const AR: Dict = {
  ...EN,
  meta: { title: "MindReset — اكتشف نمطك المالي", description: "تشخيص سلوكي يكشف لماذا تكسب وتنفق وتخسر المال بهذه الطريقة." },
  common: { ...EN.common,
    continue: "متابعة", back: "رجوع", start: "ابدأ الآن", next: "التالي", loading: "جارٍ المعالجة…",
    accept: "أوافق على الكل", essential: "الضروري فقط", required: "مطلوب",
    email: "البريد الإلكتروني", emailPlaceholder: "you@example.com",
    yourName: "اسمك الأول", yourNamePlaceholder: "مثال: أحمد",
    selectGender: "كيف تعرّف نفسك؟", male: "ذكر", female: "أنثى", neutral: "أفضّل عدم القول",
    gdpr: "أوافق على سياسة الخصوصية واستخدام بياناتي لتخصيص التشخيص.",
    privacy: "الخصوصية", terms: "الشروط", login: "تسجيل الدخول", logout: "خروج",
  },
  hero: {
    kicker: "السلوك المالي • ١٤ سؤالاً • ٣ دقائق",
    headline: "ليست المشكلة في المال. المشكلة في النمط الذي لا تراه.",
    sub: "MindReset يشخّص نمطك المالي ويقدّم بروتوكول عمل مخصّصاً لك. بدون ميزانيات. بدون ربط بنكي. علم نفس يغيّر السلوك.",
    cta: "ابدأ التشخيص المجاني",
    trust: "+12,000 تشخيص • بدون بطاقة للبدء",
  },
  identity: { title: "قبل أن نبدأ — من أنت؟", sub: "سنستخدم اسمك خلال التشخيص ليكون شخصياً." },
  questions: { title: (n, total) => `السؤال ${n} من ${total}`, intro: (name) => `${name}، اختر الإجابة الأقرب لك — لا توجد إجابة خاطئة.` },
  emailCapture: { title: (name) => `${name}، تشخيصك جاهز.`, sub: "أدخل بريدك لاستلام التقرير الكامل وفتح صفحة نمطك.", cta: "اعرض نمطي" },
  loader: { steps: ["مقارنة ٨ إجابات بـ٤ أنماط…","تحديد النمط المهيمن…","تجهيز النتيجة…"] },
  reveal: { kicker: (name) => `${name}، نمطك هو:`, sub: "ليس صدفة. إنه نمط — والأنماط تتغيّر.", cta: "أريد بروتوكولي" },
  plans: { ...EN.plans, title: "اختر مدة الـ Reset", sub: "اشتراك متجدّد. يمكنك الإلغاء في أي وقت.", mostPopular: "الأكثر شعبية", p30: "٣٠ يوماً", p6m: "٦ أشهر", p1y: "سنة", chooseCta: "ابدأ الآن", guarantee: "استرداد كامل خلال ٧ أيام — بدون أسئلة." },
  cookies: { body: "نستخدم تقنيات الموقع لتخصيص تجربتك. بالمتابعة فإنك توافق على سياسة الخصوصية." },
};

export const translations: Record<Lang, Dict> = { pt: PT, en: EN, pl: PL, ro: RO, ar: AR };