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
    securePayment: string; processing: string;
    nav: { home: string; diagnosis: string; actionMatrix: string; compass: string; progress: string; settings: string; notifications: string };
    success: { loading: string; errorTitle: string };
  };
  login: {
    enterEmailFirst: string; checkInbox: string; forgotPassword: string;
    subscriptionEnded: string; subscriptionRenew: string;
  };
  notFound: { title: string; desc: string; goHome: string };
  errorPage: { title: string; desc: string; tryAgain: string; goHome: string };
  hero: { kicker: string; headline: string; sub: string; cta: string; microcopy: string; trust: string; trustSsl: string; trustData: string; trustGuarantee: string };
  features: { title: string; subtitle: string };
  landing: {
    proofBar: {
      ariaLabel: string;
      diagnostics: { value: string; label: string };
      rating: { value: string; label: string };
      noBank: { value: string; label: string };
      languages: { value: string; label: string };
    };
    beliefBreak: {
      tag: string;
      title: string;
      intro: string;
      cards: Array<{ author: string; quote: string; insight: string }>;
      punchline: string;
    };
    archetypes: {
      tag: string; title: string; sub: string;
      items: Record<"AO" | "SS" | "EA" | "HI", { name: string; trigger: string; desc: string }>;
    };
    howItWorks: {
      tag: string; title: string; sub: string;
      steps: Array<{ title: string; desc: string }>;
    };
    features: {
      tag: string; title: string;
      items: Array<{ icon: string; title: string; desc: string; meta: string }>;
    };
    testimonials: {
      tag: string; title: string;
      starsAlt: (n: number) => string;
      items: Array<{ stars: number; quote: string; name: string; arch: string }>;
    };
    faq: {
      tag: string; title: string; sub: string; cta: string;
      items: Array<{ q: string; a: string }>;
    };
    finalCta: { titleBefore: string; titleHighlight: string; titleAfter: string; sub: string; cta: string; guarantee: string; trustLine: string };
  };

  identity: { title: string; sub: string };
  questions: { title: (n: number, total: number) => string; intro: (name: string) => string };
  q: Array<{ q: string; options: string[] }>;
  emailCapture: { title: (name: string) => string; sub: string; cta: string };
  quizProgress: { identity: string; email: string };
  loader: { title: string; steps: string[]; analysis: string[] };
  archetypes: Record<"AO" | "SS" | "EA" | "HI", { name: string; tagline: string; hooks: string[] }>;
  reveal: {
    kicker: (name: string) => string; sub: string; cta: string; share: string;
    errorTitle: string; errorBody: string; errorRetry: string;
    comparison: (name: string, arch: string) => string;
    areasTitle: string;
    areasIntro: (name: string) => string;
    areas: Record<
      "money" | "career" | "love" | "personal",
      {
        label: string;
        byArch: Record<"AO" | "SS" | "EA" | "HI", string>;
      }
    >;
    areasCta: string;
    anchor: (arch: string) => string;
    urgency: string;
    guarantee: string;
    finalTitle: (name: string) => string;
    finalSub: string;
    finalCta: string;
  };
  sales: {
    h1: (name: string, arch: string) => string;
    promise: string;
    videoPlaceholder: string;
    painBlock: { title: string; body: string; bullets: string[]; conclusion: string };
    science: { title: string; body: string; references: string; pivot: string; solution: string };
    features: Array<{ icon: string; title: string; description: string }>;
    howItWorks: { title: string; steps: Array<{ num: string; title: string; description: string }> };
    socialProof: {
      counterText: string;
      testimonials: Array<{ quote: string; author: string; country: string }>;
      ratingText: string;
    };
    faq: Array<{ q: string; a: string }>;
    guarantee: { title: string; body: string };
    ctaFinal: { title: string; subtitle: string; cta: string; trust: string };
    cta: string;
    timer: string;
  };
  plans: {
    title: string; sub: string; mostPopular: string; perDay: (v: string) => string;
    p30: string; p6m: string; p1y: string;
    chooseCta: string; guarantee: string;
    features: { diagnosis: string; matrix: string; compass: string; gamification: string };
    secureBadge: string;
  };
  share: { title: (name: string, arch: string) => string; cta: string; views: (n: number) => string };
  legal: { privacyBody: string; termsBody: string };
  cookies: { body: string };
  dashboard: {
    hub: {
      greeting: (hour: string) => string;
      headingWithArchetype: (arch: string) => string;
      headingFallback: string;
      cards: {
        diagnosis: { title: string; desc: string; cta: string };
        calendar: { title: string; desc: string; cta: string };
        compass: { title: string; desc: string; cta: string };
        progress: { title: string; desc: (points: number) => string; cta: string };
      };
      badges: { new: string; today: string };
      stats: { points: string; streak: string; tasks: string };
      quotes: Record<"AO" | "SS" | "EA" | "HI", string>;
      recentActivity: { title: string; viewAll: string };
    };
    progress: {
      pageTitle: string; pageSubtitle: string;
      streak: { currentLabel: string; daysCount: (n: number) => string; emptyPrompt: string };
      points: { label: string; nextReward: (n: number) => string; redeem: string; insufficient: string; redeemed: string };
      consistencyGrid: {
        title: string; completedDays: (done: number, total: number) => string;
        dayLabel: string; stateCompleted: string; stateMilestone: string; statePending: string; stateLocked: string;
        legendLocked: string; legendPending: string; legendCompleted: string; legendMilestone: string;
      };
      consistencyBadge: { beginner: string; constant: string; disciplined: string; unstoppable: string; master: string };
      achievements: {
        title: string; unlocked: string;
        ACH_001: { name: string; desc: string }; ACH_002: { name: string; desc: string };
        ACH_003: { name: string; desc: string }; ACH_004: { name: string; desc: string };
        ACH_005: { name: string; desc: string }; ACH_006: { name: string; desc: string };
      };
      report: {
        widgetTitle: string; comingSoon: string; readyFallback: string; notYetAvailable: string; viewFull: string;
        monthlyReportLabel: (month: number) => string; behavioralEvolution: string;
        scoreDescription: (score: number) => string; monthAnalysis: string;
        patternIdentified: string; nextMonthFocus: string; generatedOn: string;
      };
      donut: { points: string; remaining: string };
    };
    diagnosis: {
      tabs: { financial: string; professional: string; romantic: string; personal: string };
      empty: { heading: string; description: string };
      generating: string; unlockButton: string;
      share: { clipboardMessage: (name: string, url: string) => string; whatsappMessage: (name: string, url: string) => string };
      result: { heading: string; generatedOn: string };
      actions: { downloadPdf: string; copied: string; copyLink: string; whatsapp: string };
      disclaimer: string;
      pdf: { header: string; footer: string };
    };
    calendar: {
      pageTitle: string;
      empty: { heading: string; description: string };
      emptyState: { hint: string };
      generating: string; generateButton: string;
      monthTab: (m: number) => string;
      grid: { dayLabel: string; lockedLabel: string };
      sidebar: { phaseLabel: (phase: string) => string; dayHeading: (day: number) => string; milestoneBadge: string };
      reflectiveLabel: string; actionLabel: string;
      checkboxes: { instruction: string; reflectiveCompleted: string; actionCompleted: string; almostThere: string };
      undoButton: string;
      journal: { label: string; placeholder: string };
      export: { button: string; csvOption: string; csvHeader: string; yes: string; no: string; markdownDay: (n: number) => string; markdownReflection: string; markdownAction: string };
      ics: { calName: string; daySummary: (n: number, phase: string) => string; reflective: string; action: string; milestone: string; alarmDesc: string };
    };
    compass: {
      subtitle: string;
      step1: { heading: string; nameLabel: string; namePlaceholder: string; relationshipLabel: string; relationshipProfessional: string; relationshipRomantic: string; relationshipFamily: string; relationshipGeneral: string; continue: string };
      step2: { heading: (name: string) => string; contextLabel: string; contextPlaceholder: string; observationsLabel: (name: string) => string; observationsPlaceholder: string; back: string; analyze: string };
      loading: { heading: (name: string) => string; description: string };
      result: { probableArchetype: string; typeRomantic: string; typeProfessional: string; typeFamily: string; typeGeneral: string; newAnalysis: string };
      error: { retry: string };
      history: { title: string; empty: string; viewingNow: string };
      report: { archetypeManifestation: string; dynamicWithYou: string; interactionStrategies: string; suggestedScript: string; whatToAvoid: string };
      calendar: { title: string; subtitle: string; generating: string; dayLabel: (n: number) => string; focus: string; action: string; say: string; avoid: string; close: string };
    };
    settings: {
      pageTitle: string; pageSubtitle: string;
      profile: { title: string; nameLabel: string; namePlaceholder: string; archetypeLabel: string; archetypeUndefined: string };
      preferences: { title: string; languageLabel: string; langPt: string; themeLabel: string; themeDark: string; themeLight: string };
      subscription: { title: string; currentPlan: string; plan30d: string; plan6m: string; plan1y: string; status: string; nextRenewal: string; accessingPortal: string; manageStripe: string; cancel: string; noneFound: string };
      cancelModal: { heading: (name: string) => string; body: string; keepProgress: string; proceedCancel: string };
      security: { title: string; desc: string; newLabel: string; newPlaceholder: string; confirmLabel: string; confirmPlaceholder: string; success: string; buttonLoading: string; buttonDefault: string };
    };
    layout: {
      banner: { grace: string; expiring: (days: number) => string; day: string; days: string; updateButton: string };
      locked: { heading: string; description: string; reactivateButton: string };
    };
    sidebar: { notifications: { title: string; subtitle: string; markAllRead: string; empty: string; close: string } };
  };
  onboarding: {
    progress: (step: number) => string;
    continue: string; back: string;
    loader: { heading: string; step0: string; step1: string; step2: string; progressLabel: (step: number, total: number) => string };
    step1: { heading: string; description: string; option: { before6am: string; between6am7am: string; between7am8am: string; after8am: string } };
    step2: { heading: string; description: string; option: { before10pm: string; between10pm11pm: string; between11pmMidnight: string; afterMidnight: string } };
    step3: { heading: string; description: string; option: { min15: string; min30: string; min45: string; min60: string } };
    step4: { heading: string; description: string; placeholder: string };
    step5: { heading: string; description: string; option: { debt: string; emergency: string; invest: string; organize: string } };
    step6: { heading: string; description: string; option: { hardcore: string; gradual: string } };
    step7: { heading: string; description: string; option: { ios: string; android: string; none: string }; submit: string };
    footer: { privacy: string };
  };
  checkout: { welcomeNotification: { title: string; body: string } };
  resetPassword: { title: string; placeholder: string; updating: string; updateButton: string; success: string };
  sharePage: { metaTitle: string; metaDescription: string };
  obrigado: {
    metaTitle: string; loadingTitle: string;
    errorHeading: string; errorGoHome: string; fallbackName: string;
    step1Title: string; step1Desc: string;
    step2Title: string; step2Desc: string;
    step3Title: string; step3Desc: string;
    welcomeHeading: string; welcomeSub: string;
    credentialsHeading: string; emailLabel: string; emailUnavailable: string;
    passwordLabel: string; copySuccess: string; copyDefault: string;
    passwordInstruction: string; diagnosisTimerLabel: string;
    whatsNextHeading: string; accessCta: string;
    faqHeading: string;
    faq1Q: string; faq1A: string;
    faq2Q: string; faq2A: string;
    faq3Q: string; faq3A: string;
    copyright: string;
  };
  dashboardErrors: {
    connectionHeading: string; connectionDesc: string;
    reconnectButton: string; signOutTryAgain: string;
    initializing: string;
    failedLoad: string;
  };
  salesCta: { discoverArchetype: string };
  plansExtra: { guarantee7Days: string; visa: string; mastercard: string; stripe: string; footerCopyright: string };
  calendarExportLabels: { markdownOption: string; icsOption: string; markdownHeader: string };
  onboardingExtra: { saveError: string };
  settingsExtra: { passwordMinLength: string; passwordMismatch: string; passwordChangeError: string };
  commonExtra: { openMenu: string; protocolVersion: string };
  /**
   * Fase 4 — copy V2 da nova SalesPageV2 (blocos B1–B5).
   * Todas as strings aceitam templates `[NOME]`, `[PRIMARY]`, `[SECONDARY]`
   * que são interpolados em runtime por `fillTpl`.
   */
  salesV2: {
    b1: { eyebrow: string; h1: string; promise: string; cta: string; timer: string };
    b2: { title: string; body: string; bullets: string[]; conclusion: string };
    b3: { title: string; body: string; references: string; proofSeal: string; pivot: string; solution: string };
    b4: { title: string; subtitle: string; features: Array<{ title: string; description: string }> };
    b5: {
      eyebrow: string;
      title: string;
      subtitle: string;
      deliverables: Array<{ title: string; description: string }>;
      note: string;
    };
    b6: {
      counter: string;
      rating: string;
      testimonials: Array<{ quote: string; author: string; country: string; arch: string }>;
    };
    ob1: { badge: string; title: string; desc: string; cta: string };
    b7: { eyebrow: string; was: string; then: string; price: string; cta: string; trust: string };
    b8: { title: string; items: Array<{ q: string; a: string }> };
    b9: { title: string; subtitle: string; tagline: string; cta: string; trust: string };
    ob2: { eyebrow: string; title: string; desc: string; cta: string; decline: string };
    exit: { title: string; body: string; cta: string; decline: string };
  };
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
    securePayment: "Pagamento seguro via Stripe", processing: "Processando…",
    nav: { home: "Início", diagnosis: "Diagnóstico", actionMatrix: "Matriz de Ação", compass: "Compass", progress: "Progresso", settings: "Configurações", notifications: "Notificações" },
    success: { loading: "Finalizando sua compra e preparando seu acesso…", errorTitle: "Erro na Finalização" },
  },
  login: {
    enterEmailFirst: "Introduz o teu e-mail primeiro.",
    checkInbox: "Verifica a tua caixa de entrada.",
    forgotPassword: "Esqueceste-te da password?",
    subscriptionEnded: "⏳ A tua assinatura foi encerrada.",
    subscriptionRenew: "Renova o teu plano para continuar a aceder ao MindReset.",
  },
  notFound: { title: "Página não encontrada", desc: "A página que procuras não existe ou foi movida.", goHome: "Ir para o início" },
  errorPage: { title: "Esta página não carregou", desc: "Algo correu mal do nosso lado. Podes tentar voltar a carregar ou voltar ao início.", tryAgain: "Tentar novamente", goHome: "Ir para o início" },
  hero: {
    kicker: "Finanças comportamentais • 8 perguntas • 3 minutos",
    headline: "O TEU CÉREBRO TEM UM PADRÃO\nQUE ESTÁ A SABOTAR\nAS TUAS FINANÇAS.",
    sub: "Não é falta de força de vontade. É um arquétipo comportamental que nunca soubeste que tinhas.",
    cta: "Quero descobrir meu padrão",
    microcopy: "⚡ 3 minutos · 100% grátis · Resultado imediato",
    trust: "+12.000 diagnósticos • Sem cartão para começar",
    trustSsl: "SSL Seguro",
    trustData: "Dados Protegidos",
    trustGuarantee: "7 dias garantia",
  },
  features: {
    title: "Engenharia para transformação profunda",
    subtitle: "Mais que um teste. Um instrumento de precisão para o teu subconsciente."
  },
  landing: {
    proofBar: {
      ariaLabel: "Indicadores de confiança",
      diagnostics: { value: "+12.000", label: "Diagnósticos realizados" },
      rating: { value: "4.9 / 5", label: "Avaliação média" },
      noBank: { value: "100%", label: "Sem dados bancários" },
      languages: { value: "5", label: "Idiomas suportados" },
    },
    beliefBreak: {
      tag: "A CIÊNCIA POR TRÁS",
      title: "O PROBLEMA NÃO É O TEU DINHEIRO.\u00a0\nÉ O TEU PADRÃO.",
      intro: "Três Prémios Nobel já o disseram. Tu apenas nunca tinhas ouvido assim.",
      cards: [
        { author: "Daniel Kahneman", quote: "Sistema 1 decide. Sistema 2 racionaliza.", insight: "95% das tuas decisões financeiras são automáticas — não pensadas." },
        { author: "Richard Thaler", quote: "Não somos racionais. Somos previsíveis.", insight: "Repetes os mesmos erros — sempre nos mesmos gatilhos." },
        { author: "Dan Ariely", quote: "Não controlas o dinheiro. O teu padrão controla-te.", insight: "Até saberes qual é o padrão, ele decide por ti." },
      ],
      punchline: "O problema não é o teu dinheiro. É o teu padrão.",
    },
    archetypes: {
      tag: "Os 4 Arquétipos",
      title: "QUAL É O TEU PADRÃO INVISÍVEL?",
      sub: "O mesmo padrão emocional aparece em 4 áreas: dinheiro, carreira, amor e vida pessoal. Descobre o teu em menos de 3 minutos.",
      items: {
        AO: { name: "Acumulador Obsessivo", trigger: "Gatilho: medo de faltar", desc: "Acumula com obsessão e mede tudo pela utilidade — no dinheiro, na carreira segura demais, no amor utilitário, no descanso adiado." },
        SS: { name: "Status Seeker", trigger: "Gatilho: aprovação social", desc: "Vive pela imagem — gasta para impressionar, escolhe cargos pelo prestígio, parceiros que validam, e cuida do exterior enquanto o interior se desgasta." },
        EA: { name: "Alienado Financeiro", trigger: "Gatilho: fuga e negação", desc: "Evita conversas difíceis — sobre dinheiro, promoções, conflitos no amor, e até consigo próprio. O desconforto é anestesiado pela ausência." },
        HI: { name: "Hedonista Impulsivo", trigger: "Gatilho: prazer imediato", desc: "Vive de picos — compras por impulso, projetos abandonados, paixões intensas e curtas, hábitos saudáveis que duram dias." },
      },
    },
    howItWorks: {
      tag: "Como funciona",
      title: "Simples. Profundo. Eficaz.",
      sub: "Sem planilhas. Sem dados bancários. Apenas perguntas sobre como te comportas.",
      steps: [
        { title: "RESPONDE \n8  PERGUNTAS", desc: "Sobre comportamento real, não teoria financeira. Sem julgamento." },
        { title: "RECEBE  O  TEU\u00a0\nDIAGNÓSTICO", desc: "A IA mapeia o teu arquétipo em 4 dimensões: financeiro, profissional, amoroso e pessoal." },
        { title: "RECEBE  O \nPDF", desc: "Um PDF de 30+ páginas no teu email com o diagnóstico completo nas 4 áreas. Para leres quando quiseres." },
      ],
    },
    features: {
      tag: "O que recebes",
      title: "UM\u00a0 PDF. QUATRO\u00a0 ÁREAS. ZERO\u00a0 APPS.",
      items: [
        { icon: "💰", title: "DIMENSÃO\u00a0 FINANCEIRA", desc: "Como o teu arquétipo distorce decisões com dinheiro — e o plano específico para sair do loop de escassez, status ou impulso.", meta: "Diagnóstico + 5 ações" },
        { icon: "💼", title: "DIMENSÃO\u00a0 PROFISSIONAL", desc: "Por que aceitas menos do que mereces (ou saltas de projeto em projeto). Como o padrão sabota a tua carreira sem teres reparado.", meta: "Diagnóstico + 5 ações" },
        { icon: "❤️", title: "DIMENSÃO\u00a0 AMOROSA", desc: "O teu arquétipo escolhe parceiros, evita conflitos e mede o afeto. Como interrompes o ciclo nas relações que mais te importam.", meta: "Diagnóstico + 5 ações" },
        { icon: "🧘", title: "DIMENSÃO\u00a0 PESSOAL", desc: "Saúde, descanso, identidade, hábitos. Onde o padrão te custa anos sem que percebas — e como construir o reset.", meta: "Diagnóstico + 5 ações" },
      ],
    },
    testimonials: {
      tag: "Depoimentos",
      title: "QUEM JÁ\u00a0 ENTENDEU O\u00a0 SEU PADRÃO",
      starsAlt: (n) => `${n} de ${n} estrelas`,
      items: [
        { stars: 5, quote: "Nunca entendi por que gastava tudo antes do dia 15. O diagnóstico nomeou exatamente o que eu sentia. Parece que finalmente alguém me explicou a mim próprio.", name: "Adam K.", arch: "Arquétipo: HEDONISTA\nIMPULSIVO" },
        { stars: 5, quote: "Eu achava que era disciplinada com dinheiro. O MindReset mostrou que eu tinha medo de gastar — e que isso também é um problema. Foi revelador.", name: "Maria C.", arch: "Arquétipo: Guardadora Obsessiva" },
        { stars: 5, quote: "A parte sobre carreira e relacionamentos doeu — e foi exatamente onde eu precisava ver. Não é só um relatório financeiro, é um espelho.", name: "Rami S.", arch: "Arquétipo: Fantasma Evasivo" },
      ],
    },
    faq: {
      tag: "Dúvidas Frequentes",
      title: "PERGUNTAS\nFREQUENTES",
      sub: "Se ficou alguma dúvida, o botão para começar o diagnóstico resolve a maioria delas em 3 minutos.",
      cta: "Fazer o diagnóstico grátis",
      items: [
        { q: "O MindReset tem acesso aos meus dados bancários?", a: "Não. O MindReset não acede a contas, extratos nem informações bancárias. O diagnóstico é baseado exclusivamente nas tuas respostas comportamentais ao quiz — sem integração bancária de qualquer tipo." },
        { q: "O diagnóstico é mesmo personalizado?", a: "Sim. A IA (GPT-4o) gera um relatório único baseado no teu arquétipo, nome, género e respostas individuais. Não é um texto genérico — é escrito especificamente para ti e guardado de forma permanente." },
        { q: "Isto é só sobre dinheiro?", a: "Não. O diagnóstico cobre 4 áreas: dinheiro, carreira, amor e vida pessoal. O mesmo padrão emocional aparece em todas — só muda a forma como te custa." },
        { q: "O que recebo exatamente?", a: "Um PDF de 30+ páginas no teu email, em minutos. Diagnóstico do teu arquétipo nas 4 áreas, 20 ações específicas (5 por área) e mapa das tuas relações por arquétipo." },
        { q: "É assinatura ou pagamento único?", a: "Pagamento único. Sem app, sem mensalidade, sem lock-in. Compras uma vez, recebes o PDF, é teu para sempre." },
        { q: "E se eu não gostar?", a: "Garantia de 7 dias sem perguntas. Se o produto não entregar o que promete, reembolsamos 100% do valor pago." },
      ],
    },
    finalCta: {
      titleBefore: "O PADRÃO QUE\u00a0 SABOTA AS\u00a0 TUAS 4\u00a0 ÁREAS TEM NOME. ESTÁ\u00a0 NA HORA DE ",
      titleHighlight: "DESCOBRIR",
      titleAfter: " QUAL É.",
      sub: "8 perguntas. 3 minutos. Uma clareza que nenhuma planilha dá.",
      cta: "Iniciar o meu diagnóstico gratuito",
      guarantee: "7 dias de garantia",
      trustLine: "🔒 Stripe • 🛡️ SSL • Cancelar a qualquer momento",
    },
  },


  identity: { title: "Antes de começar, quem és tu?", sub: "Vamos usar o teu nome ao longo do diagnóstico para o tornar pessoal." },
  questions: {
    title: (n, total) => `Pergunta ${n} de ${total}`,
    intro: (name) => `${name}, escolhe a opção que mais se parece contigo — não há respostas erradas.`,
  },
  q: [
    { q: "Recebes uma quantia inesperada equivalente ao teu salário, qual é o teu primeiro impulso?",
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
    { q: "Se pudesses mudar uma coisa no teu comportamento financeiro seria:",
      options: ["Parar de viver em modo escassez","Comprar por mim e não pelos outros","Olhar para as minhas contas sem fugir","Conseguir adiar uma compra por 24h"] },
  ],
  emailCapture: {
    title: (name) => `${name.toUpperCase()}, O TEU DIAGNÓSTICO\u00a0 ESTÁ PRONTO.`,
    sub: "Introduz o teu e-mail para receberes o relatório completo e desbloqueares a página do arquétipo.",
    cta: "Ver o meu arquétipo agora",
  },
  quizProgress: { identity: "Identificação", email: "Finalização" },
  loader: {
    title: "Processando as tuas respostas",
    steps: [
      "A cruzar 8 respostas com 4 arquétipos…",
      "A identificar o teu padrão dominante…",
      "A preparar a tua revelação…",
    ],
    analysis: [
      "Analizando fluxos de impulsividade...",
      "Mapeando gatilhos de segurança...",
      "Cruzando dados com 12.000 diagnósticos...",
      "Calculando probabilidade de recidiva...",
      "Construindo protocolo de 30 dias..."
    ]
  },
  archetypes: {
    AO: { name: "ACUMULADOR\nOBSESSIVO", tagline: "Vives em modo escassez — mesmo quando há.",
      hooks: ["Poupas mas nunca te sentes seguro","Sentes culpa quando gastas em ti","Trocas presente por um futuro que nunca chega"] },
    SS: { name: "STATUS\nSEEKER", tagline: "Compras a versão de ti que queres que os outros vejam.",
      hooks: ["Gastas para sinalizar pertença","Tens medo de parecer pequeno","Trocas conta corrente por validação"] },
    EA: { name: "EVASIVO\nALIENADO", tagline: "O dinheiro existe — tu evitas olhar.",
      hooks: ["Não abres extratos","Decides rápido para acabar com o desconforto","Pagas a paz com juros invisíveis"] },
    HI: { name: "HEDONISTA\nIMPULSIVO", tagline: "Vives o agora — e o agora é sempre caro.",
      hooks: ["Compras pela emoção, justificas depois","Adiar parece-te perder","Tens tudo, menos margem"] },
  },
  reveal: {
    kicker: (name) => `${name}, o teu arquétipo é:`,
    sub: "Isto não é sorte.\nÉ um padrão — e padrões mudam-se",
    cta: "Acessar meu protocolo agora",
    share: "Partilhar o meu arquétipo",
    errorTitle: "Não conseguimos salvar o teu diagnóstico.",
    errorBody: "A tua revelação ainda aparece abaixo, mas o link de partilha não está disponível.",
    errorRetry: "Tentar novamente",
    comparison: (name, arch) => `Comparação: ${name} vs. Média do ${arch}`,
    areasTitle: "O mesmo padrão. 4 áreas da sua vida.",
    areasIntro: (name) => `${name}, o teu arquétipo não vive só no extrato. Veja onde ele aparece — e o quanto está custando.`,
    areas: {
      money: {
        label: "Dinheiro",
        byArch: {
          AO: "Acumula sem nunca sentir suficiente — escassez interna mesmo com saldo positivo.",
          SS: "Gasta para sinalizar pertencimento. O dinheiro vira vitrine, não liberdade.",
          EA: "Evita olhar para o dinheiro — boletos viram boletos e dívidas crescem em silêncio.",
          HI: "Tudo entra, tudo sai. O agora pesa mais que qualquer planilha.",
        },
      },
      career: {
        label: "Carreira",
        byArch: {
          AO: "Aceita menos do que vale para garantir estabilidade. Perde décadas em zonas seguras.",
          SS: "Escolhe trabalhos pelo prestígio do cargo, não pela vida que ele constrói.",
          EA: "Adia decisões importantes — promoções, mudanças, conversas duras — até virarem urgência.",
          HI: "Pula de projeto em projeto buscando o próximo pico. Raramente colhe o que plantou.",
        },
      },
      love: {
        label: "Amor",
        byArch: {
          AO: "Mede afeto em utilidade. Dificuldade de receber sem sentir que está devendo.",
          SS: "Escolhe parceiros que validam sua imagem. Conexão real fica em segundo plano.",
          EA: "Foge das conversas que importam. O conflito vira distância — silenciosa, longa.",
          HI: "Vive paixões intensas e curtas. Comprometimento parece prisão até virar arrependimento.",
        },
      },
      personal: {
        label: "Pessoal",
        byArch: {
          AO: "Adia descanso, prazer e cuidado em nome de uma segurança que nunca chega.",
          SS: "Constrói uma identidade externa impecável — e por dentro sente que ninguém te conhece.",
          EA: "Anestesia tédio, ansiedade e tristeza com distrações. A vida acontece em modo neblina.",
          HI: "Energia em picos e quedas. Hábitos saudáveis duram dias, não meses.",
        },
      },
    },
    areasCta: "Quero ver o diagnóstico completo",
    anchor: (arch) => `73% dos ${arch} relatam o mesmo padrão em pelo menos 3 destas 4 áreas. Tu não estás sozinho — e isso é exatamente o que torna o padrão resolvível.`,
    urgency: "Esta análise expira em",
    guarantee: "7 dias de garantia · Pagamento único · Sem assinatura",
    finalTitle: (name) => `${name}, podes parar de adivinhar.`,
    finalSub: "O diagnóstico completo mostra-te o gatilho exato, o padrão por trás dele e os 30 dias guiados para o desfazeres.",
    finalCta: "Quero o meu diagnóstico completo",
  },
  sales: {
    h1: (name, arch) => `${name}, foi por isto que nada do que tentaste antes funcionou.`,
    promise: "Em 30 dias, vais reconhecer o gatilho antes de ele acontecer.",
    videoPlaceholder: "Assista a esta breve explicação do seu arquétipo",
    timer: "Oferta termina em:",
    painBlock: {
      title: "Você já tentou de tudo, certo?",
      body: "Planilhas do Excel. Aplicativos de orçamento. Promessas de ano novo. Mas o padrão sempre volta a assumir o controle nas horas de estresse, ansiedade ou euforia. Isso acontece porque o problema não é matemático — é comportamental.",
      bullets: [
        "O dinheiro some antes do fim do mês e você não sabe exatamente para onde foi",
        "Você toma decisões financeiras que sabe que são erradas... e continua tomando",
        "Mesmo quando a situação melhora, a sensação de insegurança não passa",
        "Já tentou planilhas, apps, métodos — e nenhum durou mais de 30 dias",
      ],
      conclusion: "Isso não é fraqueza. É o seu arquétipo financeiro operando no piloto automático.",
    },
    science: {
      title: "O problema não está no que você sabe sobre dinheiro.",
      body: "Neurociência comportamental confirma: 95% das decisões financeiras são tomadas pelo sistema emocional do cérebro — não pelo racional.",
      references: "Kahneman, Thaler e Ariely passaram décadas estudando exatamente isso.",
      pivot: "Planilhas não resolvem um problema que não é de planilha.",
      solution: "O MindReset foi construído para trabalhar onde o problema realmente existe: na mente.",
    },
    features: [
      { icon: "🧠", title: "Diagnóstico Profundo", description: "Um dossiê de 4 dimensões (Finanças, Profissional, Pessoal, Amor) detalhando seus pontos cegos comportamentais." },
      { icon: "📅", title: "Matriz de Ação", description: "Protocolo diário personalizado gerado por IA com micro-tarefas executáveis para reconectar seu cérebro." },
      { icon: "🧭", title: "Compass", description: "Decodifique as pessoas da sua vida. Saiba exatamente o que dizer para evitar conflitos e fortalecer relacionamentos." },
      { icon: "📈", title: "Gamificação Real", description: "Ganhe pontos, mantenha o streak e receba relatórios mensais para comprovar sua evolução comportamental." },
    ],
    howItWorks: {
      title: "Como Funciona",
      steps: [
        { num: "1", title: "Responda o Quiz", description: "8 perguntas rápidas que mapeiam seu padrão financeiro invisível." },
        { num: "2", title: "Receba Seu Protocolo", description: "IA gera um diagnóstico completo e um calendário personalizado para o seu arquétipo." },
        { num: "3", title: "Execute e Evolua", description: "Tarefas diárias, streaks e conquistas que transformam insight em hábito real." },
      ],
    },
    socialProof: {
      counterText: "Mais de 12.000 diagnósticos gerados em 5 países",
      testimonials: [
        { quote: "Pela primeira vez entendi por que nunca conseguia guardar. Não era falta de disciplina — era meu padrão.", author: "Mariana S.", country: "Brasil" },
        { quote: "O Compass mudou minha relação com meu parceiro. Entendi o arquétipo dele e finalmente paramos de brigarmos por dinheiro.", author: "Andrzej K.", country: "Polônia" },
        { quote: "Em 15 dias já estava reconhecendo o gatilho antes de comprar. Isso nunca aconteceu com nenhum app.", author: "Alexandru P.", country: "Romênia" },
      ],
      ratingText: "4.9/5 baseado em avaliações de usuários",
    },
    faq: [
      { q: "Isso é diferente de apps de orçamento como YNAB ou Mint?", a: "Completamente. Aqueles apps ensinam O QUE fazer com dinheiro. O MindReset revela POR QUE você não consegue fazer o que já sabe que deveria. É a diferença entre mudança sustentável e abandono em 30 dias." },
      { q: "Preciso conectar minha conta bancária?", a: "Não. O MindReset trabalha com comportamento e mentalidade — não com extrato bancário. Nenhuma conta financeira é conectada. Seus dados financeiros permanecem seguros no seu banco." },
      { q: "E se eu quiser cancelar?", a: "Você pode cancelar quando quiser através do portal do cliente. Sem burocracia, sem ligações, sem perguntas chatas. Cancelamento em 2 cliques." },
      { q: "Funciona em qual idioma?", a: "Português, Inglês, Polonês, Romeno e Árabe. O sistema detecta seu idioma automaticamente pelo seu navegador e localização." },
      { q: "A IA substitui um psicólogo?", a: "Não. O MindReset é uma ferramenta de autoconhecimento comportamental. Não substitui aconselhamento profissional. Mas ajuda a identificar padrões que muitas vezes passam despercebidos." },
      { q: "Como funciona o reembolso?", a: "Você tem 7 dias para solicitar reembolso integral após a primeira compra. Sem perguntas. Acesse o portal do cliente ou entre em contato." },
    ],
    guarantee: {
      title: "Garantia Incondicional",
      body: "Se em 7 dias não sentires que o teu protocolo está a mudar a tua percepção sobre dinheiro, devolvemos 100% do teu investimento. Sem perguntas."
    },
    ctaFinal: {
      title: "Chega de repetir os mesmos padrões.",
      subtitle: "O seu arquétipo não é um destino. É um ponto de partida.",
      cta: "Começar Meu MindReset Agora →",
      trust: "🔒 Stripe • 🛡️ SSL • Cancelar a qualquer momento",
    },
    cta: "Ver meus planos",
  },
  plans: {
    title: "Escolhe a duração do teu Reset", sub: "Subscrição recorrente. Cancelas quando quiseres.",
    mostPopular: "MAIS POPULAR", perDay: (v) => `${v} / dia`,
    p30: "30 dias", p6m: "6 meses", p1y: "1 ano",
    chooseCta: "Quero esse plano agora",
    guarantee: "7 dias de reembolso integral — sem perguntas.",
    features: {
      diagnosis: "Diagnóstico Completo AI",
      matrix: "Matriz de Ação Diária",
      compass: "Compass — Acessos ilimitados",
      gamification: "Gamificação & Relatórios de IA",
    },
    secureBadge: "Pagamento 100% Seguro via Stripe",
  },
  share: { title: (name, arch) => `${name} é ${arch}.`, cta: "Descobre o teu arquétipo", views: (n) => `${n} pessoas viram` },
  legal: {
    privacyBody: "MindReset recolhe nome, e-mail, respostas ao quiz e dados de geolocalização aproximada (país) para personalizar o diagnóstico. Não vendemos os teus dados. Podes solicitar exportação ou eliminação a qualquer momento em privacy@mindreset.app. Retenção: 24 meses após o último login.",
    termsBody: "MindReset oferece análise comportamental educativa. NÃO substitui aconselhamento médico, psicológico ou financeiro profissional. Subscrições renovam automaticamente. Direito a reembolso integral nos primeiros 7 dias após a primeira compra. Cancelamento disponível a qualquer momento no portal de cliente.",
  },
  cookies: { body: "Usamos tecnologias de localização para personalizar a tua experiência. Ao continuar concordas com a nossa Política de Privacidade." },
  dashboard: {
    hub: {
      greeting: (h) => { const hr = parseInt(h); if (hr < 12) return "Bom dia"; if (hr < 18) return "Boa tarde"; return "Boa noite"; },
      headingWithArchetype: (arch) => `Seu hub de controle — ${arch}`,
      headingFallback: "Seu dashboard",
      cards: {
        diagnosis: { title: "Meu Diagnóstico", desc: "Entenda seu arquétipo completo.", cta: "Acessar →" },
        calendar: { title: "Matriz de Ação", desc: "Acesse seu protocolo diário personalizado.", cta: "Acessar →" },
        compass: { title: "Compass", desc: "Descubra o arquétipo de alguém na sua vida.", cta: "Acessar →" },
        progress: { title: "Progresso", desc: (pts) => `${pts} pontos acumulados`, cta: "Ver progresso →" },
      },
      badges: { new: "NOVO", today: "Hoje" },
      stats: { points: "Pontos", streak: "Streak", tasks: "Tarefas" },
      quotes: {
        AO: "Segurança real não vem de acumular — vem de confiar.",
        SS: "Sua riqueza real não precisa de aprovação.",
        EA: "Cada passo em direção à clareza é uma vitória.",
        HI: "A melhor recompensa vem de quem espera.",
      },
      recentActivity: { title: "Avisos Recentes", viewAll: "Ver todas →" },
    },
    progress: {
      pageTitle: "Sua Evolução", pageSubtitle: "Acompanhe seu progresso, conquistas e relatórios de IA.",
      streak: { currentLabel: "Streak Atual", daysCount: (n) => `${n} dias`, emptyPrompt: "Complete uma tarefa hoje para iniciar sua sequência!" },
      points: { label: "Pontos", nextReward: (n) => `Faltam ${n} pts para o próximo benefício`, redeem: "Resgatar", insufficient: "Pontos insuficientes", redeemed: "Recompensa resgatada!" },
      consistencyGrid: {
        title: "Consistência", completedDays: (d, t) => `${d} de ${t} dias concluídos`,
        dayLabel: "Dia", stateCompleted: "Concluído", stateMilestone: "Marco", statePending: "Pendente", stateLocked: "Bloqueado",
        legendLocked: "Bloqueado", legendPending: "Pendente", legendCompleted: "Concluído", legendMilestone: "Marco",
      },
      consistencyBadge: { beginner: "Iniciante", constant: "Constante", disciplined: "Disciplinado", unstoppable: "Imparável", master: "Mestre do Reset" },
      achievements: {
        title: "Conquistas", unlocked: "Desbloqueado",
        ACH_001: { name: "Primeiro Passo", desc: "Completar o Dia 1 do protocolo." },
        ACH_002: { name: "7 Dias de Reset", desc: "Completar 7 dias consecutivos." },
        ACH_003: { name: "Exportador", desc: "Exportar seu calendário pela 1ª vez." },
        ACH_004: { name: "15 Dias Imparável", desc: "Manter o streak por 15 dias." },
        ACH_005: { name: "Meio Caminho", desc: "Chegar ao Dia 15 do protocolo." },
        ACH_006: { name: "Veterano", desc: "Completar os primeiros 30 dias." },
      },
      report: {
        widgetTitle: "Relatório Mensal", comingSoon: "Em breve", readyFallback: "Seu relatório deste mês está pronto.",
        notYetAvailable: "Seu relatório gerado por IA estará disponível após 30 dias de protocolo.", viewFull: "Ver Relatório Completo →",
        monthlyReportLabel: (m) => `Relatório Mensal — Mês ${m}`, behavioralEvolution: "Sua Evolução Comportamental",
        scoreDescription: (s) => `Você completou ${s}% das tarefas deste mês. Continue nesse ritmo.`,
        monthAnalysis: "Análise do Mês", patternIdentified: "Padrão Identificado", nextMonthFocus: "Foco para o Próximo Mês", generatedOn: "Gerado em",
      },
      donut: { points: "Pontos", remaining: "Restantes" },
    },
    diagnosis: {
      tabs: { financial: "Finanças", professional: "Profissional", romantic: "Relacionamentos", personal: "Pessoal" },
      empty: { heading: "Seu diagnóstico está pronto para ser revelado.", description: "Nossa IA estruturou uma análise psicológica profunda de 4 dimensões sobre como o seu arquétipo toma decisões invisíveis diariamente." },
      generating: "Gerando análise (≈ 20s)...", unlockButton: "Desbloquear Meu Diagnóstico",
      share: { clipboardMessage: (n, u) => `Descobri que meu arquétipo financeiro é ${n}! 🧠\nDescubra o seu gratuitamente: ${u}`, whatsappMessage: (n, u) => `Descobri que meu arquétipo financeiro é *${n}*! 🧠\nDescubra o seu gratuitamente: ${u}` },
      result: { heading: "Dossiê Comportamental", generatedOn: "Análise gerada por IA em" },
      actions: { downloadPdf: "📄 Baixar PDF", copied: "✓ Copiado!", copyLink: "🔗 Copiar Link", whatsapp: "WhatsApp" },
      disclaimer: "Isenção de responsabilidade: Esta análise é baseada em padrões comportamentais identificados em suas respostas. Não constitui aconselhamento financeiro, psicológico ou médico profissional.",
      pdf: { header: "MindReset — Dossiê Comportamental", footer: "MindReset — Análise comportamental. Não constitui aconselhamento profissional." },
    },
    calendar: {
      pageTitle: "Matriz de Ação",
      empty: { heading: "Sua Matriz de Ação está vazia.", description: "Gere agora seu protocolo de 30 dias. Ele é desenhado especificamente para quebrar as reações automáticas do seu arquétipo." },
      emptyState: { hint: "Selecione um dia no calendário para ver suas tarefas e registrar seu progresso." },
      generating: "Construindo matriz (Pode levar até 1 minuto)...", generateButton: "Gerar Minha Matriz de Ação",
      monthTab: (m) => `Mês ${m}`,
      grid: { dayLabel: "Dia", lockedLabel: "Bloqueado" },
      sidebar: { phaseLabel: (p) => `Fase: ${p}`, dayHeading: (d) => `Dia ${d}`, milestoneBadge: "MARCO" },
      reflectiveLabel: "🧠 Reflexão", actionLabel: "⚡ Ação Prática",
      checkboxes: { instruction: "Marque o que você concluiu hoje:", reflectiveCompleted: "🧠 Tarefa Reflexiva Concluída", actionCompleted: "⚡ Tarefa de Ação Concluída", almostThere: "✨ Quase lá! Complete a outra tarefa para registrar o dia." },
      undoButton: "Desmarcar Conclusão",
      journal: { label: "Diário de Bordo", placeholder: "Como você se sentiu fazendo isso? (Salvo automaticamente)" },
      export: { button: "📥 Exportar", csvOption: "CSV (Planilha)", csvHeader: "Dia,Fase,Marco,Tarefa Reflexiva,Tarefa de Ação,Concluído", yes: "Sim", no: "Não", markdownDay: (n) => `Dia ${n}`, markdownReflection: "Reflexão", markdownAction: "Ação" },
      ics: { calName: "MindReset Matriz de Ação", daySummary: (n, phase) => `Dia ${n} — ${phase}`, reflective: "Reflexiva", action: "Ação", milestone: "⭐ MARCO", alarmDesc: "MindReset tarefa do dia" },
    },
    compass: {
      subtitle: "Decodifique o comportamento financeiro de pessoas ao seu redor e descubra a melhor forma de se comunicar com elas.",
      step1: { heading: "Quem vamos analisar?", nameLabel: "Nome da pessoa", namePlaceholder: "Ex: João, Sócio, Minha esposa", relationshipLabel: "Qual a sua relação com ela?", relationshipProfessional: "Profissional (Colega, Chefe, Sócio)", relationshipRomantic: "Romântica (Cônjuge, Namorado/a)", relationshipFamily: "Familiar (Pai, Mãe, Irmão)", relationshipGeneral: "Geral (Amigo, Conhecido)", continue: "Continuar →" },
      step2: { heading: (n) => `Comportamento de ${n}`, contextLabel: "Qual o contexto/problema atual?", contextPlaceholder: "Ex: Precisamos alinhar os gastos da casa", observationsLabel: (n) => `Como ${n} lida com dinheiro, risco ou emoções?`, observationsPlaceholder: "Ex: Fica ansioso quando falo de cortar gastos, mas sempre compra coisas caras para impressionar os outros...", back: "← Voltar", analyze: "Analisar Perfil" },
      loading: { heading: (n) => `Decodificando ${n}...`, description: "Analisando padrões comportamentais via IA." },
      result: { probableArchetype: "Arquétipo Provável", typeRomantic: "Relação Romântica", typeProfessional: "Relação Profissional", typeFamily: "Relação Familiar", typeGeneral: "Relação Geral", newAnalysis: "＋ Fazer nova análise" },
      error: { retry: "Tentar novamente" },
      history: { title: "Análises Anteriores", empty: "Nenhuma análise feita ainda.", viewingNow: "▶ Visualizando agora" },
      report: { archetypeManifestation: "Como o arquétipo se manifesta", dynamicWithYou: "Dinâmica com você", interactionStrategies: "Estratégias de Interação", suggestedScript: "O que dizer (Script Sugerido)", whatToAvoid: "O que NÃO dizer/fazer" },
      calendar: { title: "Calendário de Comunicação", subtitle: "7 dias para melhorar a comunicação com", generating: "Gerando calendário...", dayLabel: (n) => `Dia ${n}`, focus: "Foco", action: "Ação Sugerida", say: "O que Dizer", avoid: "O que Evitar", close: "Fechar" },
    },
    settings: {
      pageTitle: "Configurações", pageSubtitle: "Gerencie seu perfil, preferências e assinatura.",
      profile: { title: "Perfil", nameLabel: "Nome", namePlaceholder: "Seu nome", archetypeLabel: "Arquétipo", archetypeUndefined: "Não definido" },
      preferences: { title: "Preferências", languageLabel: "Idioma", langPt: "Português (BR)", themeLabel: "Tema Visual", themeDark: "Escuro (Dark Mode)", themeLight: "Claro (Light Mode)" },
      subscription: { title: "Assinatura e Cobrança", currentPlan: "Plano Atual", plan30d: "30 Dias", plan6m: "6 Meses", plan1y: "1 Ano", status: "Status", nextRenewal: "Próxima Renovação", accessingPortal: "Acessando...", manageStripe: "Gerenciar no Stripe", cancel: "Cancelar assinatura", noneFound: "Nenhuma assinatura ativa encontrada." },
      cancelModal: { heading: (n) => `Espera! Antes de cancelar, ${n}...`, body: "Você começou seu protocolo e interromper agora significa perder seu progresso diário e o acesso à sua matriz de ação personalizada.", keepProgress: "Voltar e manter progresso", proceedCancel: "Continuar para o cancelamento" },
      security: { title: "Segurança", desc: "Altere sua senha de acesso. Recomendamos usar uma senha forte e única.", newLabel: "Nova senha", newPlaceholder: "Mínimo 8 caracteres", confirmLabel: "Confirmar nova senha", confirmPlaceholder: "Repita a nova senha", success: "Senha alterada com sucesso!", buttonLoading: "Alterando...", buttonDefault: "Alterar Senha" },
    },
    layout: {
      banner: { grace: "⚠️ Não conseguimos processar seu pagamento. Atualize seu método de pagamento para continuar seu protocolo sem interrupções.", expiring: (d) => `⏳ Seu protocolo expira em ${d} dia(s). Faça upgrade para não perder seu progresso.`, day: "dia", days: "dias", updateButton: "Atualizar" },
      locked: { heading: "Acesso Pausado", description: "Seu protocolo está pausado ou sua assinatura expirou. Reative sua conta para continuar sua evolução e não perder seu streak de dias.", reactivateButton: "Reativar Meu MindReset →" },
    },
    sidebar: { notifications: { title: "Notificações", subtitle: "Últimas atualizações da sua jornada", markAllRead: "Limpar todas como lidas", empty: "Você não tem notificações no momento.", close: "Fechar" } },
  },
  onboarding: {
    progress: (s) => `Calibração: Etapa ${s} de 7`,
    continue: "Continuar →", back: "Voltar",
    loader: { heading: "Construindo seu protocolo", step0: "Analisando seu perfil comportamental...", step1: "Calibrando suas metas psicológicas...", step2: "Estruturando a Matriz de Ação...", progressLabel: (s, t) => `Etapa ${s} de ${t}` },
    step1: { heading: "A que horas você costuma acordar?", description: "Isso ajuda a calibrar o melhor horário para suas tarefas reflexivas matinais.", option: { before6am: "Antes das 6:00", between6am7am: "Entre 6:00 e 7:00", between7am8am: "Entre 7:00 e 8:00", after8am: "Após as 8:00" } },
    step2: { heading: "A que horas você costuma dormir?", description: "Isso nos ajuda a evitar perturbar você com lembretes à noite.", option: { before10pm: "Antes das 22:00", between10pm11pm: "Entre 22:00 e 23:00", between11pmMidnight: "Entre 23:00 e Meia-noite", afterMidnight: "Após a Meia-noite" } },
    step3: { heading: "Quanto tempo você pode dedicar por dia?", description: "Mesmo poucos minutos por dia geram mudanças consistentes.", option: { min15: "15 minutos", min30: "30 minutos", min45: "45 minutos", min60: "60+ minutos" } },
    step4: { heading: "Qual emoção mais ativa seus impulsos de gasto?", description: "Seja específico. Ansiedade, tédio, desejo de comemoração ou busca por aceitação.", placeholder: "Ex: ansiedade devido ao trabalho, tédio nos finais de semana" },
    step5: { heading: "Qual seu foco financeiro prioritário?", description: "Nós desenharemos as tarefas de ação prática em torno deste objetivo.", option: { debt: "Pagar dívidas pendentes", emergency: "Construir reserva de emergência", invest: "Começar a investir", organize: "Organizar e planejar finanças" } },
    step6: { heading: "Qual seu estilo preferido de disciplina?", description: "Você prefere ser desafiado de forma estrita ou conduzido gradualmente?", option: { hardcore: "Estilo Hardcore (Regras estritas e desafios)", gradual: "Estilo Gradual (Nudges lentos e hábitos)" } },
    step7: { heading: "Qual o sistema do seu celular?", description: "Utilizaremos isso para otimizar os formatos de exportação de agenda (.ics).", option: { ios: "iOS (Apple)", android: "Android", none: "Apenas Desktop / Não uso agenda" }, submit: "Concluir Calibração →" },
    footer: { privacy: "MindReset respeita as diretrizes de privacidade e segurança do GDPR/LGPD." },
  },
  checkout: { welcomeNotification: { title: "🎉 Bem-vindo ao MindReset!", body: "Sua assinatura está ativa. Clique aqui para começar seu diagnóstico." } },
  resetPassword: { title: "Definir nova senha", placeholder: "Nova senha", updating: "Atualizando…", updateButton: "Atualizar senha", success: "Senha atualizada. Pode fazer login agora." },
  sharePage: { metaTitle: "Compartilhar Arquétipo", metaDescription: "Veja o resultado do diagnóstico comportamental." },
  obrigado: {
    metaTitle: "Bem-vindo ao MindReset!",
    loadingTitle: "PREPARANDO SEU ACESSO...",
    errorHeading: "Algo deu errado",
    errorGoHome: "Voltar ao início",
    fallbackName: "MindReset Membro",
    step1Title: "Acesse o Dashboard",
    step1Desc: "Veja seu painel personalizado com tudo organizado",
    step2Title: "Complete o Onboarding",
    step2Desc: "7 perguntas rápidas para calibrar seu protocolo",
    step3Title: "Comece seu Diagnóstico",
    step3Desc: "IA gera sua análise comportamental completa",
    welcomeHeading: "Bem-vindo ao MindReset,",
    welcomeSub: "Sua jornada de transformação comportamental começa agora. Estamos felizes em ter você connosco.",
    credentialsHeading: "Seus Dados de Acesso",
    emailLabel: "Email",
    emailUnavailable: "Email não disponível",
    passwordLabel: "Senha padrão",
    copySuccess: "Copiado!",
    copyDefault: "Copiar",
    passwordInstruction: "Você pode alterar sua senha a qualquer momento em Configurações → Segurança dentro do painel.",
    diagnosisTimerLabel: "Seu diagnóstico pessoal será necessário em:",
    whatsNextHeading: "O que fazer agora?",
    accessCta: "ACESSE O MINDRESET AGORA",
    faqHeading: "Perguntas Frequentes",
    faq1Q: "Como faço login?",
    faq1A: "Use o email da compra com a senha MindReset2026! (que você pode copiar acima). Se esquecer a senha, use 'Esqueci a senha' na tela de login.",
    faq2Q: "O que fazer primeiro?",
    faq2A: "Complete o Onboarding (7 perguntas rápidas). Depois, acesse o Diagnóstico para receber sua análise comportamental personalizada por IA.",
    faq3Q: "Preciso de ajuda?",
    faq3A: "Acesse nosso suporte por email ou chat. Estamos aqui para ajudar você a ter a melhor experiência possível.",
    copyright: "Todos os direitos reservados.",
  },
  dashboardErrors: {
    connectionHeading: "Connection Interrupted",
    connectionDesc: "We couldn't synchronize your neural profile. This usually happens due to a temporary connection issue.",
    reconnectButton: "Re-establish Connection",
    signOutTryAgain: "Sign out and try again",
    initializing: "Initializing Protocol...",
    failedLoad: "Failed to load dashboard data",
  },
  salesCta: { discoverArchetype: "DESCOBRIR MEU ARQUÉTIPO →" },
  plansExtra: { guarantee7Days: "7 Dias de Garantia", visa: "Visa", mastercard: "Mastercard", stripe: "Stripe", footerCopyright: "MindReset Inc." },
  calendarExportLabels: { markdownOption: "Markdown (.md)", icsOption: "Calendar (.ics)", markdownHeader: "# MindReset Action Matrix\n\n" },
  onboardingExtra: { saveError: "Houve um erro ao salvar seu progresso. Por favor, tente novamente." },
  settingsExtra: { passwordMinLength: "A senha deve ter pelo menos 8 caracteres.", passwordMismatch: "As senhas não coincidem.", passwordChangeError: "Erro ao alterar senha." },
  commonExtra: { openMenu: "Open menu", protocolVersion: "Protocol v3.0 // 2026" },
  salesV2: {
    b1: {
      eyebrow: "DIAGNÓSTICO REVELADO",
      h1: "[NOME], foi por isto que nada do que tentaste antes funcionou.",
      promise: "O padrão [PRIMARY] não te custa só dinheiro. Custa-te decisões na carreira, paz nas relações e horas de sono. Por isso a força de vontade falhou — estavas a lutar contra o mecanismo errado.",
      cta: "Ver o meu protocolo agora →",
      timer: "Esta análise expira em alguns minutos.",
    },
    b2: {
      title: "[NOME], já tentaste de tudo, certo?",
      body: "Folhas de Excel. Apps de orçamento. Promessas de Ano Novo. Mas o padrão volta sempre — nas horas de stress, ansiedade ou euforia. Como [PRIMARY], isto é o que se repete:",
      bullets: [
        "Dinheiro: a tua conta desaparece antes do fim do mês e não sabes exactamente para onde foi.",
        "Dinheiro: tomas decisões financeiras que sabes que estão erradas… e continuas a tomá-las.",
        "Carreira: aceitas menos do que mereces ou saltas de projecto em projecto sem fechares ciclos.",
        "Carreira: o aumento chegou, mas a sensação de instabilidade ficou exactamente igual.",
        "Amor: evitas conversas sobre dinheiro com quem amas — até que explodem por outro motivo qualquer.",
        "Amor: comparas-te no Instagram e sentes que a vida boa acontece sempre aos outros.",
        "Pessoal: hábitos saudáveis (gym, leitura, sono) duram menos do que a euforia inicial.",
        "Pessoal: cada nova tentativa começa com convicção e acaba com a mesma frase — 'desta vez vai ser diferente'.",
      ],
      conclusion: "Não és tu. É um padrão. E padrões mudam-se — quando finalmente sabes qual é.",
    },
    b3: {
      title: "O problema não está no que tu sabes sobre dinheiro.",
      body: "A neurociência comportamental confirma: 95% das decisões financeiras são tomadas pelo sistema emocional — não pelo racional.",
      references: "Kahneman (Nobel 2002), Thaler (Nobel 2017) e Ariely passaram décadas a estudar exactamente isto.",
      proofSeal: "Baseado em 14 estudos revisados por pares · 12.000 diagnósticos validados em 5 países",
      pivot: "Folhas de Excel não resolvem um problema que não é de Excel.",
      solution: "O MindReset foi construído para trabalhar onde o problema realmente existe — na mente de quem é [PRIMARY].",
    },
    b4: {
      title: "[NOME], o teu diagnóstico [PRIMARY] em 4 dimensões.",
      subtitle: "Quatro dimensões mapeadas para o teu arquétipo. Os números abaixo são os teus — não médias, não estimativas.",
      features: [
        { title: "Dinheiro", description: "Como [PRIMARY] toma decisões financeiras invisíveis todos os dias — e o gatilho exacto a desactivar nas próximas 24h." },
        { title: "Carreira", description: "Por que o teu padrão profissional te trava, e o passo seguinte concreto a dar esta semana." },
        { title: "Amor", description: "Como [PRIMARY] aparece nas tuas relações — e o script literal para a próxima conversa difícil sobre dinheiro." },
        { title: "Pessoal", description: "O hábito-âncora que, ao mudares, derruba outros 3 padrões automáticos em 90 dias." },
      ],
    },
    b5: {
      eyebrow: "O QUE VAIS RECEBER",
      title: "Tudo o que precisas para sair do padrão [PRIMARY].",
      subtitle: "Seis peças que trabalham em conjunto — construídas especificamente para o teu arquétipo.",
      deliverables: [
        { title: "Diagnóstico 4D personalizado", description: "Mapa do teu arquétipo nas 4 áreas críticas — dinheiro, carreira, amor, pessoal — com scores reais." },
        { title: "Protocolo de 90 dias", description: "30 micro-acções calibradas para desactivar o gatilho [PRIMARY] em cada área, semana a semana." },
        { title: "Matriz de Decisão", description: "Filtro de 60 segundos para escolheres antes do impulso decidir por ti — funciona em qualquer compra." },
        { title: "Compass diário", description: "Check-in de 1 minuto que detecta o padrão a regressar — e mostra-te o desvio antes que custe." },
        { title: "Relatórios mensais", description: "Vês a curva real do teu comportamento, mês a mês, sem auto-engano nem narrativas convenientes." },
        { title: "Acesso nos 5 idiomas", description: "PT, EN, PL, RO, AR. Para ti hoje, para a tua família e parceiros amanhã." },
      ],
      note: "Acesso vitalício · Sem subscrição · Garantia incondicional de 30 dias.",
    },
    b6: {
      counter: "+12.000 diagnósticos gerados em 5 países",
      rating: "4,9 / 5 com base em avaliações de utilizadores",
      testimonials: [
        { quote: "Pela primeira vez percebi porque nunca conseguia poupar. Não era falta de disciplina — era o meu padrão de [PRIMARY].", author: "Mariana S.", country: "Portugal", arch: "AO" },
        { quote: "O diagnóstico mudou a forma como falo de dinheiro com o meu parceiro. Em 15 dias deixámos de discutir.", author: "Andrzej K.", country: "Polónia", arch: "EA" },
        { quote: "Reconheci o gatilho antes de comprar. Isto nunca me tinha acontecido com nenhuma app.", author: "Alexandru P.", country: "Roménia", arch: "HI" },
        { quote: "Nunca entendi porque gastava tudo antes do dia 15. O diagnóstico nomeou exactamente o que eu sentia.", author: "Adam K.", country: "Polónia", arch: "HI" },
        { quote: "Achava-me disciplinada com dinheiro. O MindReset mostrou que eu tinha medo de gastar — e que isso também é um problema.", author: "Maria C.", country: "Portugal", arch: "AO" },
        { quote: "A parte sobre carreira e relacionamentos doeu — e foi exactamente onde eu precisava ver. Não é um relatório, é um espelho.", author: "Rami S.", country: "Arábia Saudita", arch: "EA" },
        { quote: "Recebi o PDF, li à noite e no dia seguinte recusei uma compra que antes era automática. Detalhe pequeno — viragem enorme.", author: "Ioana M.", country: "Roménia", arch: "SS" },
        { quote: "Sou engenheira, gosto de dados. O diagnóstico não foi astrologia — foi um espelho com referências académicas no fim.", author: "Katarzyna W.", country: "Polónia", arch: "AO" },
        { quote: "Pensava que o problema era o salário. Era o padrão. Hoje ganho o mesmo e tenho margem pela primeira vez em 8 anos.", author: "Yousef A.", country: "Arábia Saudita", arch: "HI" },
      ],
    },
    ob1: {
      badge: "MAIS PEDIDO",
      title: "Guia de Relações por Arquétipo",
      desc: "Como cada arquétipo se relaciona com dinheiro. Útil para o teu parceiro, família ou sócio entender o teu [PRIMARY] — e tu o deles.",
      cta: "Sim, quero adicionar",
    },
    b7: {
      eyebrow: "ÚLTIMO PASSO, [NOME]",
      was: "$200",
      then: "$47",
      price: "Hoje",
      cta: "Quero o meu diagnóstico [PRIMARY] agora →",
      trust: "✓ 7 dias garantia · ✓ Pagamento único · ✓ SSL · ✓ Sem subscrição",
    },
    b8: {
      title: "Perguntas frequentes",
      items: [
        { q: "Isto é diferente de apps de orçamento como YNAB ou Mint?", a: "Sim. Esses apps ensinam o QUE fazer com dinheiro. O MindReset revela PORQUE como [PRIMARY] não consegues fazer o que já sabes que devias. É a diferença entre mudança sustentável e abandono em 30 dias." },
        { q: "Preciso de ligar a minha conta bancária?", a: "Não. O MindReset trabalha com comportamento — não com extracto. Nenhum dado bancário é pedido nem armazenado." },
        { q: "Funciona se eu já tentei terapia ou coaching financeiro?", a: "Sim — e funciona ainda melhor. A terapia trabalha a emoção; o coaching trabalha o plano. O MindReset trabalha o padrão automático que sabota ambos. Não competem, complementam-se." },
        { q: "Serve para a Arábia Saudita, Polónia ou Roménia?", a: "Sim. Já validado nos 5 idiomas com mais de 12.000 diagnósticos. A psicologia comportamental é universal — só muda a forma como cada cultura a vive. Adaptamos linguagem, exemplos e referências." },
        { q: "E se eu quiser cancelar ou pedir reembolso?", a: "Tens 30 dias para pedir reembolso integral, sem perguntas. Cancelamento em 2 cliques no portal do cliente." },
        { q: "A IA substitui um psicólogo?", a: "Não. É uma ferramenta de autoconhecimento comportamental. Útil para identificares padrões — não substitui aconselhamento profissional." },
      ],
    },
    b9: {
      title: "[NOME], o próximo ecrã mostra o que recebes e quanto custa.",
      subtitle: "Decides tu. Sem pressão, sem letras pequenas, sem cobranças escondidas.",
      tagline: "És [PRIMARY] com traço de [SECONDARY]. A próxima página continua a leitura do teu padrão — agora com o protocolo completo na mesa.",
      cta: "Ver o meu protocolo agora →",
      trust: "🔒 Stripe · 🛡️ SSL · 30 dias de garantia incondicional",
    },
    ob2: {
      eyebrow: "ANTES DE AVANÇARES…",
      title: "Protocolo de Reset 30 dias",
      desc: "Plano diário com 30 micro-acções calibradas para sair do padrão [PRIMARY]. Recebes junto com o diagnóstico.",
      cta: "Sim, quero adicionar",
      decline: "Não, prefiro descobrir sozinho",
    },
    exit: {
      title: "[NOME], podes mesmo sair agora?",
      body: "Cada semana em piloto automático como [PRIMARY] custa-te decisões que não vais voltar a tomar. O próximo ecrã mostra-te o protocolo completo — não há desconto, há clareza sobre o que recebes.",
      cta: "Mostra-me o protocolo →",
      decline: "Prefiro continuar como estou",
    },
  },
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
    securePayment: "Secure payment via Stripe", processing: "Processing…",
    nav: { home: "Home", diagnosis: "Diagnosis", actionMatrix: "Action Matrix", compass: "Compass", progress: "Progress", settings: "Settings", notifications: "Notifications" },
    success: { loading: "Finalizing your purchase and preparing your access…", errorTitle: "Checkout Error" },
  },
  login: {
    enterEmailFirst: "Enter your email first.",
    checkInbox: "Check your inbox.",
    forgotPassword: "Forgot password?",
    subscriptionEnded: "⏳ Your subscription has ended.",
    subscriptionRenew: "Renew your plan to continue accessing MindReset.",
  },
  notFound: { title: "Page not found", desc: "The page you're looking for doesn't exist or has been moved.", goHome: "Go home" },
  errorPage: { title: "This page didn't load", desc: "Something went wrong on our end. You can try refreshing or head back home.", tryAgain: "Try again", goHome: "Go home" },
  hero: {
    kicker: "Behavioral finance • 8 questions • 3 minutes",
    headline: "YOUR BRAIN HAS A PATTERN\nTHAT'S SABOTAGING\nYOUR FINANCES.",
    sub: "It's not lack of willpower. It's a behavioral archetype you never knew you had.",
    cta: "I want to discover my archetype",
    microcopy: "⚡ 3 minutes · 100% free · Instant result",
    trust: "+12,000 diagnoses • No card to start",
    trustSsl: "Secure SSL",
    trustData: "Data Protected",
    trustGuarantee: "7-day guarantee",
  },
  features: {
    title: "Engineered for deep transformation",
    subtitle: "More than a test. A precision instrument for your subconscious."
  },
  landing: {
    proofBar: {
      ariaLabel: "Trust indicators",
      diagnostics: { value: "+12,000", label: "Diagnoses delivered" },
      rating: { value: "4.9 / 5", label: "Average rating" },
      noBank: { value: "100%", label: "No bank data needed" },
      languages: { value: "5", label: "Languages supported" },
    },
    beliefBreak: {
      tag: "THE\u00a0 SCIENCE\u00a0 BEHIND\u00a0 IT",
      title: "THE\u00a0 PROBLEM\u00a0 ISN'T\u00a0 YOUR\u00a0 MONEY.\u00a0 IT'S\u00a0 YOUR\u00a0 PATTERN.",
      intro: "Three Nobel laureates already proved it. You just never heard it this way.",
      cards: [
        { author: "Daniel Kahneman", quote: "System 1 decides. System 2 rationalizes.", insight: "95% of your financial decisions are automatic — not thought through." },
        { author: "Richard Thaler", quote: "We're not rational. We're predictable.", insight: "You repeat the same mistakes — always on the same triggers." },
        { author: "Dan Ariely", quote: "You don't control money. Your pattern controls you.", insight: "Until you name the pattern, it decides for you." },
      ],
      punchline: "The problem isn't your money. It's your pattern.",
    },
    archetypes: {
      tag: "The 4 Archetypes",
      title: "What's your invisible pattern?",
      sub: "The same emotional pattern shows up in 4 areas: money, career, love, and personal life. Find yours in under 3 minutes.",
      items: {
        AO: { name: "Obsessive Accumulator", trigger: "Trigger: fear of running out", desc: "Hoards obsessively and measures everything by utility — in money, in over-safe career choices, in transactional love, in rest postponed." },
        SS: { name: "Status Seeker", trigger: "Trigger: social approval", desc: "Lives by the image — spends to impress, picks roles for prestige, partners who validate, polishes the outside while the inside erodes." },
        EA: { name: "Financial Avoider", trigger: "Trigger: avoidance and denial", desc: "Avoids the hard conversations — about money, raises, conflict in love, even with yourself. Discomfort is numbed by absence." },
        HI: { name: "Impulsive Hedonist", trigger: "Trigger: immediate pleasure", desc: "Lives in spikes — impulse buys, abandoned projects, short intense passions, healthy habits that last days." },
      },
    },
    howItWorks: {
      tag: "How it works",
      title: "Simple. Deep. Effective.",
      sub: "No spreadsheets. No bank data. Just questions about how you actually behave.",
      steps: [
        { title: "Answer 8 questions", desc: "About real behavior — not financial theory. No judgment." },
        { title: "Get your diagnosis", desc: "AI maps your archetype across 4 dimensions: financial, professional, romantic, personal." },
        { title: "Get the PDF", desc: "A 30+ page PDF in your inbox with the full diagnosis across all 4 areas. Yours to read whenever." },
      ],
    },
    features: {
      tag: "What you get",
      title: "One PDF. Four areas.\nZero apps.",
      items: [
        { icon: "💰", title: "Money Dimension", desc: "How your archetype warps decisions with money — and the specific plan to break the scarcity, status, or impulse loop.", meta: "Diagnosis + 5 actions" },
        { icon: "💼", title: "Career Dimension", desc: "Why you accept less than you're worth (or jump from project to project). How the pattern sabotages your career without you noticing.", meta: "Diagnosis + 5 actions" },
        { icon: "❤️", title: "Love Dimension", desc: "Your archetype picks partners, avoids conflict, and measures affection. How to break the cycle in the relationships that matter most.", meta: "Diagnosis + 5 actions" },
        { icon: "🧘", title: "Personal Dimension", desc: "Health, rest, identity, habits. Where the pattern costs you years without you noticing — and how to build the reset.", meta: "Diagnosis + 5 actions" },
      ],
    },
    testimonials: {
      tag: "Testimonials",
      title: "Who already understood their pattern",
      starsAlt: (n) => `${n} out of ${n} stars`,
      items: [
        { stars: 5, quote: "I never understood why I spent everything before the 15th. The diagnosis named exactly what I felt — like someone finally explained me to myself.", name: "Adam K.", arch: "Archetype: Impulsive Hedonist" },
        { stars: 5, quote: "I thought I was disciplined with money. MindReset showed me I was afraid to spend — and that this is also a problem. It was revealing.", name: "Maria C.", arch: "Archetype: Obsessive Saver" },
        { stars: 5, quote: "The career and relationships sections hurt — and that's exactly where I needed to look. It's not just a money report, it's a mirror.", name: "Rami S.", arch: "Archetype: Avoidant Ghost" },
      ],
    },
    faq: {
      tag: "Frequently Asked Questions",
      title: "Questions you\nprobably have",
      sub: "If anything is still unclear, the button to start the diagnosis solves most of them in 3 minutes.",
      cta: "Take the free diagnosis",
      items: [
        { q: "Does MindReset access my bank data?", a: "No. MindReset never accesses accounts, statements, or any banking information. The diagnosis is based exclusively on your behavioral answers to the quiz — no bank integration of any kind." },
        { q: "Is the diagnosis really personalized?", a: "Yes. The AI (GPT-4o) generates a unique report based on your archetype, name, gender, and individual answers. Not a generic text — written specifically for you and saved permanently." },
        { q: "Is this only about money?", a: "No. The diagnosis covers 4 areas: money, career, love, and personal life. The same emotional pattern shows up in all of them — only the cost changes." },
        { q: "What exactly do I get?", a: "A 30+ page PDF in your inbox within minutes. Diagnosis of your archetype across all 4 areas, 20 specific actions (5 per area), and a map of your relationships by archetype." },
        { q: "Is it a subscription or one-time?", a: "One-time payment. No app, no monthly fee, no lock-in. Buy once, get the PDF, it's yours forever." },
        { q: "What if I don't like it?", a: "7-day no-questions-asked guarantee. If the product doesn't deliver what it promises, we refund 100% of what you paid." },
      ],
    },
    finalCta: {
      titleBefore: "The pattern sabotaging your 4 life areas has a name.\nIt's time to ",
      titleHighlight: "discover",
      titleAfter: " what it is.",
      sub: "8 questions. 3 minutes. A clarity no spreadsheet can give you.",
      cta: "Start my free diagnosis",
      guarantee: "7-day guarantee",
      trustLine: "🔒 Stripe • 🛡️ SSL • Cancel anytime",
    },
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
    cta: "Reveal my archetype now",
  },
  quizProgress: { identity: "Identification", email: "Finalization" },
  loader: {
    title: "Processing your answers",
    steps: [
      "Cross-checking 8 answers across 4 archetypes…",
      "Identifying your dominant pattern…",
      "Preparing your reveal…",
    ],
    analysis: [
      "Analyzing impulsivity flows...",
      "Mapping security triggers...",
      "Cross-referencing with 12,000+ diagnoses...",
      "Calculating relapse probability...",
      "Building 30-day protocol..."
    ]
  },
  archetypes: {
    AO: { name: "OBSESSIVE\nACCUMULATOR", tagline: "You live in scarcity mode — even when there's plenty.",
      hooks: ["You save but never feel safe","You feel guilty spending on yourself","You trade today for a future that never arrives"] },
    SS: { name: "STATUS\nSEEKER", tagline: "You buy the version of you you want others to see.",
      hooks: ["You spend to signal belonging","You're afraid of looking small","You trade balance for validation"] },
    EA: { name: "AVOIDANT\nESCAPIST", tagline: "Money exists — you choose not to look.",
      hooks: ["You don't open statements","You decide fast to end the discomfort","You pay for peace with invisible interest"] },
    HI: { name: "IMPULSIVE\nHEDONIST", tagline: "You live for now — and now is always expensive.",
      hooks: ["You buy with emotion, justify after","Delay feels like losing","You have everything except margin"] },
  },
  reveal: {
    kicker: (name) => `${name}, your archetype is:`,
    sub: "This isn't luck.\nIt's a pattern — and patterns can change",
    cta: "Access my protocol now",
    share: "Share my archetype",
    errorTitle: "We couldn't save your diagnosis.",
    errorBody: "Your reveal still appears below, but the share link isn't available.",
    errorRetry: "Try again",
    comparison: (name, arch) => `Comparison: ${name} vs. ${arch} average`,
    areasTitle: "Same pattern. 4 areas of your life.",
    areasIntro: (name) => `${name}, your archetype doesn't live only in your bank account. See where it shows up — and how much it's costing you.`,
    areas: {
      money: {
        label: "Money",
        byArch: {
          AO: "You stack savings but never feel safe — scarcity runs deep even when balances rise.",
          SS: "You spend to signal belonging. Money becomes a window display, not freedom.",
          EA: "You avoid looking at your finances — bills pile up and debt grows in silence.",
          HI: "It all comes in, it all goes out. The now always weighs more than any spreadsheet.",
        },
      },
      career: {
        label: "Career",
        byArch: {
          AO: "You accept less than you're worth in exchange for security. Decades lost in the safe zone.",
          SS: "You chase titles for prestige, not for the life they actually build.",
          EA: "You delay raises, hard conversations and changes — until they become emergencies.",
          HI: "You jump from project to project chasing the next high. Rarely reap what you sow.",
        },
      },
      love: {
        label: "Love",
        byArch: {
          AO: "You measure affection in usefulness. Receiving without owing feels uncomfortable.",
          SS: "You pick partners who validate your image. Real connection comes second.",
          EA: "You dodge the conversations that matter. Conflict becomes distance — long and quiet.",
          HI: "You live in short, intense passions. Commitment feels like a cage — until regret arrives.",
        },
      },
      personal: {
        label: "Personal",
        byArch: {
          AO: "You postpone rest, pleasure and care chasing a security that never arrives.",
          SS: "You build a flawless outer identity — and inside feel that no one truly knows you.",
          EA: "You numb boredom and anxiety with distractions. Life happens in a fog.",
          HI: "Energy spikes and crashes. Healthy habits last days, not months.",
        },
      },
    },
    areasCta: "Show me the full diagnosis",
    anchor: (arch) => `73% of ${arch} report the same pattern in at least 3 of these 4 areas. You're not alone — and that's exactly what makes the pattern solvable.`,
    urgency: "This analysis expires in",
    guarantee: "7-day guarantee · One-time payment · No subscription",
    finalTitle: (name) => `${name}, you can stop guessing.`,
    finalSub: "The full diagnosis shows you the exact trigger, the pattern behind it, and the 30-day guided plan to undo it.",
    finalCta: "I want my full diagnosis",
  },
  sales: {
    h1: (name, arch) => `${name}, this is why nothing you tried before worked.`,
    promise: "In 30 days you'll recognize the trigger before it happens.",
    videoPlaceholder: "Watch this brief explanation of your archetype",
    timer: "Offer ends in:",
    painBlock: {
      title: "You've tried everything, haven't you?",
      body: "Excel spreadsheets. Budgeting apps. New Year's resolutions. But the pattern always takes over during stress, anxiety, or excitement. That's because the problem isn't mathematical — it's behavioral.",
      bullets: [
        "Money disappears before the end of the month and you're not sure where it went",
        "You make financial decisions you know are wrong... and keep making them",
        "Even when things improve, the insecurity never goes away",
        "You've tried spreadsheets, apps, methods — none lasted more than 30 days",
      ],
      conclusion: "This isn't weakness. It's your financial archetype running on autopilot.",
    },
    science: {
      title: "The problem isn't what you know about money.",
      body: "Behavioral neuroscience confirms: 95% of financial decisions are made by the brain's emotional system — not the rational one.",
      references: "Kahneman, Thaler and Ariely spent decades studying exactly this.",
      pivot: "Spreadsheets don't solve a problem that isn't about spreadsheets.",
      solution: "MindReset was built to work where the problem actually lives: in the mind.",
    },
    features: [
      { icon: "🧠", title: "Deep Diagnosis", description: "A 4-dimension dossier (Finance, Professional, Personal, Romantic) detailing your behavioral blind spots." },
      { icon: "📅", title: "Action Matrix", description: "AI-generated personalized daily protocol with executable micro-tasks to rewire your brain." },
      { icon: "🧭", title: "Compass", description: "Decode the people in your life. Know exactly what to say to avoid conflicts and strengthen relationships." },
      { icon: "📈", title: "Real Gamification", description: "Earn points, maintain streaks, and receive monthly reports that prove your behavioral evolution." },
    ],
    howItWorks: {
      title: "How It Works",
      steps: [
        { num: "1", title: "Take the Quiz", description: "8 quick questions that map your invisible financial pattern." },
        { num: "2", title: "Receive Your Protocol", description: "AI generates a complete diagnosis and personalized calendar for your archetype." },
        { num: "3", title: "Execute & Evolve", description: "Daily tasks, streaks, and achievements that turn insight into real habit." },
      ],
    },
    socialProof: {
      counterText: "Over 12,000 diagnoses generated across 5 countries",
      testimonials: [
        { quote: "For the first time I understood why I could never save. It wasn't lack of discipline — it was my pattern.", author: "Mariana S.", country: "Brazil" },
        { quote: "Compass changed my relationship with my partner. I understood his archetype and we stopped fighting about money.", author: "Andrzej K.", country: "Poland" },
        { quote: "In 15 days I was already recognizing the trigger before buying. No app ever did that for me.", author: "Alexandru P.", country: "Romania" },
      ],
      ratingText: "4.9/5 based on user reviews",
    },
    faq: [
      { q: "How is this different from budgeting apps like YNAB or Mint?", a: "Completely different. Those apps teach you WHAT to do with money. MindReset reveals WHY you can't do what you already know you should. That's the difference between lasting change and abandonment in 30 days." },
      { q: "Do I need to connect my bank account?", a: "No. MindReset works with behavior and mindset — not bank statements. No financial accounts are connected. Your financial data stays safe in your bank." },
      { q: "What if I want to cancel?", a: "You can cancel anytime through the customer portal. No bureaucracy, no phone calls, no annoying questions. Cancel in 2 clicks." },
      { q: "Which languages does it work in?", a: "Portuguese, English, Polish, Romanian, and Arabic. The system detects your language automatically from your browser and location." },
      { q: "Does AI replace a psychologist?", a: "No. MindReset is a behavioral self-awareness tool. It doesn't replace professional advice. But it helps identify patterns that often go unnoticed." },
      { q: "How does the refund work?", a: "You have 7 days to request a full refund after your first purchase. No questions asked. Access the customer portal or contact us." },
    ],
    guarantee: {
      title: "Unconditional Guarantee",
      body: "If in 7 days you don't feel that your protocol is changing your perception of money, we refund 100% of your investment. No questions asked."
    },
    ctaFinal: {
      title: "Stop repeating the same patterns.",
      subtitle: "Your archetype isn't a destination. It's a starting point.",
      cta: "Start My MindReset Now →",
      trust: "🔒 Stripe • 🛡️ SSL • Cancel anytime",
    },
    cta: "See my plans",
  },
  plans: {
    title: "Choose your Reset length", sub: "Recurring subscription. Cancel anytime.",
    mostPopular: "MOST POPULAR", perDay: (v) => `${v} / day`,
    p30: "30 days", p6m: "6 months", p1y: "1 year",
    chooseCta: "I want this plan",
    guarantee: "7-day full refund — no questions asked.",
    features: {
      diagnosis: "Full AI Diagnosis",
      matrix: "Daily Action Matrix",
      compass: "Compass — Unlimited access",
      gamification: "Gamification & AI Reports",
    },
    secureBadge: "100% Secure Payment via Stripe",
  },
  share: { title: (name, arch) => `${name} is ${arch}.`, cta: "Discover your archetype", views: (n) => `${n} people viewed` },
  legal: {
    privacyBody: "MindReset collects name, email, quiz answers and approximate geolocation (country) to personalize your diagnosis. We never sell your data. Export and deletion requests: privacy@mindreset.app. Retention: 24 months after last login.",
    termsBody: "MindReset provides educational behavioral analysis. It does NOT replace professional medical, psychological or financial advice. Subscriptions auto-renew. Full refund within 7 days of first purchase. Cancel anytime from the customer portal.",
  },
  cookies: { body: "We use location technologies to personalize your experience. By continuing you agree to our Privacy Policy." },
  dashboard: {
    hub: {
      greeting: (h) => { const hr = parseInt(h); if (hr < 12) return "Good morning"; if (hr < 18) return "Good afternoon"; return "Good evening"; },
      headingWithArchetype: (arch) => `Your control hub — ${arch}`,
      headingFallback: "Your dashboard",
      cards: {
        diagnosis: { title: "My Diagnosis", desc: "Understand your complete archetype.", cta: "Access →" },
        calendar: { title: "Action Matrix", desc: "Access your personalized daily protocol.", cta: "Access →" },
        compass: { title: "Compass", desc: "Discover the archetype of someone in your life.", cta: "Access →" },
        progress: { title: "Progress", desc: (pts) => `${pts} points earned`, cta: "View progress →" },
      },
      badges: { new: "NEW", today: "Today" },
      stats: { points: "Points", streak: "Streak", tasks: "Tasks" },
      quotes: {
        AO: "Real security doesn't come from accumulating — it comes from trusting.",
        SS: "Your real worth doesn't need approval.",
        EA: "Every step toward clarity is a victory.",
        HI: "The best reward comes to those who wait.",
      },
      recentActivity: { title: "Recent Notices", viewAll: "See all →" },
    },
    progress: {
      pageTitle: "Your Evolution", pageSubtitle: "Track your progress, achievements and AI reports.",
      streak: { currentLabel: "Current Streak", daysCount: (n) => `${n} days`, emptyPrompt: "Complete a task today to start your streak!" },
      points: { label: "Points", nextReward: (n) => `${n} pts until next benefit`, redeem: "Redeem", insufficient: "Insufficient points", redeemed: "Reward redeemed!" },
      consistencyGrid: {
        title: "Consistency", completedDays: (d, t) => `${d} of ${t} days completed`,
        dayLabel: "Day", stateCompleted: "Completed", stateMilestone: "Milestone", statePending: "Pending", stateLocked: "Locked",
        legendLocked: "Locked", legendPending: "Pending", legendCompleted: "Completed", legendMilestone: "Milestone",
      },
      consistencyBadge: { beginner: "Beginner", constant: "Consistent", disciplined: "Disciplined", unstoppable: "Unstoppable", master: "Reset Master" },
      achievements: {
        title: "Achievements", unlocked: "Unlocked",
        ACH_001: { name: "First Step", desc: "Complete Day 1 of the protocol." },
        ACH_002: { name: "7 Days of Reset", desc: "Complete 7 consecutive days." },
        ACH_003: { name: "Exporter", desc: "Export your calendar for the 1st time." },
        ACH_004: { name: "15 Days Unstoppable", desc: "Maintain streak for 15 days." },
        ACH_005: { name: "Halfway", desc: "Reach Day 15 of the protocol." },
        ACH_006: { name: "Veteran", desc: "Complete the first 30 days." },
      },
      report: {
        widgetTitle: "Monthly Report", comingSoon: "Coming soon", readyFallback: "Your report for this month is ready.",
        notYetAvailable: "Your AI-generated report will be available after 30 days of protocol.", viewFull: "View Full Report →",
        monthlyReportLabel: (m) => `Monthly Report — Month ${m}`, behavioralEvolution: "Your Behavioral Evolution",
        scoreDescription: (s) => `You completed ${s}% of this month's tasks. Keep it up.`,
        monthAnalysis: "Month Analysis", patternIdentified: "Pattern Identified", nextMonthFocus: "Focus for Next Month", generatedOn: "Generated on",
      },
      donut: { points: "Points", remaining: "Remaining" },
    },
    diagnosis: {
      tabs: { financial: "Finance", professional: "Professional", romantic: "Relationships", personal: "Personal" },
      empty: { heading: "Your diagnosis is ready to be revealed.", description: "Our AI structured a deep 4-dimension psychological analysis of how your archetype makes invisible decisions daily." },
      generating: "Generating analysis (≈ 20s)...", unlockButton: "Unlock My Diagnosis",
      share: { clipboardMessage: (n, u) => `I discovered my financial archetype is ${n}! 🧠\nDiscover yours for free: ${u}`, whatsappMessage: (n, u) => `I discovered my financial archetype is *${n}*! 🧠\nDiscover yours for free: ${u}` },
      result: { heading: "Behavioral Dossier", generatedOn: "AI-generated analysis on" },
      actions: { downloadPdf: "📄 Download PDF", copied: "✓ Copied!", copyLink: "🔗 Copy Link", whatsapp: "WhatsApp" },
      disclaimer: "Disclaimer: This analysis is based on behavioral patterns identified in your responses. It does not constitute professional financial, psychological, or medical advice.",
      pdf: { header: "MindReset — Behavioral Dossier", footer: "MindReset — Behavioral analysis. Not professional advice." },
    },
    calendar: {
      pageTitle: "Action Matrix",
      empty: { heading: "Your Action Matrix is empty.", description: "Generate your 30-day protocol now. It is specifically designed to break your archetype's automatic reactions." },
      emptyState: { hint: "Select a day on the calendar to view your tasks and log your progress." },
      generating: "Building matrix (May take up to 1 minute)...", generateButton: "Generate My Action Matrix",
      monthTab: (m) => `Month ${m}`,
      grid: { dayLabel: "Day", lockedLabel: "Locked" },
      sidebar: { phaseLabel: (p) => `Phase: ${p}`, dayHeading: (d) => `Day ${d}`, milestoneBadge: "MILESTONE" },
      reflectiveLabel: "🧠 Reflection", actionLabel: "⚡ Practical Action",
      checkboxes: { instruction: "Mark what you completed today:", reflectiveCompleted: "🧠 Reflective Task Completed", actionCompleted: "⚡ Action Task Completed", almostThere: "✨ Almost there! Complete the other task to log the day." },
      undoButton: "Unmark Completion",
      journal: { label: "Logbook", placeholder: "How did you feel doing this? (Auto-saved)" },
      export: { button: "📥 Export", csvOption: "CSV (Spreadsheet)", csvHeader: "Day,Phase,Milestone,Reflective Task,Action Task,Completed", yes: "Yes", no: "No", markdownDay: (n) => `Day ${n}`, markdownReflection: "Reflection", markdownAction: "Action" },
      ics: { calName: "MindReset Action Matrix", daySummary: (n, phase) => `Day ${n} — ${phase}`, reflective: "Reflective", action: "Action", milestone: "⭐ MILESTONE", alarmDesc: "MindReset task of the day" },
    },
    compass: {
      subtitle: "Decode the financial behavior of people around you and discover the best way to communicate with them.",
      step1: { heading: "Who are we going to analyze?", nameLabel: "Person's name", namePlaceholder: "e.g. Alex, Partner, My spouse", relationshipLabel: "What is your relationship with them?", relationshipProfessional: "Professional (Colleague, Boss, Partner)", relationshipRomantic: "Romantic (Spouse, Boyfriend/Girlfriend)", relationshipFamily: "Family (Parent, Sibling)", relationshipGeneral: "General (Friend, Acquaintance)", continue: "Continue →" },
      step2: { heading: (n) => `Behavior of ${n}`, contextLabel: "What is the current context/problem?", contextPlaceholder: "e.g. We need to align household expenses", observationsLabel: (n) => `How does ${n} deal with money, risk or emotions?`, observationsPlaceholder: "e.g. Gets anxious when I talk about cutting expenses, but always buys expensive things to impress others...", back: "← Back", analyze: "Analyze Profile" },
      loading: { heading: (n) => `Decoding ${n}...`, description: "Analyzing behavioral patterns via AI." },
      result: { probableArchetype: "Probable Archetype", typeRomantic: "Romantic Relationship", typeProfessional: "Professional Relationship", typeFamily: "Family Relationship", typeGeneral: "General Relationship", newAnalysis: "＋ New analysis" },
      error: { retry: "Try again" },
      history: { title: "Previous Analyses", empty: "No analyses done yet.", viewingNow: "▶ Viewing now" },
      report: { archetypeManifestation: "How the archetype manifests", dynamicWithYou: "Dynamic with you", interactionStrategies: "Interaction Strategies", suggestedScript: "What to say (Suggested Script)", whatToAvoid: "What NOT to say/do" },
      calendar: { title: "Communication Calendar", subtitle: "7 days to improve communication with", generating: "Generating calendar...", dayLabel: (n) => `Day ${n}`, focus: "Focus", action: "Suggested Action", say: "What to Say", avoid: "What to Avoid", close: "Close" },
    },
    settings: {
      pageTitle: "Settings", pageSubtitle: "Manage your profile, preferences and subscription.",
      profile: { title: "Profile", nameLabel: "Name", namePlaceholder: "Your name", archetypeLabel: "Archetype", archetypeUndefined: "Not defined" },
      preferences: { title: "Preferences", languageLabel: "Language", langPt: "Portuguese (BR)", themeLabel: "Visual Theme", themeDark: "Dark Mode", themeLight: "Light Mode" },
      subscription: { title: "Subscription & Billing", currentPlan: "Current Plan", plan30d: "30 Days", plan6m: "6 Months", plan1y: "1 Year", status: "Status", nextRenewal: "Next Renewal", accessingPortal: "Accessing...", manageStripe: "Manage on Stripe", cancel: "Cancel subscription", noneFound: "No active subscription found." },
      cancelModal: { heading: (n) => `Wait! Before cancelling, ${n}...`, body: "You started your protocol and stopping now means losing your daily progress and access to your personalized action matrix.", keepProgress: "Go back and keep progress", proceedCancel: "Continue to cancellation" },
      security: { title: "Security", desc: "Change your password. We recommend using a strong, unique password.", newLabel: "New password", newPlaceholder: "Minimum 8 characters", confirmLabel: "Confirm new password", confirmPlaceholder: "Repeat new password", success: "Password changed successfully!", buttonLoading: "Changing...", buttonDefault: "Change Password" },
    },
    layout: {
      banner: { grace: "⚠️ We couldn't process your payment. Update your payment method to continue your protocol without interruptions.", expiring: (d) => `⏳ Your protocol expires in ${d} day(s). Upgrade to avoid losing your progress.`, day: "day", days: "days", updateButton: "Update" },
      locked: { heading: "Access Paused", description: "Your protocol is paused or your subscription has expired. Reactivate your account to continue your evolution and keep your daily streak.", reactivateButton: "Reactivate My MindReset →" },
    },
    sidebar: { notifications: { title: "Notifications", subtitle: "Latest updates from your journey", markAllRead: "Mark all as read", empty: "You have no notifications at this time.", close: "Close" } },
  },
  onboarding: {
    progress: (s) => `Calibration: Step ${s} of 7`,
    continue: "Continue →", back: "Back",
    loader: { heading: "Building your protocol", step0: "Analyzing your behavioral profile...", step1: "Calibrating your psychological goals...", step2: "Structuring the Action Matrix...", progressLabel: (s, t) => `Step ${s} of ${t}` },
    step1: { heading: "What time do you usually wake up?", description: "This helps calibrate the best time for your morning reflective tasks.", option: { before6am: "Before 6:00", between6am7am: "Between 6:00 and 7:00", between7am8am: "Between 7:00 and 8:00", after8am: "After 8:00" } },
    step2: { heading: "What time do you usually go to sleep?", description: "This helps us avoid disturbing you with reminders at night.", option: { before10pm: "Before 10:00 PM", between10pm11pm: "Between 10:00 PM and 11:00 PM", between11pmMidnight: "Between 11:00 PM and Midnight", afterMidnight: "After Midnight" } },
    step3: { heading: "How much time can you dedicate per day?", description: "Even a few minutes per day creates consistent changes.", option: { min15: "15 minutes", min30: "30 minutes", min45: "45 minutes", min60: "60+ minutes" } },
    step4: { heading: "What emotion most triggers your spending impulses?", description: "Be specific. Anxiety, boredom, celebration desire or seeking acceptance.", placeholder: "e.g. work anxiety, weekend boredom" },
    step5: { heading: "What is your priority financial focus?", description: "We'll design practical action tasks around this goal.", option: { debt: "Pay off pending debts", emergency: "Build emergency fund", invest: "Start investing", organize: "Organize and plan finances" } },
    step6: { heading: "What is your preferred discipline style?", description: "Do you prefer to be strictly challenged or gradually guided?", option: { hardcore: "Hardcore Style (Strict rules and challenges)", gradual: "Gradual Style (Slow nudges and habits)" } },
    step7: { heading: "What is your phone's operating system?", description: "We'll use this to optimize calendar export formats (.ics).", option: { ios: "iOS (Apple)", android: "Android", none: "Desktop only / I don't use a calendar" }, submit: "Complete Calibration →" },
    footer: { privacy: "MindReset respects GDPR/LGPD privacy and security guidelines." },
  },
  checkout: { welcomeNotification: { title: "🎉 Welcome to MindReset!", body: "Your subscription is active. Click here to start your diagnosis." } },
  resetPassword: { title: "Set a new password", placeholder: "New password", updating: "Updating…", updateButton: "Update password", success: "Password updated. You can log in now." },
  sharePage: { metaTitle: "Share Archetype", metaDescription: "View the behavioral diagnosis result." },
  obrigado: {
    metaTitle: "Welcome to MindReset!",
    loadingTitle: "PREPARING YOUR ACCESS...",
    errorHeading: "Something went wrong",
    errorGoHome: "Go back home",
    fallbackName: "MindReset Member",
    step1Title: "Access the Dashboard",
    step1Desc: "See your personalized panel with everything organized",
    step2Title: "Complete Onboarding",
    step2Desc: "7 quick questions to calibrate your protocol",
    step3Title: "Start your Diagnosis",
    step3Desc: "AI generates your complete behavioral analysis",
    welcomeHeading: "Welcome to MindReset,",
    welcomeSub: "Your behavioral transformation journey starts now. We're happy to have you with us.",
    credentialsHeading: "Your Access Details",
    emailLabel: "Email",
    emailUnavailable: "Email not available",
    passwordLabel: "Default password",
    copySuccess: "Copied!",
    copyDefault: "Copy",
    passwordInstruction: "You can change your password anytime in Settings → Security within the dashboard.",
    diagnosisTimerLabel: "Your personal diagnosis will be required in:",
    whatsNextHeading: "What to do next?",
    accessCta: "ACCESS MINDRESET NOW",
    faqHeading: "Frequently Asked Questions",
    faq1Q: "How do I log in?",
    faq1A: "Use the email from your purchase with the password MindReset2026! (which you can copy above). If you forget the password, use 'Forgot password' on the login screen.",
    faq2Q: "What should I do first?",
    faq2A: "Complete the Onboarding (7 quick questions). Then, access the Diagnosis to receive your personalized behavioral analysis by AI.",
    faq3Q: "Need help?",
    faq3A: "Access our support via email or chat. We're here to help you have the best experience possible.",
    copyright: "All rights reserved.",
  },
  dashboardErrors: {
    connectionHeading: "Connection Interrupted",
    connectionDesc: "We couldn't synchronize your neural profile. This usually happens due to a temporary connection issue.",
    reconnectButton: "Re-establish Connection",
    signOutTryAgain: "Sign out and try again",
    initializing: "Initializing Protocol...",
    failedLoad: "Failed to load dashboard data",
  },
  salesCta: { discoverArchetype: "DISCOVER MY ARCHETYPE →" },
  plansExtra: { guarantee7Days: "7-Day Guarantee", visa: "Visa", mastercard: "Mastercard", stripe: "Stripe", footerCopyright: "MindReset Inc." },
  calendarExportLabels: { markdownOption: "Markdown (.md)", icsOption: "Calendar (.ics)", markdownHeader: "# MindReset Action Matrix\n\n" },
  onboardingExtra: { saveError: "An error occurred while saving your progress. Please try again." },
  settingsExtra: { passwordMinLength: "Password must be at least 8 characters.", passwordMismatch: "Passwords do not match.", passwordChangeError: "Error changing password." },
  commonExtra: { openMenu: "Open menu", protocolVersion: "Protocol v3.0 // 2026" },
  salesV2: {
    b1: {
      eyebrow: "DIAGNOSIS REVEALED",
      h1: "[NOME], this is why nothing you tried before actually worked.",
      promise: "The [PRIMARY] pattern doesn't only cost you money. It costs you career moves, peace in your relationships and hours of sleep. That's why willpower failed — you were fighting the wrong mechanism.",
      cta: "Show me my protocol now →",
      timer: "This analysis expires in a few minutes.",
    },
    b2: {
      title: "[NOME], you've tried everything, right?",
      body: "Spreadsheets. Budgeting apps. New Year resolutions. But the pattern always comes back — under stress, anxiety, or euphoria. As a [PRIMARY], here is what keeps repeating:",
      bullets: [
        "Money: your account empties before the month ends and you don't know exactly where it went.",
        "Money: you make financial decisions you know are wrong… and keep making them.",
        "Career: you accept less than you deserve, or jump from project to project without closing any.",
        "Career: the raise arrived, but the feeling of instability stayed exactly the same.",
        "Love: you avoid money conversations with the people you love — until they explode about something else.",
        "Love: you scroll Instagram and feel the good life keeps happening to other people.",
        "Personal: healthy habits (gym, reading, sleep) last less than the initial buzz.",
        "Personal: every new attempt starts with conviction and ends with the same line — 'this time will be different'.",
      ],
      conclusion: "It's not you. It's a pattern. And patterns change — once you finally know which one is yours.",
    },
    b3: {
      title: "The problem is not what you know about money.",
      body: "Behavioral neuroscience confirms it: 95% of financial decisions are made by the emotional system — not the rational one.",
      references: "Kahneman (Nobel 2002), Thaler (Nobel 2017) and Ariely spent decades studying exactly this.",
      proofSeal: "Based on 14 peer-reviewed studies · 12,000 diagnoses validated across 5 countries",
      pivot: "Spreadsheets don't solve a problem that isn't a spreadsheet problem.",
      solution: "MindReset was built to work where the problem actually lives — in the mind of a [PRIMARY].",
    },
    b4: {
      title: "[NOME], your [PRIMARY] diagnosis across 4 dimensions.",
      subtitle: "Four dimensions mapped to your archetype. The numbers below are yours — not averages, not estimates.",
      features: [
        { title: "Money", description: "How a [PRIMARY] makes invisible financial decisions daily — and the exact trigger to disarm in the next 24h." },
        { title: "Career", description: "Why your professional pattern holds you back, and the concrete next step to take this week." },
        { title: "Love", description: "How [PRIMARY] shows up in your relationships — and the literal script for the next hard money conversation." },
        { title: "Personal", description: "The anchor habit that, once you change it, breaks 3 other automatic patterns in 90 days." },
      ],
    },
    b5: {
      eyebrow: "WHAT YOU'LL GET",
      title: "Everything you need to break the [PRIMARY] pattern.",
      subtitle: "Six pieces that work together — built specifically for your archetype.",
      deliverables: [
        { title: "Personalized 4D Diagnosis", description: "Your archetype mapped across the 4 critical areas — money, career, love, personal — with real scores." },
        { title: "90-Day Protocol", description: "30 micro-actions calibrated to disarm the [PRIMARY] trigger in each area, week by week." },
        { title: "Decision Matrix", description: "A 60-second filter so you choose before the impulse decides for you — works for any purchase." },
        { title: "Daily Compass", description: "A 1-minute check-in that catches the pattern coming back — and shows you the drift before it costs." },
        { title: "Monthly Reports", description: "See the real curve of your behavior, month by month, with no self-deception or convenient stories." },
        { title: "Access in 5 languages", description: "PT, EN, PL, RO, AR. For you today, for your family and partners tomorrow." },
      ],
      note: "Lifetime access · No subscription · 30-day unconditional guarantee.",
    },
    b6: {
      counter: "+12,000 diagnoses generated across 5 countries",
      rating: "4.9 / 5 based on user reviews",
      testimonials: [
        { quote: "For the first time I understood why I could never save. It wasn't lack of discipline — it was my [PRIMARY] pattern.", author: "Mariana S.", country: "Portugal", arch: "AO" },
        { quote: "The diagnosis changed how I talk about money with my partner. In 15 days we stopped fighting about it.", author: "Andrzej K.", country: "Poland", arch: "EA" },
        { quote: "I caught the trigger before I bought. No app had ever pulled that off.", author: "Alexandru P.", country: "Romania", arch: "HI" },
        { quote: "Never understood why I burned through everything before day 15. The diagnosis named exactly what I was feeling.", author: "Adam K.", country: "Poland", arch: "HI" },
        { quote: "I thought I was disciplined with money. MindReset showed me I was afraid to spend — and that's a problem too.", author: "Maria C.", country: "Portugal", arch: "AO" },
        { quote: "The career and relationships sections hurt — and that was exactly where I needed to look. Not a report, a mirror.", author: "Rami S.", country: "Saudi Arabia", arch: "EA" },
        { quote: "Got the PDF, read it at night, next day I declined a purchase that used to be automatic. Small detail — huge shift.", author: "Ioana M.", country: "Romania", arch: "SS" },
        { quote: "I'm an engineer, I like data. The diagnosis wasn't astrology — it was a mirror with academic references at the end.", author: "Katarzyna W.", country: "Poland", arch: "AO" },
        { quote: "I thought the problem was my salary. It was the pattern. Today I earn the same and finally have margin after 8 years.", author: "Yousef A.", country: "Saudi Arabia", arch: "HI" },
      ],
    },
    ob1: {
      badge: "MOST ADDED",
      title: "Relationship Guide by Archetype",
      desc: "How each archetype shows up around money. Useful for your partner, family or co-founder to understand your [PRIMARY] — and for you to read theirs.",
      cta: "Yes, add it",
    },
    b7: {
      eyebrow: "FINAL STEP, [NOME]",
      was: "$200",
      then: "$47",
      price: "Today",
      cta: "I want my [PRIMARY] diagnosis now →",
      trust: "✓ 7-day guarantee · ✓ One-time payment · ✓ SSL · ✓ No subscription",
    },
    b8: {
      title: "Frequently asked",
      items: [
        { q: "Is this different from budgeting apps like YNAB or Mint?", a: "Yes. Those apps teach you WHAT to do with money. MindReset reveals WHY, as a [PRIMARY], you can't do what you already know you should. That's the difference between sustainable change and quitting in 30 days." },
        { q: "Do I need to connect my bank account?", a: "No. MindReset works with behavior — not statements. No bank data is requested or stored." },
        { q: "Will it work if I've already tried therapy or financial coaching?", a: "Yes — and it works even better. Therapy works the emotion; coaching works the plan. MindReset works the automatic pattern that sabotages both. They don't compete, they complement." },
        { q: "Does it work for Saudi Arabia, Poland or Romania?", a: "Yes. Already validated across 5 languages with 12,000+ diagnoses. Behavioral psychology is universal — only the way each culture lives it changes. We adapt language, examples and references." },
        { q: "What if I want to cancel or refund?", a: "You have 30 days for a full refund, no questions asked. Cancel in 2 clicks in the customer portal." },
        { q: "Does the AI replace a therapist?", a: "No. It's a behavioral self-awareness tool. Useful for spotting patterns — not a substitute for professional advice." },
      ],
    },
    b9: {
      title: "[NOME], the next screen shows what you get and what it costs.",
      subtitle: "You decide. No pressure, no fine print, no hidden charges.",
      tagline: "You are [PRIMARY] with a [SECONDARY] streak. The next page continues the reading of your pattern — now with the full protocol on the table.",
      cta: "Show me my protocol now →",
      trust: "🔒 Stripe · 🛡️ SSL · 30-day unconditional guarantee",
    },
    ob2: {
      eyebrow: "BEFORE YOU CONTINUE…",
      title: "30-Day Reset Protocol",
      desc: "Daily plan with 30 micro-actions calibrated to break the [PRIMARY] pattern. Delivered with your diagnosis.",
      cta: "Yes, add it",
      decline: "No, I'd rather figure it out alone",
    },
    exit: {
      title: "[NOME], can you really leave now?",
      body: "Every week on [PRIMARY] autopilot costs you decisions you won't get to make again. The next screen shows you the full protocol — no discount, just clarity on what you get.",
      cta: "Show me the protocol →",
      decline: "I'd rather stay as I am",
    },
  },
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
    securePayment: "Bezpieczna płatność przez Stripe", processing: "Przetwarzanie…",
  },
  login: {
    enterEmailFirst: "Najpierw wpisz swój e-mail.",
    checkInbox: "Sprawdź swoją skrzynkę odbiorczą.",
    forgotPassword: "Zapomniałeś hasła?",
    subscriptionEnded: "⏳ Twoja subskrypcja została zakończona.",
    subscriptionRenew: "Odnow plan, aby kontynuować dostęp do MindReset.",
  },
  notFound: { title: "Nie znaleziono strony", desc: "Strona, której szukasz, nie została znaleziona lub została przeniesiona.", goHome: "Strona główna" },
  errorPage: { title: "Ta strona nie załadowała się", desc: "Coś poszło nie tak po naszej stronie. Możesz spróbować odświeżyć lub wrócić do strony głównej.", tryAgain: "Spróbuj ponownie", goHome: "Strona główna" },
  hero: {
    kicker: "Finanse behawioralne • 14 pytań • 3 minuty",
    headline: "TWÓJ MÓZG MA WZORZEC,\nKTÓRY SABOTUJE\nTWOJE FINANSE.",
    sub: "To nie brak silnej woli. To archetyp behawioralny, o którym nigdy nie wiedziałeś.",
    cta: "Chcę poznać swój archetyp",
    microcopy: "⚡ 3 minuty · 100% za darmo · Natychmiastowy wynik",
    trust: "+12 000 diagnoz • Bez karty na start",
    trustSsl: "Bezpieczne SSL",
    trustData: "Dane chronione",
    trustGuarantee: "7-dniowa gwarancja",
  },
  identity: { title: "Zanim zaczniemy — kim jesteś?", sub: "Użyjemy Twojego imienia w całej diagnozie, żeby była osobista." },
  questions: { title: (n, total) => `Pytanie ${n} z ${total}`, intro: (name) => `${name}, wybierz odpowiedź najbliższą Tobie — nie ma złych.` },
  emailCapture: { title: (name) => `${name}, Twoja diagnoza jest gotowa.`, sub: "Podaj e-mail, aby otrzymać pełny raport i odblokować stronę archetypu.", cta: "Pokaż mój archetyp teraz" },
  quizProgress: { identity: "Identyfikacja", email: "Finalizacja" },
  loader: { ...EN.loader, title: "Przetwarzam Twoje odpowiedzi", steps: ["Krzyżuję 8 odpowiedzi z 4 archetypami…","Identyfikuję dominujący wzorzec…","Przygotowuję wynik…"] },
  reveal: {
    ...EN.reveal,
    kicker: (name) => `${name}, Twój archetyp to:`,
    sub: "To nie przypadek.\nTo wzorzec — a wzorce można zmieniać",
    cta: "Uzyskaj dostęp do protokołu teraz",
    share: "Udostępnij mój archetyp",
    errorTitle: "Nie udało się zapisać diagnozy.",
    errorBody: "Twój wynik nadal się wyświetla, ale link do udostępniania nie jest dostępny.",
    errorRetry: "Spróbuj ponownie",
    areasTitle: "Ten sam wzorzec. 4 obszary Twojego życia.",
    areasIntro: (name) => `${name}, Twój archetyp nie żyje tylko na koncie. Zobacz, gdzie się ujawnia — i ile Cię kosztuje.`,
    areas: {
      money: { label: "Pieniądze", byArch: { ...EN.reveal.areas.money.byArch,
        AO: "Oszczędzasz, ale nigdy nie czujesz się bezpiecznie — niedobór tkwi głębiej niż saldo.",
        SS: "Wydajesz, żeby pokazać przynależność. Pieniądze stają się wystawą, nie wolnością.",
        EA: "Unikasz patrzenia na finanse — rachunki rosną, długi pęcznieją w ciszy.",
        HI: "Wszystko wpływa, wszystko wypływa. Tu i teraz zawsze waży więcej niż plan.",
      } },
      career: { label: "Kariera", byArch: { ...EN.reveal.areas.career.byArch,
        AO: "Przyjmujesz mniej, niż jesteś wart, w imię stabilności. Tracisz dekady w strefie bezpieczeństwa.",
        SS: "Wybierasz stanowiska dla prestiżu, nie dla życia, jakie naprawdę budują.",
        EA: "Odkładasz podwyżki, trudne rozmowy, zmiany — aż stają się nagłymi wypadkami.",
        HI: "Skaczesz między projektami w pogoni za nowym dreszczem. Rzadko zbierasz, co posiałeś.",
      } },
      love: { label: "Miłość", byArch: { ...EN.reveal.areas.love.byArch,
        AO: "Mierzysz uczucie użytecznością. Przyjmowanie bez zobowiązania jest niewygodne.",
        SS: "Wybierasz partnerów, którzy potwierdzają Twój wizerunek. Prawdziwa bliskość schodzi na drugi plan.",
        EA: "Unikasz rozmów, które się liczą. Konflikt zamienia się w dystans — długi i cichy.",
        HI: "Żyjesz krótkimi, intensywnymi pasjami. Zobowiązanie wydaje się klatką — aż przychodzi żal.",
      } },
      personal: { label: "Życie osobiste", byArch: { ...EN.reveal.areas.personal.byArch,
        AO: "Odraczasz odpoczynek, przyjemność i troskę o siebie w imię bezpieczeństwa, które nigdy nie nadchodzi.",
        SS: "Budujesz nienaganną tożsamość zewnętrzną — a wewnątrz czujesz, że nikt Cię naprawdę nie zna.",
        EA: "Zagłuszasz nudę i lęk rozproszeniem. Życie dzieje się jak we mgle.",
        HI: "Energia skokowa. Zdrowe nawyki trwają dni, nie miesiące.",
      } },
    },
    areasCta: "Chcę zobaczyć pełną diagnozę",
    anchor: (arch) => `73% osób typu ${arch} zgłasza ten sam wzorzec w co najmniej 3 z tych 4 obszarów. Nie jesteś sam — i właśnie to sprawia, że ten wzorzec da się rozwiązać.`,
    urgency: "Ta analiza wygasa za",
    guarantee: "7 dni gwarancji · Jednorazowa płatność · Bez subskrypcji",
    finalTitle: (name) => `${name}, możesz przestać zgadywać.`,
    finalSub: "Pełna diagnoza pokazuje dokładny wyzwalacz, wzorzec stojący za nim i 30-dniowy plan, który go rozbroi.",
    finalCta: "Chcę moją pełną diagnozę",
  },
  plans: { ...EN.plans, title: "Wybierz długość swojego Resetu", sub: "Subskrypcja odnawialna. Anulujesz kiedy chcesz.", mostPopular: "NAJPOPULARNIEJSZE", p30: "30 dni", p6m: "6 miesięcy", p1y: "1 rok", chooseCta: "Chcę ten plan", guarantee: "7 dni pełnego zwrotu — bez pytań." },
  cookies: { body: "Używamy technologii lokalizacyjnych do personalizacji Twojego doświadczenia. Kontynuując zgadzasz się z naszą Polityką Prywatności." },
  archetypes: {
    AO: { ...EN.archetypes.AO, name: "KOMPULSYWNY\nCIUŁACZ" },
    SS: { ...EN.archetypes.SS, name: "ŁOWCA\nSTATUSU" },
    EA: { ...EN.archetypes.EA, name: "UNIKAJĄCY\nUCIEKINIER" },
    HI: { ...EN.archetypes.HI, name: "IMPULSYWNY\nHEDONISTA" },
  },
  landing: {
    proofBar: {
      ariaLabel: "Wskaźniki zaufania",
      diagnostics: { value: "+12 000", label: "Zrealizowanych diagnoz" },
      rating: { value: "4.9 / 5", label: "Średnia ocena" },
      noBank: { value: "100%", label: "Bez danych bankowych" },
      languages: { value: "5", label: "Obsługiwanych języków" },
    },
    beliefBreak: {
      tag: "NAUKA\u00a0 ZA\u00a0 TYM",
      title: "PROBLEMEM\u00a0 NIE\u00a0 SĄ\u00a0 TWOJE\u00a0 PIENIĄDZE.\u00a0 PROBLEMEM\u00a0 JEST\u00a0 TWÓJ\u00a0 WZORZEC.",
      intro: "Trzech laureatów Nagrody Nobla już to udowodniło. Tylko nigdy nie usłyszałeś tego w ten sposób.",
      cards: [
        { author: "Daniel Kahneman", quote: "System 1 decyduje. System 2 racjonalizuje.", insight: "95% twoich decyzji finansowych jest automatycznych — nie przemyślanych." },
        { author: "Richard Thaler", quote: "Nie jesteśmy racjonalni. Jesteśmy przewidywalni.", insight: "Powtarzasz te same błędy — zawsze na te same wyzwalacze." },
        { author: "Dan Ariely", quote: "Nie kontrolujesz pieniędzy. Twój wzorzec kontroluje ciebie.", insight: "Dopóki nie nazwiesz wzorca, on decyduje za ciebie." },
      ],
      punchline: "Problemem nie są twoje pieniądze. Problemem jest twój wzorzec.",
    },
    archetypes: {
      tag: "4 Archetypy",
      title: "Jaki jest Twój niewidzialny wzorzec?",
      sub: "Ten sam emocjonalny wzorzec pojawia się w 4 obszarach: pieniądze, kariera, miłość, życie osobiste. Odkryj swój w mniej niż 3 minuty.",
      items: {
        AO: { name: "Obsesyjny Zbieracz", trigger: "Wyzwalacz: strach przed brakiem", desc: "Gromadzi z obsesją. Trudność w wydawaniu nawet przy zdrowym saldzie. Poczucie bezpieczeństwa nigdy nie wydaje się wystarczające." },
        SS: { name: "Łowca Statusu", trigger: "Wyzwalacz: aprobata społeczna", desc: "Wydaje, by imponować. Status jest emocjonalną walutą. Zewnętrzny wizerunek ważniejszy niż realne zdrowie finansowe." },
        EA: { name: "Finansowy Unik", trigger: "Wyzwalacz: ucieczka i zaprzeczenie", desc: "Unika rozmów o pieniądzach. Ignoruje wyciągi i rachunki. Dyskomfort finansowy znieczulany unikaniem." },
        HI: { name: "Impulsywny Hedonista", trigger: "Wyzwalacz: natychmiastowa przyjemność", desc: "Kupuje impulsywnie, żyje tu i teraz. Ekscytacja chwili przesłania każdy plan. Teraźniejszość zawsze wygrywa." },
      },
    },
    howItWorks: {
      tag: "Jak to działa",
      title: "Proste. Głębokie. Skuteczne.",
      sub: "Bez arkuszy. Bez danych bankowych. Tylko pytania o to, jak naprawdę się zachowujesz.",
      steps: [
        { title: "Odpowiedz na 8 pytań", desc: "O realnym zachowaniu, nie teorii finansowej. Bez oceniania." },
        { title: "Otrzymaj swoją diagnozę", desc: "AI mapuje Twój archetyp w 4 wymiarach: finansowym, zawodowym, miłosnym i osobistym." },
        { title: "Odbierz PDF", desc: "PDF 30+ stron w skrzynce z pełną diagnozą we wszystkich 4 obszarach. Czytasz, kiedy chcesz." },
      ],
    },
    features: {
      tag: "Co otrzymujesz",
      title: "Jeden PDF. Cztery obszary.\nZero aplikacji.",
      items: [
        { icon: "💰", title: "Wymiar Finansowy", desc: "Jak Twój archetyp wykrzywia decyzje finansowe — i konkretny plan wyjścia z pętli niedoboru, statusu lub impulsu.", meta: "Diagnoza + 5 działań" },
        { icon: "💼", title: "Wymiar Zawodowy", desc: "Dlaczego akceptujesz mniej, niż jesteś wart (albo skaczesz od projektu do projektu). Jak wzorzec sabotuje karierę, a Ty tego nie widzisz.", meta: "Diagnoza + 5 działań" },
        { icon: "❤️", title: "Wymiar Miłosny", desc: "Twój archetyp wybiera partnerów, unika konfliktów i mierzy uczucie. Jak przerwać cykl w relacjach, które najbardziej się liczą.", meta: "Diagnoza + 5 działań" },
        { icon: "🧘", title: "Wymiar Osobisty", desc: "Zdrowie, odpoczynek, tożsamość, nawyki. Gdzie wzorzec kradnie Ci lata, a Ty tego nie widzisz — i jak zbudować reset.", meta: "Diagnoza + 5 działań" },
      ],
    },
    testimonials: {
      tag: "Opinie",
      title: "Kto już zrozumiał swój wzorzec",
      starsAlt: (n) => `${n} z ${n} gwiazdek`,
      items: [
        { stars: 5, quote: "Nigdy nie rozumiałem, dlaczego wydawałem wszystko przed 15. dniem miesiąca. Diagnoza nazwała dokładnie to, co czułem. Jakby ktoś w końcu wytłumaczył mnie mnie samemu.", name: "Adam K.", arch: "Archetyp: Impulsywny Hedonista" },
        { stars: 5, quote: "Myślałam, że jestem zdyscyplinowana z pieniędzmi. MindReset pokazał mi, że bałam się wydawać — i że to też jest problem. To było objawienie.", name: "Maria C.", arch: "Archetyp: Obsesyjna Oszczędna" },
        { stars: 5, quote: "Sekcje o karierze i relacjach zabolały — i właśnie tam musiałem spojrzeć. To nie jest tylko raport finansowy, to lustro.", name: "Rami S.", arch: "Archetyp: Unikający Duch" },
      ],
    },
    faq: {
      tag: "Najczęściej Zadawane Pytania",
      title: "Pytania, które\nprawdopodobnie masz",
      sub: "Jeśli cokolwiek jest jeszcze niejasne, przycisk rozpoczęcia diagnozy rozwiąże większość z nich w 3 minuty.",
      cta: "Zrób darmową diagnozę",
      items: [
        { q: "Czy MindReset ma dostęp do moich danych bankowych?", a: "Nie. MindReset nigdy nie uzyskuje dostępu do kont, wyciągów ani żadnych informacji bankowych. Diagnoza opiera się wyłącznie na Twoich behawioralnych odpowiedziach w quizie — bez żadnej integracji bankowej." },
        { q: "Czy diagnoza jest naprawdę spersonalizowana?", a: "Tak. AI (GPT-4o) generuje unikalny raport na podstawie Twojego archetypu, imienia, płci i indywidualnych odpowiedzi. To nie jest generyczny tekst — jest napisany specjalnie dla Ciebie i trwale zapisany." },
        { q: "Czy to dotyczy tylko pieniędzy?", a: "Nie. Diagnoza obejmuje 4 obszary: pieniądze, karierę, miłość i życie osobiste. Ten sam emocjonalny wzorzec pojawia się we wszystkich — zmienia się tylko koszt." },
        { q: "Co dokładnie otrzymam?", a: "PDF 30+ stron na e-mail w ciągu kilku minut. Diagnozę archetypu we wszystkich 4 obszarach, 20 konkretnych działań (5 na obszar) i mapę Twoich relacji według archetypów." },
        { q: "Czy to subskrypcja czy płatność jednorazowa?", a: "Płatność jednorazowa. Bez aplikacji, bez miesięcznej opłaty, bez lock-inu. Kupujesz raz, dostajesz PDF, jest Twój na zawsze." },
        { q: "A jeśli mi się nie spodoba?", a: "7-dniowa gwarancja bez pytań. Jeśli produkt nie dostarczy tego, co obiecuje, zwracamy 100% zapłaconej kwoty." },
      ],
    },
    finalCta: {
      titleBefore: "Wzorzec sabotujący 4 obszary Twojego życia ma nazwę.\nCzas ",
      titleHighlight: "odkryć",
      titleAfter: ", jaki to.",
      sub: "8 pytań. 3 minuty. Jasność, której żaden arkusz nie da.",
      cta: "Rozpocznij moją darmową diagnozę",
      guarantee: "7-dniowa gwarancja",
      trustLine: "🔒 Stripe • 🛡️ SSL • Anuluj w każdej chwili",
    },
  },
  checkout: { welcomeNotification: { title: "🎉 Witamy w MindReset!", body: "Twoja subskrypcja jest aktywna. Kliknij tutaj, aby rozpocząć diagnozę." } },
  resetPassword: { title: "Ustaw nowe hasło", placeholder: "Nowe hasło", updating: "Aktualizowanie…", updateButton: "Aktualizuj hasło", success: "Hasło zaktualizowane. Możesz się teraz zalogować." },
  sharePage: { metaTitle: "Udostępnij Archetyp", metaDescription: "Zobacz wynik diagnozy behawioralnej." },
  obrigado: {
    metaTitle: "Witamy w MindReset!",
    loadingTitle: "PRZYGOTOWYWANIE DOSTĘPU...",
    errorHeading: "Coś poszło nie tak",
    errorGoHome: "Wróć do strony głównej",
    fallbackName: "Członek MindReset",
    step1Title: "Przejdź do Panelu",
    step1Desc: "Zobacz swój spersonalizowany panel ze wszystkim uporządkowanym",
    step2Title: "Ukończ Onboarding",
    step2Desc: "7 szybkich pytań do kalibracji protokołu",
    step3Title: "Rozpocznij Diagnozę",
    step3Desc: "AI generuje kompletną analizę behawioralną",
    welcomeHeading: "Witamy w MindReset,",
    welcomeSub: "Twoja podróż transformacji behawioralnej zaczyna się teraz. Cieszymy się, że jesteś z nami.",
    credentialsHeading: "Twoje Dane Dostępu",
    emailLabel: "Email",
    emailUnavailable: "Email niedostępny",
    passwordLabel: "Domyślne hasło",
    copySuccess: "Skopiowano!",
    copyDefault: "Kopiuj",
    passwordInstruction: "Możesz zmienić hasło w dowolnym momencie w Ustawieniach → Bezpieczeństwo w panelu.",
    diagnosisTimerLabel: "Twoja osobista diagnoza będzie potrzebna za:",
    whatsNextHeading: "Co dalej?",
    accessCta: "PRZEJDŹ DO MINDRESET TERAZ",
    faqHeading: "Często Zadawane Pytania",
    faq1Q: "Jak się zalogować?",
    faq1A: "Użyj emaila z zakupu z hasłem MindReset2026! (które możesz skopiować powyżej). Jeśli zapomnisz hasła, użyj 'Zapomniałem hasła' na ekranie logowania.",
    faq2Q: "Co zrobić najpierw?",
    faq2A: "Ukończ Onboarding (7 szybkich pytań). Następnie przejdź do Diagnozy, aby otrzymać spersonalizowaną analizę behawioralną od AI.",
    faq3Q: "Potrzebujesz pomocy?",
    faq3A: "Skontaktuj się z naszym wsparciem przez email lub czat. Jesteśmy tutaj, aby pomóc Ci mieć najlepsze możliwe doświadczenie.",
    copyright: "Wszelkie prawa zastrzeżone.",
  },
  dashboardErrors: {
    connectionHeading: "Przerwano Połączenie",
    connectionDesc: "Nie udało się zsynchronizować Twojego profilu neuronalnego. Zwykle dzieje się tak z powodu tymczasowego problemu z połączeniem.",
    reconnectButton: "Przywróć Połączenie",
    signOutTryAgain: "Wyloguj się i spróbuj ponownie",
    initializing: "Inicjalizowanie Protokołu...",
    failedLoad: "Nie udało się załadować danych panelu",
  },
  salesCta: { discoverArchetype: "ODKRYJ MÓJ ARCHETYP →" },
  plansExtra: { guarantee7Days: "7-dniowa Gwarancja", visa: "Visa", mastercard: "Mastercard", stripe: "Stripe", footerCopyright: "MindReset Inc." },
  calendarExportLabels: { markdownOption: "Markdown (.md)", icsOption: "Kalendarz (.ics)", markdownHeader: "# MindReset Action Matrix\n\n" },
  onboardingExtra: { saveError: "Wystąpił błąd podczas zapisywania postępu. Spróbuj ponownie." },
  settingsExtra: { passwordMinLength: "Hasło musi mieć co najmniej 8 znaków.", passwordMismatch: "Hasła nie są zgodne.", passwordChangeError: "Błąd zmiany hasła." },
  commonExtra: { openMenu: "Otwórz menu", protocolVersion: "Protocol v3.0 // 2026" },
  salesV2: {
    b1: {
      eyebrow: "DIAGNOZA UJAWNIONA",
      h1: "[NOME], właśnie dlatego nic, co próbowałeś wcześniej, nie zadziałało.",
      promise: "Wzorzec [PRIMARY] nie kosztuje cię tylko pieniędzy. Kosztuje cię decyzji w karierze, spokoju w związkach i godzin snu. Dlatego siła woli zawiodła — walczyłeś z niewłaściwym mechanizmem.",
      cta: "Pokaż mi mój protokół teraz →",
      timer: "Ta analiza wygasa za kilka minut.",
    },
    b2: {
      title: "[NOME], próbowałeś już wszystkiego, prawda?",
      body: "Arkusze Excela. Aplikacje budżetowe. Postanowienia noworoczne. Ale wzorzec zawsze wraca — pod wpływem stresu, lęku lub euforii. Jako [PRIMARY], oto co się powtarza:",
      bullets: [
        "Pieniądze: twoje konto pustoszeje przed końcem miesiąca i nie wiesz dokładnie, gdzie poszły.",
        "Pieniądze: podejmujesz decyzje finansowe, o których wiesz, że są błędne… i nadal je podejmujesz.",
        "Kariera: akceptujesz mniej, niż zasługujesz, albo skaczesz z projektu na projekt, niczego nie kończąc.",
        "Kariera: podwyżka przyszła, ale poczucie niestabilności pozostało dokładnie takie samo.",
        "Miłość: unikasz rozmów o pieniądzach z bliskimi — aż wybuchają z zupełnie innego powodu.",
        "Miłość: scrollujesz Instagrama i czujesz, że dobre życie ciągle przytrafia się innym.",
        "Osobiste: zdrowe nawyki (siłownia, czytanie, sen) trwają krócej niż początkowa euforia.",
        "Osobiste: każda nowa próba zaczyna się przekonaniem i kończy tym samym zdaniem — 'tym razem będzie inaczej'.",
      ],
      conclusion: "To nie ty. To wzorzec. A wzorce się zmienia — gdy wreszcie wiesz, który jest twój.",
    },
    b3: {
      title: "Problem nie tkwi w tym, co wiesz o pieniądzach.",
      body: "Neuronauka behawioralna to potwierdza: 95% decyzji finansowych podejmuje system emocjonalny — nie racjonalny.",
      references: "Kahneman (Nobel 2002), Thaler (Nobel 2017) i Ariely spędzili dekady badając właśnie to.",
      proofSeal: "Oparte na 14 recenzowanych badaniach · 12 000 diagnoz potwierdzonych w 5 krajach",
      pivot: "Arkusze nie rozwiązują problemu, który nie jest problemem arkusza.",
      solution: "MindReset został zbudowany, by działać tam, gdzie problem naprawdę istnieje — w umyśle osoby typu [PRIMARY].",
    },
    b4: {
      title: "[NOME], twoja diagnoza [PRIMARY] w 4 wymiarach.",
      subtitle: "Cztery wymiary zmapowane dla twojego archetypu. Liczby poniżej są twoje — nie średnie, nie szacunki.",
      features: [
        { title: "Pieniądze", description: "Jak [PRIMARY] podejmuje codziennie niewidoczne decyzje finansowe — i jak rozbroić dokładny wyzwalacz w ciągu najbliższych 24h." },
        { title: "Kariera", description: "Dlaczego twój wzorzec zawodowy cię blokuje, i jaki konkretny krok zrobić w tym tygodniu." },
        { title: "Miłość", description: "Jak [PRIMARY] manifestuje się w twoich relacjach — i dosłowny skrypt do najbliższej trudnej rozmowy o pieniądzach." },
        { title: "Osobiste", description: "Nawyk-kotwica, który zmieniony obala 3 inne automatyczne wzorce w 90 dni." },
      ],
    },
    b5: {
      eyebrow: "CO OTRZYMASZ",
      title: "Wszystko, czego potrzebujesz, by wyjść ze wzorca [PRIMARY].",
      subtitle: "Sześć elementów działających razem — zbudowanych specjalnie dla twojego archetypu.",
      deliverables: [
        { title: "Spersonalizowana diagnoza 4D", description: "Mapa twojego archetypu w 4 kluczowych obszarach — pieniądze, kariera, miłość, osobiste — z realnymi wynikami." },
        { title: "Protokół 90 dni", description: "30 mikrodziałań skalibrowanych pod rozbrojenie wyzwalacza [PRIMARY] w każdym obszarze, tydzień po tygodniu." },
        { title: "Matryca Decyzji", description: "60-sekundowy filtr, żebyś wybierał, zanim impuls zdecyduje za ciebie — działa przy każdym zakupie." },
        { title: "Codzienny Kompas", description: "1-minutowy check-in, który wychwytuje powrót wzorca — i pokazuje odchylenie, zanim cię kosztuje." },
        { title: "Raporty miesięczne", description: "Widzisz realną krzywą swojego zachowania, miesiąc po miesiącu, bez autooszustw i wygodnych narracji." },
        { title: "Dostęp w 5 językach", description: "PT, EN, PL, RO, AR. Dla ciebie dziś, dla rodziny i partnerów jutro." },
      ],
      note: "Dostęp dożywotni · Bez subskrypcji · Bezwarunkowa gwarancja 30 dni.",
    },
    b6: {
      counter: "+12 000 diagnoz wykonanych w 5 krajach",
      rating: "4,9 / 5 na podstawie opinii użytkowników",
      testimonials: [
        { quote: "Po raz pierwszy zrozumiałam, dlaczego nigdy nie potrafiłam oszczędzać. To nie był brak dyscypliny — to mój wzorzec [PRIMARY].", author: "Mariana S.", country: "Portugalia", arch: "AO" },
        { quote: "Diagnoza zmieniła sposób, w jaki rozmawiam z partnerem o pieniądzach. W 15 dni przestaliśmy się kłócić.", author: "Andrzej K.", country: "Polska", arch: "EA" },
        { quote: "Złapałem wyzwalacz, zanim kupiłem. Żadna aplikacja tego nie potrafiła.", author: "Alexandru P.", country: "Rumunia", arch: "HI" },
        { quote: "Nigdy nie rozumiałem, dlaczego przepalam wszystko przed 15. dniem miesiąca. Diagnoza nazwała dokładnie to, co czułem.", author: "Adam K.", country: "Polska", arch: "HI" },
        { quote: "Uważałam się za zdyscyplinowaną. MindReset pokazał, że bałam się wydawać — a to też jest problem.", author: "Maria C.", country: "Portugalia", arch: "AO" },
        { quote: "Sekcje o karierze i relacjach zabolały — i właśnie tam musiałem spojrzeć. To nie raport, to lustro.", author: "Rami S.", country: "Arabia Saudyjska", arch: "EA" },
        { quote: "Dostałam PDF, przeczytałam wieczorem, następnego dnia odmówiłam zakupu, który był wcześniej automatyczny. Mały szczegół — ogromna zmiana.", author: "Ioana M.", country: "Rumunia", arch: "SS" },
        { quote: "Jestem inżynierką, lubię dane. Diagnoza to nie astrologia — to lustro z akademickimi odniesieniami na końcu.", author: "Katarzyna W.", country: "Polska", arch: "AO" },
        { quote: "Myślałem, że problemem jest pensja. To był wzorzec. Dziś zarabiam tyle samo i pierwszy raz od 8 lat mam margines.", author: "Yousef A.", country: "Arabia Saudyjska", arch: "HI" },
      ],
    },
    ob1: {
      badge: "NAJCZĘŚCIEJ DODAWANE",
      title: "Przewodnik po Relacjach według Archetypów",
      desc: "Jak każdy archetyp zachowuje się wobec pieniędzy. Przydatne dla partnera, rodziny lub wspólnika, żeby zrozumieli twoje [PRIMARY] — a ty ich.",
      cta: "Tak, dodaję",
    },
    b7: {
      eyebrow: "OSTATNI KROK, [NOME]",
      was: "200 $",
      then: "47 $",
      price: "Dziś",
      cta: "Chcę moją diagnozę [PRIMARY] teraz →",
      trust: "✓ 7 dni gwarancji · ✓ Płatność jednorazowa · ✓ SSL · ✓ Bez subskrypcji",
    },
    b8: {
      title: "Najczęściej zadawane pytania",
      items: [
        { q: "Czym to się różni od aplikacji budżetowych jak YNAB czy Mint?", a: "Te aplikacje uczą CO robić z pieniędzmi. MindReset ujawnia DLACZEGO jako [PRIMARY] nie potrafisz robić tego, co już wiesz, że powinieneś. To różnica między trwałą zmianą a porzuceniem po 30 dniach." },
        { q: "Czy muszę podłączyć konto bankowe?", a: "Nie. MindReset pracuje z zachowaniem — nie z wyciągami. Żadne dane bankowe nie są pobierane ani przechowywane." },
        { q: "Czy zadziała, jeśli już próbowałem terapii lub coachingu finansowego?", a: "Tak — i działa wtedy jeszcze lepiej. Terapia pracuje z emocją; coaching z planem. MindReset pracuje z automatycznym wzorcem, który sabotuje oba. Nie konkurują, uzupełniają się." },
        { q: "Czy działa dla Arabii Saudyjskiej, Polski lub Rumunii?", a: "Tak. Już zweryfikowane w 5 językach na ponad 12 000 diagnozach. Psychologia behawioralna jest uniwersalna — zmienia się tylko sposób, w jaki każda kultura ją przeżywa. Dostosowujemy język, przykłady i odniesienia." },
        { q: "A jeśli będę chciał anulować lub uzyskać zwrot?", a: "Masz 30 dni na pełny zwrot, bez pytań. Anulowanie w 2 kliknięciach w portalu klienta." },
        { q: "Czy AI zastępuje psychologa?", a: "Nie. To narzędzie samoświadomości behawioralnej. Pomaga dostrzec wzorce — nie zastępuje porady specjalisty." },
      ],
    },
    b9: {
      title: "[NOME], następny ekran pokazuje, co dostajesz i ile to kosztuje.",
      subtitle: "Decydujesz ty. Bez presji, bez drobnego druku, bez ukrytych opłat.",
      tagline: "Jesteś [PRIMARY] z domieszką [SECONDARY]. Kolejna strona kontynuuje czytanie twojego wzorca — teraz z pełnym protokołem na stole.",
      cta: "Pokaż mi mój protokół teraz →",
      trust: "🔒 Stripe · 🛡️ SSL · 30-dniowa bezwarunkowa gwarancja",
    },
    ob2: {
      eyebrow: "ZANIM PRZEJDZIESZ DALEJ…",
      title: "Protokół Reset 30 dni",
      desc: "Codzienny plan z 30 mikrodziałaniami skalibrowanymi pod wzorzec [PRIMARY]. Otrzymujesz razem z diagnozą.",
      cta: "Tak, dodaję",
      decline: "Nie, wolę odkryć sam",
    },
    exit: {
      title: "[NOME], naprawdę możesz teraz wyjść?",
      body: "Każdy tydzień na autopilocie [PRIMARY] kosztuje cię decyzje, których już nie podejmiesz. Następny ekran pokazuje cały protokół — bez zniżki, z jasnością co do tego, co dostajesz.",
      cta: "Pokaż mi protokół →",
      decline: "Wolę zostać tak jak jestem",
    },
  },
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
    securePayment: "Plată securizată prin Stripe", processing: "Se procesează…",
  },
  login: {
    enterEmailFirst: "Introdu adresa de e-mail mai întâi.",
    checkInbox: "Verifică-ți căsuța poștală.",
    forgotPassword: "Ai uitat parola?",
    subscriptionEnded: "⏳ Abonamentul tău a expirat.",
    subscriptionRenew: "Reînnoiește planul pentru a continua accesul la MindReset.",
  },
  notFound: { title: "Pagina nu a fost găsită", desc: "Pagina pe care o cauți nu există sau a fost mutată.", goHome: "Acasă" },
  errorPage: { title: "Această pagină nu s-a încărcat", desc: "Ceva a mers greșit la noi. Poți încerca să reîncarci sau să te întorci acasă.", tryAgain: "Încearcă din nou", goHome: "Acasă" },
  hero: {
    kicker: "Finanțe comportamentale • 14 întrebări • 3 minute",
    headline: "CREIERUL TĂU ARE UN TIPAR\nCARE ÎȚI SABOTEAZĂ\nFINANȚELE.",
    sub: "Nu e lipsă de voință. E un arhetip comportamental despre care n-ai știut niciodată.",
    cta: "Vreau să-mi descopăr arhetipul",
    microcopy: "⚡ 3 minute · 100% gratuit · Rezultat instant",
    trust: "+12.000 de diagnoze • Fără card pentru a începe",
    trustSsl: "SSL Securizat",
    trustData: "Date Protejate",
    trustGuarantee: "Garanție 7 zile",
  },
  identity: { title: "Înainte să începem — cine ești?", sub: "Vom folosi prenumele tău în toată diagnoza ca să fie personală." },
  questions: { title: (n, total) => `Întrebarea ${n} din ${total}`, intro: (name) => `${name}, alege opțiunea care îți seamănă cel mai mult — nu există răspunsuri greșite.` },
  emailCapture: { title: (name) => `${name}, diagnoza ta este gata.`, sub: "Lasă e-mailul pentru a primi raportul complet și a-ți debloca pagina arhetipului.", cta: "Vezi-mi arhetipul acum" },
  quizProgress: { identity: "Identificare", email: "Finalizare" },
  loader: { ...EN.loader, title: "Procesez răspunsurile tale", steps: ["Cross-check pe 8 răspunsuri și 4 arhetipuri…","Identific tiparul dominant…","Pregătesc revelația…"] },
  reveal: {
    ...EN.reveal,
    kicker: (name) => `${name}, arhetipul tău este:`,
    sub: "Nu e noroc.\nE un tipar — iar tiparele se schimbă",
    cta: "Accesează protocolul meu acum",
    share: "Distribuie arhetipul meu",
    errorTitle: "Nu am putut salva diagnoza.",
    errorBody: "Rezultatul tău apare mai jos, dar linkul de distribuire nu este disponibil.",
    errorRetry: "Încearcă din nou",
    areasTitle: "Același tipar. 4 zone din viața ta.",
    areasIntro: (name) => `${name}, arhetipul tău nu trăiește doar în cont. Uite unde apare — și cât te costă.`,
    areas: {
      money: { label: "Bani", byArch: { ...EN.reveal.areas.money.byArch,
        AO: "Economisești, dar nu te simți niciodată în siguranță — lipsa e mai adâncă decât soldul.",
        SS: "Cheltuiești ca să arăți apartenență. Banii devin vitrină, nu libertate.",
        EA: "Eviți să te uiți la finanțe — facturile se adună, datoriile cresc în liniște.",
        HI: "Tot intră, tot iese. Acum-ul cântărește mereu mai mult decât orice plan.",
      } },
      career: { label: "Carieră", byArch: { ...EN.reveal.areas.career.byArch,
        AO: "Accepți mai puțin decât meriți pentru siguranță. Pierzi decenii în zona de confort.",
        SS: "Alegi funcții pentru prestigiu, nu pentru viața pe care o construiesc cu adevărat.",
        EA: "Amâni măriri, conversații dificile și schimbări — până devin urgențe.",
        HI: "Sari de la un proiect la altul după următoarea descărcare. Rar culegi ce semeni.",
      } },
      love: { label: "Iubire", byArch: { ...EN.reveal.areas.love.byArch,
        AO: "Măsori afecțiunea în utilitate. Să primești fără să datorezi e incomod.",
        SS: "Alegi parteneri care îți validează imaginea. Conexiunea reală vine pe locul doi.",
        EA: "Eviți conversațiile care contează. Conflictul devine distanță — lungă și tăcută.",
        HI: "Trăiești pasiuni scurte și intense. Angajamentul pare cușcă — până vine regretul.",
      } },
      personal: { label: "Viața personală", byArch: { ...EN.reveal.areas.personal.byArch,
        AO: "Amâni odihna, plăcerea și grija de tine în numele unei siguranțe care nu mai vine.",
        SS: "Construiești o identitate exterioară impecabilă — pe dinăuntru simți că nimeni nu te cunoaște.",
        EA: "Amorțești plictisul și anxietatea cu distrageri. Viața se petrece prin ceață.",
        HI: "Energie în vârfuri și prăbușiri. Obiceiurile sănătoase țin zile, nu luni.",
      } },
    },
    areasCta: "Vreau diagnoza completă",
    anchor: (arch) => `73% dintre ${arch} raportează același tipar în cel puțin 3 din aceste 4 zone. Nu ești singur — și exact asta face tiparul rezolvabil.`,
    urgency: "Această analiză expiră în",
    guarantee: "Garanție 7 zile · Plată unică · Fără abonament",
    finalTitle: (name) => `${name}, poți să nu mai ghicești.`,
    finalSub: "Diagnoza completă îți arată declanșatorul exact, tiparul din spatele lui și planul ghidat de 30 de zile pentru a-l desface.",
    finalCta: "Vreau diagnoza mea completă",
  },
  plans: { ...EN.plans, title: "Alege durata Resetului", sub: "Abonament recurent. Anulezi oricând.", mostPopular: "CEL MAI ALES", p30: "30 zile", p6m: "6 luni", p1y: "1 an", chooseCta: "Vreau acest plan", guarantee: "7 zile rambursare integrală — fără întrebări." },
  cookies: { body: "Folosim tehnologii de localizare pentru a-ți personaliza experiența. Continuând ești de acord cu Politica noastră de Confidențialitate." },
  archetypes: {
    AO: { ...EN.archetypes.AO, name: "ACUMULATOR\nOBSESIV" },
    SS: { ...EN.archetypes.SS, name: "CĂUTĂTOR\nDE STATUT" },
    EA: { ...EN.archetypes.EA, name: "EVAZIV\nALIENAT" },
    HI: { ...EN.archetypes.HI, name: "HEDONIST\nIMPULSIV" },
  },
  landing: {
    proofBar: {
      ariaLabel: "Indicatori de încredere",
      diagnostics: { value: "+12.000", label: "Diagnostice realizate" },
      rating: { value: "4.9 / 5", label: "Evaluare medie" },
      noBank: { value: "100%", label: "Fără date bancare" },
      languages: { value: "5", label: "Limbi suportate" },
    },
    beliefBreak: {
      tag: "ȘTIINȚA\u00a0 DIN\u00a0 SPATE",
      title: "PROBLEMA\u00a0 NU\u00a0 SUNT\u00a0 BANII\u00a0 TĂI.\u00a0 ESTE\u00a0 TIPARUL\u00a0 TĂU.",
      intro: "Trei laureați ai Premiului Nobel au demonstrat-o deja. Tu doar nu ai auzit-o așa.",
      cards: [
        { author: "Daniel Kahneman", quote: "Sistemul 1 decide. Sistemul 2 raționalizează.", insight: "95% dintre deciziile tale financiare sunt automate — nu gândite." },
        { author: "Richard Thaler", quote: "Nu suntem raționali. Suntem previzibili.", insight: "Repeți aceleași greșeli — mereu pe aceiași declanșatori." },
        { author: "Dan Ariely", quote: "Nu controlezi banii. Tiparul tău te controlează pe tine.", insight: "Până nu numești tiparul, el decide pentru tine." },
      ],
      punchline: "Problema nu sunt banii tăi. Este tiparul tău.",
    },
    archetypes: {
      tag: "Cele 4 Arhetipuri",
      title: "Care este tiparul tău invizibil?",
      sub: "Același tipar emoțional apare în 4 zone: bani, carieră, dragoste și viață personală. Descoperă-l pe al tău în mai puțin de 3 minute.",
      items: {
        AO: { name: "Acumulator Obsesiv", trigger: "Declanșator: teama de a nu avea", desc: "Acumulează cu obsesia. Dificultate în a cheltui chiar și cu un sold sănătos. Senzația de siguranță nu pare niciodată suficientă." },
        SS: { name: "Căutător de Statut", trigger: "Declanșator: aprobarea socială", desc: "Cheltuie ca să impresioneze. Statutul este moneda emoțională. Imaginea externă valorează mai mult decât sănătatea financiară reală." },
        EA: { name: "Evitant Financiar", trigger: "Declanșator: fugă și negare", desc: "Evită să vorbească despre bani. Ignoră extrase și facturi. Disconfortul financiar este anesteziat de evitare." },
        HI: { name: "Hedonist Impulsiv", trigger: "Declanșator: plăcerea imediată", desc: "Cumpără impulsiv, trăiește acum. Emoția momentului suprascrie orice plan. Prezentul câștigă întotdeauna." },
      },
    },
    howItWorks: {
      tag: "Cum funcționează",
      title: "Simplu. Profund. Eficient.",
      sub: "Fără foi de calcul. Fără date bancare. Doar întrebări despre cum te comporți cu adevărat.",
      steps: [
        { title: "Răspunde la 8 întrebări", desc: "Despre comportamentul real, nu teoria financiară. Fără judecată." },
        { title: "Primește diagnosticul", desc: "AI-ul îți mapează arhetipul în 4 dimensiuni: financiar, profesional, amoros și personal." },
        { title: "Primește PDF-ul", desc: "Un PDF de 30+ pagini în inbox cu diagnoza completă în toate cele 4 zone. Îl citești când vrei." },
      ],
    },
    features: {
      tag: "Ce primești",
      title: "Un PDF. Patru zone.\nZero aplicații.",
      items: [
        { icon: "💰", title: "Dimensiunea Financiară", desc: "Cum îți distorsionează arhetipul deciziile cu banii — și planul concret de ieșire din bucla scărimii, statutului sau impulsului.", meta: "Diagnoză + 5 acțiuni" },
        { icon: "💼", title: "Dimensiunea Profesională", desc: "De ce accepți mai puțin decât meriți (sau sari de la un proiect la altul). Cum tiparul îți sabotează cariera fără să-ți dai seama.", meta: "Diagnoză + 5 acțiuni" },
        { icon: "❤️", title: "Dimensiunea Amoroasă", desc: "Arhetipul tău alege parteneri, evită conflicte și măsoară afecțiunea. Cum rupi ciclul în relațiile care contează cel mai mult.", meta: "Diagnoză + 5 acțiuni" },
        { icon: "🧘", title: "Dimensiunea Personală", desc: "Sănătate, odihnă, identitate, obiceiuri. Unde tiparul te costă ani fără să observi — și cum construiești reset-ul.", meta: "Diagnoză + 5 acțiuni" },
      ],
    },
    testimonials: {
      tag: "Testimoniale",
      title: "Cine a înțeles deja tiparul propriu",
      starsAlt: (n) => `${n} din ${n} stele`,
      items: [
        { stars: 5, quote: "Nu am înțeles niciodată de ce cheltuiam totul înainte de data de 15. Diagnosticul a numit exact ceea ce simțeam. Parcă cineva m-a explicat, în sfârșit, pe mine mie.", name: "Adam K.", arch: "Arhetip: Hedonist Impulsiv" },
        { stars: 5, quote: "Credeam că sunt disciplinată cu banii. MindReset mi-a arătat că îmi era frică să cheltuiesc — și că asta este tot o problemă. A fost revelator.", name: "Maria C.", arch: "Arhetip: Econom Obsesiv" },
        { stars: 5, quote: "Secțiunile despre carieră și relații au durut — și exact acolo trebuia să mă uit. Nu e doar un raport financiar, e o oglindă.", name: "Rami S.", arch: "Arhetip: Fantasmă Evazionistă" },
      ],
    },
    faq: {
      tag: "Întrebări Frecvente",
      title: "Întrebări pe care\nprobabil le ai",
      sub: "Dacă a mai rămas ceva neclar, butonul de a începe diagnosticul rezolvă majoritatea în 3 minute.",
      cta: "Fă diagnosticul gratuit",
      items: [
        { q: "MindReset are acces la datele mele bancare?", a: "Nu. MindReset nu accesează conturi, extrase sau orice informații bancare. Diagnosticul se bazează exclusiv pe răspunsurile tale comportamentale la quiz — fără nicio integrare bancară." },
        { q: "Diagnosticul este într-adevăr personalizat?", a: "Da. AI-ul (GPT-4o) generează un raport unic pe baza arhetipului, numelui, genului și răspunsurilor tale individuale. Nu este un text generic — este scris special pentru tine și salvat permanent." },
        { q: "Este doar despre bani?", a: "Nu. Diagnoza acoperă 4 zone: bani, carieră, dragoste și viață personală. Același tipar emoțional apare în toate — se schimbă doar costul." },
        { q: "Ce primesc exact?", a: "Un PDF de 30+ pagini pe e-mail în câteva minute. Diagnoză a arhetipului în toate cele 4 zone, 20 acțiuni specifice (5 pe zonă) și o hartă a relațiilor tale pe arhetipuri." },
        { q: "Este abonament sau plată unică?", a: "Plată unică. Fără aplicație, fără taxă lunară, fără lock-in. Cumperi o dată, primești PDF-ul, este al tău pentru totdeauna." },
        { q: "Și dacă nu îmi place?", a: "Garanție de 7 zile fără întrebări. Dacă produsul nu livrează ce promite, returnăm 100% din suma plătită." },
      ],
    },
    finalCta: {
      titleBefore: "Tiparul care îți sabotează 4 zone din viață are un nume.\nE timpul să ",
      titleHighlight: "afli",
      titleAfter: " care e.",
      sub: "8 întrebări. 3 minute. O claritate pe care nicio foaie de calcul nu ți-o dă.",
      cta: "Începe diagnosticul meu gratuit",
      guarantee: "Garanție 7 zile",
      trustLine: "🔒 Stripe • 🛡️ SSL • Anulezi oricând",
    },
  },
  checkout: { welcomeNotification: { title: "🎉 Bine ați venit la MindReset!", body: "Abonamentul dvs. este activ. Click aici pentru a începe diagnosticul." } },
  resetPassword: { title: "Setează o parolă nouă", placeholder: "Parolă nouă", updating: "Se actualizează…", updateButton: "Actualizează parola", success: "Parola a fost actualizată. Vă puteți autentifica acum." },
  sharePage: { metaTitle: "Partajează Arhetipul", metaDescription: "Vezi rezultatul diagnozei comportamentale." },
  obrigado: {
    metaTitle: "Bine ați venit la MindReset!",
    loadingTitle: "SE PREGĂTEȘTE ACCESUL...",
    errorHeading: "Ceva nu a mers bine",
    errorGoHome: "Înapoi acasă",
    fallbackName: "Membru MindReset",
    step1Title: "Accesați Panoul",
    step1Desc: "Vedeți panoul personalizat cu totul organizat",
    step2Title: "Completați Onboardingul",
    step2Desc: "7 întrebări rapide pentru calibrarea protocolului",
    step3Title: "Începeți Diagnostica",
    step3Desc: "IA generează analiza comportamentală completă",
    welcomeHeading: "Bine ați venit la MindReset,",
    welcomeSub: "Călătoria dvs. de transformare comportamentală începe acum. Suntem fericiți să vă avem alături.",
    credentialsHeading: "Datele Dvs. de Acces",
    emailLabel: "Email",
    emailUnavailable: "Email indisponibil",
    passwordLabel: "Parola implicită",
    copySuccess: "Copiat!",
    copyDefault: "Copiază",
    passwordInstruction: "Puteți schimba parola oricând în Setări → Securitate din panou.",
    diagnosisTimerLabel: "Diagnosticul dvs. personal va fi necesar în:",
    whatsNextHeading: "Ce să faceți acum?",
    accessCta: "ACCESAȚI MINDRESET ACUM",
    faqHeading: "Întrebări Frecvente",
    faq1Q: "Cum mă autentific?",
    faq1A: "Folosiți emailul de la achiziție cu parola MindReset2026! (pe care o puteți copia mai sus). Dacă uitați parola, folosiți 'Am uitat parola' pe ecranul de autentificare.",
    faq2Q: "Ce să fac mai întâi?",
    faq2A: "Completați Onboardingul (7 întrebări rapide). Apoi, accesați Diagnostica pentru a primi analiza comportamentală personalizată de IA.",
    faq3Q: "Aveți nevoie de ajutor?",
    faq3A: "Accesați suportul nostru prin email sau chat. Suntem aici să vă ajutăm să aveți cea mai bună experiență posibilă.",
    copyright: "Toate drepturile rezervate.",
  },
  dashboardErrors: {
    connectionHeading: "Conexiune Întreruptă",
    connectionDesc: "Nu am reușit să sincronizăm profilul dvs. neuronal. Acest lucru se întâmplă de obicei din cauza unei probleme temporare de conexiune.",
    reconnectButton: "Restabilește Conexiunea",
    signOutTryAgain: "Deconectați-vă și încercați din nou",
    initializing: "Se inițializează Protocolul...",
    failedLoad: "Nu s-au putut încărca datele panoului",
  },
  salesCta: { discoverArchetype: "DESCOPERĂ-MI ARHETIPUL →" },
  plansExtra: { guarantee7Days: "Garanție 7 Zile", visa: "Visa", mastercard: "Mastercard", stripe: "Stripe", footerCopyright: "MindReset Inc." },
  calendarExportLabels: { markdownOption: "Markdown (.md)", icsOption: "Calendar (.ics)", markdownHeader: "# MindReset Action Matrix\n\n" },
  onboardingExtra: { saveError: "A apărut o eroare la salvarea progresului. Vă rugăm să încercați din nou." },
  settingsExtra: { passwordMinLength: "Parola trebuie să aibă cel puțin 8 caractere.", passwordMismatch: " parolele nu se potrivesc.", passwordChangeError: "Eroare la schimbarea parolei." },
  commonExtra: { openMenu: "Deschide meniul", protocolVersion: "Protocol v3.0 // 2026" },
  salesV2: {
    b1: {
      eyebrow: "DIAGNOZĂ DEZVĂLUITĂ",
      h1: "[NOME], de aceea nimic din ce ai încercat înainte nu a funcționat.",
      promise: "Tiparul [PRIMARY] nu te costă doar bani. Te costă decizii în carieră, liniște în relații și ore de somn. De aceea voința a eșuat — luptai cu mecanismul greșit.",
      cta: "Vezi-mi protocolul acum →",
      timer: "Această analiză expiră în câteva minute.",
    },
    b2: {
      title: "[NOME], ai încercat de toate, nu?",
      body: "Tabele Excel. Aplicații de buget. Promisiuni de Anul Nou. Dar tiparul revine mereu — sub stres, anxietate sau euforie. Ca [PRIMARY], iată ce se repetă:",
      bullets: [
        "Bani: contul tău se golește înainte de sfârșitul lunii și nu știi exact unde s-au dus.",
        "Bani: iei decizii financiare despre care știi că sunt greșite… și continui să le iei.",
        "Carieră: accepți mai puțin decât meriți, sau sari de la proiect la proiect fără să închizi nimic.",
        "Carieră: a venit majorarea, dar sentimentul de instabilitate a rămas exact la fel.",
        "Iubire: eviți conversațiile despre bani cu cei dragi — până explodează din alt motiv.",
        "Iubire: scrollezi pe Instagram și simți că viața bună li se întâmplă altora.",
        "Personal: obiceiurile sănătoase (sala, cititul, somnul) durează mai puțin decât entuziasmul inițial.",
        "Personal: fiecare nouă încercare începe cu convingere și se termină cu aceeași frază — 'de data asta o să fie altfel'.",
      ],
      conclusion: "Nu ești tu. E un tipar. Și tiparele se schimbă — odată ce știi în sfârșit care e al tău.",
    },
    b3: {
      title: "Problema nu e ce știi tu despre bani.",
      body: "Neuroștiința comportamentală o confirmă: 95% din deciziile financiare sunt luate de sistemul emoțional — nu de cel rațional.",
      references: "Kahneman (Nobel 2002), Thaler (Nobel 2017) și Ariely au studiat decenii exact asta.",
      proofSeal: "Bazat pe 14 studii peer-reviewed · 12.000 de diagnoze validate în 5 țări",
      pivot: "Tabelele nu rezolvă o problemă care nu e o problemă de tabel.",
      solution: "MindReset a fost construit ca să lucreze acolo unde problema chiar există — în mintea unui [PRIMARY].",
    },
    b4: {
      title: "[NOME], diagnoza ta [PRIMARY] în 4 dimensiuni.",
      subtitle: "Patru dimensiuni mapate pentru arhetipul tău. Numerele de mai jos sunt ale tale — nu medii, nu estimări.",
      features: [
        { title: "Bani", description: "Cum un [PRIMARY] ia zilnic decizii financiare invizibile — și declanșatorul exact de dezamorsat în următoarele 24h." },
        { title: "Carieră", description: "De ce tiparul tău profesional te ține pe loc, și pasul concret de făcut săptămâna asta." },
        { title: "Iubire", description: "Cum apare [PRIMARY] în relațiile tale — și scriptul literal pentru următoarea conversație dificilă despre bani." },
        { title: "Personal", description: "Obiceiul-ancoră care, odată schimbat, doboară alte 3 tipare automate în 90 de zile." },
      ],
    },
    b5: {
      eyebrow: "CE PRIMEȘTI",
      title: "Tot ce-ți trebuie ca să ieși din tiparul [PRIMARY].",
      subtitle: "Șase piese care funcționează împreună — construite special pentru arhetipul tău.",
      deliverables: [
        { title: "Diagnoză 4D personalizată", description: "Harta arhetipului tău în cele 4 zone critice — bani, carieră, iubire, personal — cu scoruri reale." },
        { title: "Protocol 90 de zile", description: "30 de micro-acțiuni calibrate să dezamorseze declanșatorul [PRIMARY] în fiecare zonă, săptămână de săptămână." },
        { title: "Matrice de Decizie", description: "Filtru de 60 de secunde ca tu să alegi înainte ca impulsul să decidă pentru tine — merge la orice cumpărătură." },
        { title: "Compass zilnic", description: "Check-in de 1 minut care prinde tiparul când revine — și-ți arată abaterea înainte să te coste." },
        { title: "Rapoarte lunare", description: "Vezi curba reală a comportamentului tău, lună de lună, fără auto-amăgire sau povești convenabile." },
        { title: "Acces în 5 limbi", description: "PT, EN, PL, RO, AR. Pentru tine azi, pentru familie și parteneri mâine." },
      ],
      note: "Acces pe viață · Fără abonament · Garanție necondiționată 30 de zile.",
    },
    b6: {
      counter: "+12.000 de diagnoze realizate în 5 țări",
      rating: "4,9 / 5 pe baza recenziilor utilizatorilor",
      testimonials: [
        { quote: "Pentru prima dată am înțeles de ce nu reușeam să economisesc. Nu era lipsa de disciplină — era tiparul meu [PRIMARY].", author: "Mariana S.", country: "Portugalia", arch: "AO" },
        { quote: "Diagnoza a schimbat felul în care vorbesc cu partenerul meu despre bani. În 15 zile am încetat să ne mai certăm.", author: "Andrzej K.", country: "Polonia", arch: "EA" },
        { quote: "Am prins declanșatorul înainte să cumpăr. Nicio aplicație nu reușise asta.", author: "Alexandru P.", country: "România", arch: "HI" },
        { quote: "N-am înțeles niciodată de ce ardeam tot înainte de ziua 15. Diagnoza a numit exact ce simțeam.", author: "Adam K.", country: "Polonia", arch: "HI" },
        { quote: "Mă credeam disciplinată cu banii. MindReset mi-a arătat că mi-era frică să cheltui — și asta e tot o problemă.", author: "Maria C.", country: "Portugalia", arch: "AO" },
        { quote: "Secțiunile despre carieră și relații au durut — și exact acolo aveam nevoie să mă uit. Nu e raport, e oglindă.", author: "Rami S.", country: "Arabia Saudită", arch: "EA" },
        { quote: "Am primit PDF-ul, l-am citit seara, a doua zi am refuzat o cumpărătură care era automată. Detaliu mic — schimbare uriașă.", author: "Ioana M.", country: "România", arch: "SS" },
        { quote: "Sunt inginer, îmi plac datele. Diagnoza n-a fost astrologie — a fost o oglindă cu referințe academice la final.", author: "Katarzyna W.", country: "Polonia", arch: "AO" },
        { quote: "Credeam că problema e salariul. Era tiparul. Astăzi câștig la fel și am margine pentru prima dată în 8 ani.", author: "Yousef A.", country: "Arabia Saudită", arch: "HI" },
      ],
    },
    ob1: {
      badge: "CEL MAI ADĂUGAT",
      title: "Ghid de Relații pe Arhetipuri",
      desc: "Cum se comportă fiecare arhetip cu banii. Util pentru partener, familie sau asociat ca să-ți înțeleagă [PRIMARY] — și tu pe al lor.",
      cta: "Da, adaug",
    },
    b7: {
      eyebrow: "ULTIMUL PAS, [NOME]",
      was: "200 $",
      then: "47 $",
      price: "Azi",
      cta: "Vreau diagnoza mea [PRIMARY] acum →",
      trust: "✓ Garanție 7 zile · ✓ Plată unică · ✓ SSL · ✓ Fără abonament",
    },
    b8: {
      title: "Întrebări frecvente",
      items: [
        { q: "Cu ce diferă de aplicații de buget precum YNAB sau Mint?", a: "Acelea te învață CE să faci cu banii. MindReset îți arată DE CE, ca [PRIMARY], nu reușești să faci ce știi deja că ar trebui. Asta e diferența între schimbare durabilă și abandon în 30 de zile." },
        { q: "Trebuie să-mi conectez contul bancar?", a: "Nu. MindReset lucrează cu comportamentul — nu cu extrase. Nu cerem și nu stocăm date bancare." },
        { q: "Funcționează dacă deja am încercat terapie sau coaching financiar?", a: "Da — și funcționează chiar mai bine. Terapia lucrează emoția; coachingul lucrează planul. MindReset lucrează tiparul automat care le sabotează pe amândouă. Nu concurează, se completează." },
        { q: "Merge pentru Arabia Saudită, Polonia sau România?", a: "Da. Deja validat în 5 limbi cu peste 12.000 de diagnoze. Psihologia comportamentală e universală — doar felul în care fiecare cultură o trăiește se schimbă. Adaptăm limbaj, exemple și referințe." },
        { q: "Ce se întâmplă dacă vreau să anulez sau să cer rambursare?", a: "Ai 30 de zile pentru rambursare integrală, fără întrebări. Anulare în 2 clicuri în portalul clientului." },
        { q: "IA înlocuiește un psiholog?", a: "Nu. E un instrument de auto-cunoaștere comportamentală. Util pentru a vedea tipare — nu înlocuiește sfatul profesional." },
      ],
    },
    b9: {
      title: "[NOME], ecranul următor îți arată ce primești și cât costă.",
      subtitle: "Decizi tu. Fără presiune, fără litere mici, fără taxe ascunse.",
      tagline: "Ești [PRIMARY] cu nuanță de [SECONDARY]. Pagina următoare continuă citirea tiparului tău — acum cu protocolul complet pe masă.",
      cta: "Vezi-mi protocolul acum →",
      trust: "🔒 Stripe · 🛡️ SSL · Garanție necondiționată 30 de zile",
    },
    ob2: {
      eyebrow: "ÎNAINTE SĂ MERGI MAI DEPARTE…",
      title: "Protocol Reset 30 zile",
      desc: "Plan zilnic cu 30 de micro-acțiuni calibrate pentru tiparul [PRIMARY]. Îl primești odată cu diagnoza.",
      cta: "Da, adaug",
      decline: "Nu, prefer să descopăr singur",
    },
    exit: {
      title: "[NOME], chiar poți pleca acum?",
      body: "Fiecare săptămână pe pilot automat ca [PRIMARY] te costă decizii pe care nu le mai iei o dată. Ecranul următor îți arată protocolul complet — nu există reducere, există claritate despre ce primești.",
      cta: "Arată-mi protocolul →",
      decline: "Prefer să rămân așa cum sunt",
    },
  },
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
    securePayment: "دفع آمن عبر Stripe", processing: "جارٍ المعالجة…",
  },
  login: {
    enterEmailFirst: "أدخل بريدك الإلكتروني أولاً.",
    checkInbox: "تحقق من صندوق الوارد.",
    forgotPassword: "نسيت كلمة المرور؟",
    subscriptionEnded: "⏳ انتهت اشتراكك.",
    subscriptionRenew: "جديد اشتراكك للمتابعة في الوصول إلى MindReset.",
  },
  notFound: { title: "الصفحة غير موجودة", desc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", goHome: "الرئيسية" },
  errorPage: { title: "هذه الصفحة لم تُحمّل", desc: "حدث خطأ من طرفنا. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.", tryAgain: "حاول مرة أخرى", goHome: "الرئيسية" },
  hero: {
    kicker: "السلوك المالي • ٨ أسئلة • ٣ دقائق",
    headline: "دماغك يحمل نمطًا\nيُخرّب\nأموالك.",
    sub: "ليست قلّة إرادة. إنه نمط سلوكي لم تعرف يومًا أنك تحمله.",
    cta: "أريد اكتشاف نمطي",
    microcopy: "⚡ ٣ دقائق · مجاني ١٠٠٪ · نتيجة فورية",
    trust: "+12,000 تشخيص • بدون بطاقة للبدء",
    trustSsl: "SSL آمن",
    trustData: "البيانات محمية",
    trustGuarantee: "ضمان 7 أيام",
  },
  identity: { title: "قبل أن نبدأ — من أنت؟", sub: "سنستخدم اسمك خلال التشخيص ليكون شخصياً." },
  questions: { title: (n, total) => `السؤال ${n} من ${total}`, intro: (name) => `${name}، اختر الإجابة الأقرب لك — لا توجد إجابة خاطئة.` },
  emailCapture: { title: (name) => `${name}، تشخيصك جاهز.`, sub: "أدخل بريدك لاستلام التقرير الكامل وفتح صفحة نمطك.", cta: "اعرض نمطي الآن" },
  quizProgress: { identity: "التعرف", email: "الإنجاز" },
  loader: { ...EN.loader, title: "جارٍ معالجة إجاباتك", steps: ["مقارنة ٨ إجابات بـ٤ أنماط…","تحديد النمط المهيمن…","تجهيز النتيجة…"] },
  reveal: {
    ...EN.reveal,
    kicker: (name) => `${name}، نمطك هو:`,
    sub: "ليس صدفة.\nإنه نمط — والأنماط تتغيّر",
    cta: "ادخل إلى بروتوكولي الآن",
    share: "شارك نمطي",
    errorTitle: "لم نتمكن من حفظ تشخيصك.",
    errorBody: "نتيجتك تظهر أدناه، لكن رابط المشاركة غير متاح.",
    errorRetry: "حاول مجدداً",
    areasTitle: "نفس النمط. 4 مجالات في حياتك.",
    areasIntro: (name) => `${name}، نمطك لا يعيش في حسابك المصرفي فقط. شاهد أين يظهر — وكم يكلفك.`,
    areas: {
      money: { label: "المال", byArch: { ...EN.reveal.areas.money.byArch,
        AO: "تدّخر دون أن تشعر بالأمان — النقص يسكنك حتى عندما يرتفع رصيدك.",
        SS: "تنفق لتُظهر الانتماء. المال يتحوّل إلى واجهة، لا إلى حرية.",
        EA: "تتجنب النظر إلى ماليتك — الفواتير تتراكم والديون تنمو في صمت.",
        HI: "يدخل كل شيء ويخرج كل شيء. اللحظة الحاضرة أثقل من أي خطة.",
      } },
      career: { label: "العمل", byArch: { ...EN.reveal.areas.career.byArch,
        AO: "تقبل أقل مما تستحق مقابل الاستقرار. تفقد سنوات في منطقة الأمان.",
        SS: "تختار المناصب من أجل الهيبة، لا من أجل الحياة التي تبنيها فعلاً.",
        EA: "تؤجل الترقيات والحوارات الصعبة والقرارات — حتى تتحول إلى طوارئ.",
        HI: "تنتقل من مشروع إلى مشروع بحثاً عن النشوة التالية. نادراً ما تحصد ما زرعت.",
      } },
      love: { label: "الحب", byArch: { ...EN.reveal.areas.love.byArch,
        AO: "تقيس العاطفة بالفائدة. التلقي دون مقابل يُشعرك بعدم الراحة.",
        SS: "تختار شركاء يدعمون صورتك. الاتصال الحقيقي يأتي ثانياً.",
        EA: "تتجنب الأحاديث المهمة. الخلاف يتحوّل إلى مسافة — طويلة وصامتة.",
        HI: "تعيش شغفاً قصيراً وحاداً. الالتزام يبدو قفصاً — حتى يأتي الندم.",
      } },
      personal: { label: "الحياة الشخصية", byArch: { ...EN.reveal.areas.personal.byArch,
        AO: "تؤجل الراحة والمتعة ورعاية نفسك مقابل أمان لا يأتي أبداً.",
        SS: "تبني هوية خارجية مثالية — وداخلياً تشعر أن لا أحد يعرفك حقاً.",
        EA: "تخدّر الملل والقلق بالملهيات. الحياة تمر في ضباب.",
        HI: "طاقة بقمم وانهيارات. العادات الصحية تدوم أياماً، لا أشهراً.",
      } },
    },
    areasCta: "أرني التشخيص الكامل",
    anchor: (arch) => `73٪ من ${arch} يُبلّغون عن نفس النمط في 3 من هذه المجالات الأربعة على الأقل. لست وحدك — وهذا بالضبط ما يجعل النمط قابلًا للحل.`,
    urgency: "ينتهي هذا التحليل خلال",
    guarantee: "ضمان 7 أيام · دفعة واحدة · بدون اشتراك",
    finalTitle: (name) => `${name}، يمكنك التوقف عن التخمين.`,
    finalSub: "التشخيص الكامل يكشف لك المحفّز الدقيق، النمط الذي وراءه، وخطة الـ30 يومًا الموجَّهة لتفكيكه.",
    finalCta: "أريد تشخيصي الكامل",
  },
  plans: { ...EN.plans, title: "اختر مدة الـ Reset", sub: "اشتراك متجدّد. يمكنك الإلغاء في أي وقت.", mostPopular: "الأكثر شعبية", p30: "٣٠ يوماً", p6m: "٦ أشهر", p1y: "سنة", chooseCta: "أريد هذا الخطة", guarantee: "استرداد كامل خلال ٧ أيام — بدون أسئلة." },
  cookies: { body: "نستخدم تقنيات الموقع لتخصيص تجربتك. بالمتابعة فإنك توافق على سياسة الخصوصية." },
  archetypes: {
    AO: { ...EN.archetypes.AO, name: "المُكدِّس\nالقهري" },
    SS: { ...EN.archetypes.SS, name: "الباحث\nعن المكانة" },
    EA: { ...EN.archetypes.EA, name: "الهارب\nالمُتجنِّب" },
    HI: { ...EN.archetypes.HI, name: "المُتَنَعِّم\nالاندفاعي" },
  },
  landing: {
    proofBar: {
      ariaLabel: "مؤشرات الثقة",
      diagnostics: { value: "+12,000", label: "تشخيص تم إنجازه" },
      rating: { value: "4.9 / 5", label: "متوسط التقييم" },
      noBank: { value: "100%", label: "بدون بيانات بنكية" },
      languages: { value: "5", label: "لغات مدعومة" },
    },
    beliefBreak: {
      tag: "العِلم\u00a0 وراء\u00a0 ذلك",
      title: "المشكلة\u00a0 ليست\u00a0 في\u00a0 أموالك.\u00a0 المشكلة\u00a0 في\u00a0 نمطك.",
      intro: "ثلاثة حائزين على جائزة نوبل أثبتوا ذلك. أنت فقط لم تسمعه بهذه الطريقة.",
      cards: [
        { author: "Daniel Kahneman", quote: "النظام 1 يقرر. النظام 2 يبرر.", insight: "95% من قراراتك المالية تلقائية — ليست مدروسة." },
        { author: "Richard Thaler", quote: "لسنا عقلانيين. نحن متوقعون.", insight: "تكرر الأخطاء نفسها — دائمًا على نفس المحفزات." },
        { author: "Dan Ariely", quote: "أنت لا تتحكم في المال. نمطك يتحكم بك.", insight: "حتى تُسمّي النمط، هو من يقرر بدلًا عنك." },
      ],
      punchline: "المشكلة ليست في أموالك. المشكلة في نمطك.",
    },
    archetypes: {
      tag: "الأنماط الأربعة",
      title: "ما هو نمطك الخفي؟",
      sub: "نفس النمط العاطفي يظهر في 4 مجالات: المال، العمل، الحب والحياة الشخصية. اكتشف نمطك في أقل من 3 دقائق.",
      items: {
        AO: { name: "المُكدِّس القهري", trigger: "المحفّز: خوف النفاد", desc: "يكدّس بهوس. صعوبة في الإنفاق حتى مع رصيد صحي. الشعور بالأمان لا يبدو كافياً أبداً." },
        SS: { name: "الباحث عن المكانة", trigger: "المحفّز: القبول الاجتماعي", desc: "ينفق لإبهار الآخرين. المكانة هي العملة العاطفية. الصورة الخارجية أهم من الصحة المالية الحقيقية." },
        EA: { name: "المُتجنِّب المالي", trigger: "المحفّز: الهروب والإنكار", desc: "يتجنب الحديث عن المال. يتجاهل الكشوف والفواتير. الانزعاج المالي يُخدَّر بالتجنب." },
        HI: { name: "الانفعالي المُتعوي", trigger: "المحفّز: المتعة الفورية", desc: "يشتري باندفاع، يعيش اللحظة. إثارة الآن تطغى على أي تخطيط. الحاضر يفوز دائماً." },
      },
    },
    howItWorks: {
      tag: "كيف تعمل",
      title: "بسيطة. عميقة. فعّالة.",
      sub: "بدون جداول بيانات. بدون بيانات بنكية. فقط أسئلة عن سلوكك الفعلي.",
      steps: [
        { title: "أجب عن 8 أسئلة", desc: "عن سلوك حقيقي، لا نظرية مالية. بدون أحكام." },
        { title: "احصل على تشخيصك", desc: "الذكاء الاصطناعي يرسم نمطك في 4 أبعاد: المالي، المهني، العاطفي والشخصي." },
        { title: "استلم الـ PDF", desc: "ملف PDF بأكثر من 30 صفحة في بريدك يحتوي على التشخيص الكامل في المجالات الأربعة. اقرأه متى شئت." },
      ],
    },
    features: {
      tag: "ما ستحصل عليه",
      title: "PDF واحد. أربع مجالات.\nصفر تطبيقات.",
      items: [
        { icon: "💰", title: "البُعد المالي", desc: "كيف يشوّه نمطك قراراتك مع المال — وخطة محددة للخروج من حلقة الشحّ أو المكانة أو الاندفاع.", meta: "تشخيص + 5 إجراءات" },
        { icon: "💼", title: "البُعد المهني", desc: "لماذا تقبل أقل مما تستحق (أو تقفز من مشروع لآخر). كيف يسبق النمط مسيرتك دون أن تلاحظ.", meta: "تشخيص + 5 إجراءات" },
        { icon: "❤️", title: "البُعد العاطفي", desc: "نمطك يختار الشركاء ويتجنّب الخلاف ويقيس المودة. كيف تكسر الحلقة في العلاقات الأكثر أهمية.", meta: "تشخيص + 5 إجراءات" },
        { icon: "🧘", title: "البُعد الشخصي", desc: "الصحة، الراحة، الهوية، العادات. حيث يكلّفك النمط سنوات دون أن تلاحظ — وكيف تبني الـ Reset.", meta: "تشخيص + 5 إجراءات" },
      ],
    },
    testimonials: {
      tag: "شهادات",
      title: "من فهم نمطه بالفعل",
      starsAlt: (n) => `${n} من ${n} نجوم`,
      items: [
        { stars: 5, quote: "لم أفهم أبداً لماذا كنتُ أنفق كل شيء قبل اليوم الخامس عشر. التشخيص سمّى بالضبط ما شعرت به. كأن أحداً أخيراً شرحني لنفسي.", name: "آدم ك.", arch: "النمط: الملذّ المندفع" },
        { stars: 5, quote: "كنت أظن أنني منظبط مع المال. أظهر لي MindReset أنني كنت أخشى الإنفاق — وأن هذه أيضاً مشكلة. كان كشفاً.", name: "ماريا س.", arch: "النمط: المدخر القهري" },
        { stars: 5, quote: "أقسام العمل والعلاقات كانت موجعة — وهناك بالضبط احتجت أن أنظر. ليس مجرد تقرير مالي، بل مرآة.", name: "رامي س.", arch: "النمط: الشبح المتجنب" },
      ],
    },
    faq: {
      tag: "الأسئلة الشائعة",
      title: "أسئلة من المرجح\nأن لديكها",
      sub: "إذا كان هناك أي شيء غير واضح، فزر بدء التشخيص يحلّ معظمها في 3 دقائق.",
      cta: "ابدأ التشخيص المجاني",
      items: [
        { q: "هل يصل MindReset إلى بياناتي البنكية؟", a: "لا. لا يصل MindReset إلى الحسابات أو الكشوف أو أي معلومات بنكية. يعتمد التشخيص حصرياً على إجاباتك السلوكية للاختبار — بدون أي تكامل بنكي." },
        { q: "هل التشخيص مخصص فعلاً لي؟", a: "نعم. يُنشئ الذكاء الاصطناعي (GPT-4o) تقريراً فريداً بناءً على نمطك واسمك وجنسك وإجاباتك الفردية. ليس نصاً عاماً — بل مكتوب خصيصاً لك ومحفوظ بشكل دائم." },
        { q: "هل هذا عن المال فقط؟", a: "لا. التشخيص يغطي 4 مجالات: المال، العمل، الحب والحياة الشخصية. نفس النمط العاطفي يظهر في كلها — تتغير فقط التكلفة." },
        { q: "ما الذي أحصل عليه بالضبط؟", a: "ملف PDF بأكثر من 30 صفحة على بريدك خلال دقائق. تشخيص لنمطك في المجالات الأربعة، 20 إجراءً محدداً (5 لكل مجال)، وخريطة لعلاقاتك حسب الأنماط." },
        { q: "هل هو اشتراك أم دفعة واحدة؟", a: "دفعة واحدة. بدون تطبيق، بدون رسوم شهرية، بدون التزام. تشتري مرة واحدة، تستلم الـ PDF، يبقى ملكك للأبد." },
        { q: "ماذا لو لم يعجبني؟", a: "ضمان 7 أيام بدون أسئلة. إذا لم يُلبِّ المنتج ما وعد به، نُرجع 100% من المبلغ المدفوع." },
      ],
    },
    finalCta: {
      titleBefore: "النمط الذي يسبق 4 مجالات في حياتك له اسم.\nحان وقت ",
      titleHighlight: "اكتشاف",
      titleAfter: " ما هو.",
      sub: "8 أسئلة. 3 دقائق. وضوح لا يمنحك إياه أي جدول بيانات.",
      cta: "ابدأ تشخيصي المجاني",
      guarantee: "ضمان 7 أيام",
      trustLine: "🔒 Stripe • 🛡️ SSL • إلغاء في أي وقت",
    },
  },
  checkout: { welcomeNotification: { title: "🎉 مرحباً بك في MindReset!", body: "اشتراكك نشط. انقر هنا لبدء تشخيصك." } },
  resetPassword: { title: "تعيين كلمة مرور جديدة", placeholder: "كلمة مرور جديدة", updating: "جارٍ التحديث…", updateButton: "تحديث كلمة المرور", success: "تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن." },
  sharePage: { metaTitle: "مشاركة النمط", metaDescription: "عرض نتيجة التشخيص السلوكي." },
  obrigado: {
    metaTitle: "مرحباً بك في MindReset!",
    loadingTitle: "جارٍ تجهيز وصولك...",
    errorHeading: "حدث خطأ ما",
    errorGoHome: "العودة إلى الصفحة الرئيسية",
    fallbackName: "عضو MindReset",
    step1Title: "الوصول إلى لوحة التحكم",
    step1Desc: "شاهد لوحتك المخصصة مع كل شيء منظم",
    step2Title: "أكمل التأهيل",
    step2Desc: "7 أسئلة سريعة لضبط بروتوكولك",
    step3Title: "ابدأ التشخيص",
    step3Desc: "الذكاء الاصطناعي يولد تحليلك السلوكي الكامل",
    welcomeHeading: "مرحباً بك في MindReset,",
    welcomeSub: "رحلة تحولك السلوكي تبدأ الآن. يسعدنا أنك معنا.",
    credentialsHeading: "بيانات وصولك",
    emailLabel: "البريد الإلكتروني",
    emailUnavailable: "البريد الإلكتروني غير متاح",
    passwordLabel: "كلمة المرور الافتراضية",
    copySuccess: "تم النسخ!",
    copyDefault: "نسخ",
    passwordInstruction: "يمكنك تغيير كلمة المرور في أي وقت في الإعدادات → الأمان داخل لوحة التحكم.",
    diagnosisTimerLabel: "سيكون تشخيصك الشخصي مطلوباً في:",
    whatsNextHeading: "ماذا تفعل الآن؟",
    accessCta: "الوصول إلى MINDRESET الآن",
    faqHeading: "الأسئلة الشائعة",
    faq1Q: "كيف أسجل الدخول؟",
    faq1A: "استخدم البريد الإلكتروني من الشراء مع كلمة المرور MindReset2026! (التي يمكنك نسخها أعلاه). إذا نسيت كلمة المرور، استخدم 'نسيت كلمة المرور' على شاشة تسجيل الدخول.",
    faq2Q: "ماذا أفعل أولاً؟",
    faq2A: "أكمل التأهيل (7 أسئلة سريعة). ثم، احصل على التشخيص لتلقي تحليلك السلوكي المخصص من الذكاء الاصطناعي.",
    faq3Q: "تحتاج مساعدة؟",
    faq3A: "تفضل بزيارتنا عبر البريد الإلكتروني أو الدردشة. نحن هنا لمساعدتك في الحصول على أفضل تجربة ممكنة.",
    copyright: "جميع الحقوق محفوظة.",
  },
  dashboardErrors: {
    connectionHeading: "تم قطع الاتصال",
    connectionDesc: "لم نتمكن من مزامنة ملفك العصبي. يحدث هذا عادة بسبب مشكلة اتصال مؤقتة.",
    reconnectButton: "إعادة تثبيت الاتصال",
    signOutTryAgain: "تسجيل الخروج والمحاولة مرة أخرى",
    initializing: "جارٍ تهيئة البروتوكول...",
    failedLoad: "فشل تحميل بيانات لوحة التحكم",
  },
  salesCta: { discoverArchetype: "اكتشف نمطي →" },
  plansExtra: { guarantee7Days: "ضمان 7 أيام", visa: "Visa", mastercard: "Mastercard", stripe: "Stripe", footerCopyright: "MindReset Inc." },
  calendarExportLabels: { markdownOption: "Markdown (.md)", icsOption: "التقويم (.ics)", markdownHeader: "# MindReset Action Matrix\n\n" },
  onboardingExtra: { saveError: "حدث خطأ أثناء حفظ تقدمك. يرجى المحاولة مرة أخرى." },
  settingsExtra: { passwordMinLength: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.", passwordMismatch: "كلمتا المرور غير متطابقتين.", passwordChangeError: "خطأ في تغيير كلمة المرور." },
  commonExtra: { openMenu: "فتح القائمة", protocolVersion: "Protocol v3.0 // 2026" },
  salesV2: {
    b1: {
      eyebrow: "تم الكشف عن التشخيص",
      h1: "[NOME]، لهذا السبب لم ينجح شيء جرّبته من قبل.",
      promise: "أنت لست كسولاً ولا غير منضبط. أنت [PRIMARY] — وهذا وحده يفسّر 95% من قراراتك المالية في السنوات الخمس الأخيرة.",
      cta: "أرني نمطي ←",
      timer: "ينتهي هذا التحليل خلال دقائق.",
    },
    b2: {
      title: "[NOME]، لقد جرّبت كل شيء، أليس كذلك؟",
      body: "جداول Excel. تطبيقات الميزانية. وعود رأس السنة. لكن النمط يعود دائماً — تحت الضغط أو القلق أو النشوة. بصفتك [PRIMARY]، هذا ما يتكرر:",
      bullets: [
        "المال يختفي قبل نهاية الشهر ولا تعرف بالضبط إلى أين ذهب.",
        "تتخذ قرارات مالية تعلم أنها خاطئة… وتستمر في اتخاذها.",
        "حتى عندما تتحسّن الأمور، شعور انعدام الأمان لا يزول.",
        "جرّبت الجداول والتطبيقات والطرق — ولم تدم أيٌّ منها أكثر من 30 يوماً.",
      ],
      conclusion: "هذا ليس ضعفاً. إنه نمطك [PRIMARY]، مع لمسة من [SECONDARY]، يعمل على الطيار الآلي.",
    },
    b3: {
      title: "المشكلة ليست في ما تعرفه عن المال.",
      body: "علم الأعصاب السلوكي يؤكد: 95% من القرارات المالية يتخذها الجهاز العاطفي — لا العقلاني.",
      references: "كانمان (نوبل 2002)، ثالر (نوبل 2017)، وأرييلي قضوا عقوداً في دراسة هذا بالتحديد.",
      pivot: "الجداول لا تحلّ مشكلة ليست مشكلة جدول.",
      solution: "صُمّم MindReset ليعمل حيث توجد المشكلة فعلياً — في عقل [PRIMARY].",
    },
    b4: {
      title: "ما ستحصل عليه، [NOME]",
      subtitle: "أربعة أبعاد مُهيّأة لنمط [PRIMARY]. الأرقام أدناه هي لك.",
      features: [
        { title: "المال", description: "كيف يتخذ [PRIMARY] قرارات مالية غير مرئية يومياً — والمحفّز الدقيق الذي يجب تعطيله." },
        { title: "المسيرة", description: "لماذا يعرقلك نمطك المهني، وما هي الخطوة الملموسة التالية." },
        { title: "الحب", description: "كيف يظهر [PRIMARY] في علاقاتك — وسيناريو محادثات المال الصعبة." },
        { title: "الشخصي", description: "العادة-المرساة التي إن غيّرتها أسقطت 3 أنماط تلقائية أخرى." },
      ],
    },
    b5: {
      eyebrow: "مرساة القيمة",
      was: "200 $ — تشخيص خاص مكافئ",
      then: "47 $ — السعر العام",
      now: "اليوم، لك",
      note: "دفعة واحدة · ضمان غير مشروط 7 أيام · بدون اشتراك.",
    },
    b6: {
      counter: "+12,000 تشخيص في 5 دول",
      rating: "4.9 / 5 بناءً على تقييمات المستخدمين",
      testimonials: [
        { quote: "لأول مرة فهمت لماذا لم أكن قادرة على الادخار. لم تكن قلة انضباط — كان نمطي [PRIMARY].", author: "Mariana S.", country: "البرازيل", arch: "AO" },
        { quote: "غيّر التشخيص طريقة حديثي مع شريكي عن المال. خلال 15 يوماً توقفنا عن الجدال.", author: "Andrzej K.", country: "بولندا", arch: "EA" },
        { quote: "أمسكت بالمحفّز قبل أن أشتري. لم يفعل ذلك أي تطبيق من قبل.", author: "Alexandru P.", country: "رومانيا", arch: "HI" },
      ],
    },
    ob1: {
      badge: "الأكثر إضافةً",
      title: "دليل العلاقات حسب النمط",
      desc: "كيف يتصرّف كل نمط مع المال. مفيد لشريكك أو عائلتك أو شريك عملك ليفهموا [PRIMARY] لديك — ولك أن تقرأ نمطهم.",
      cta: "نعم، أضف",
    },
    b7: {
      eyebrow: "الخطوة الأخيرة، [NOME]",
      was: "200 $",
      then: "47 $",
      price: "اليوم",
      cta: "أريد تشخيصي [PRIMARY] الآن ←",
      trust: "✓ ضمان 7 أيام · ✓ دفعة واحدة · ✓ SSL · ✓ بدون اشتراك",
    },
    b8: {
      title: "أسئلة شائعة",
      items: [
        { q: "كيف يختلف هذا عن تطبيقات الميزانية مثل YNAB أو Mint؟", a: "تلك التطبيقات تعلّمك ماذا تفعل بالمال. MindReset يكشف لماذا، بصفتك [PRIMARY]، لا تستطيع فعل ما تعرف أصلاً أنه ينبغي. هذا الفرق بين تغيير مستدام والتخلّي خلال 30 يوماً." },
        { q: "هل أحتاج إلى ربط حسابي البنكي؟", a: "لا. يعمل MindReset مع السلوك — لا مع كشوف الحساب. لا نطلب ولا نخزّن أي بيانات بنكية." },
        { q: "ماذا لو أردت الإلغاء أو الاسترداد؟", a: "لديك 7 أيام لاسترداد كامل، بدون أسئلة. الإلغاء بنقرتين في بوابة العميل." },
        { q: "هل يحلّ الذكاء الاصطناعي محل المعالج؟", a: "لا. إنه أداة لإدراك السلوك الذاتي. مفيد لرصد الأنماط — لا يحلّ محل الاستشارة المهنية." },
      ],
    },
    b9: {
      title: "[NOME]، توقّف عن تكرار النمط نفسه.",
      subtitle: "أن تكون [PRIMARY] ليس مصيرك. إنه نقطة انطلاقك.",
      tagline: "[NOME]، أنت [PRIMARY] مع لمسة من [SECONDARY].",
      cta: "ابدأ MindReset الآن ←",
      trust: "🔒 Stripe · 🛡️ SSL · إلغاء في أي وقت",
    },
    ob2: {
      eyebrow: "قبل أن تتابع…",
      title: "بروتوكول Reset لـ 30 يوماً",
      desc: "خطة يومية بـ 30 إجراءً صغيراً مُهيّأة لكسر نمط [PRIMARY]. تصلك مع التشخيص.",
      cta: "نعم، أضف",
      decline: "لا، أفضّل أن أكتشف بمفردي",
    },
    exit: {
      title: "[NOME]، انتظر.",
      body: "أنت بالفعل [PRIMARY]. الخروج الآن يمحو تشخيصك — والمحفّز الذي يبقيه فعّالاً.",
      cta: "أرني نمطي ←",
      decline: "أفضّل أن أخرج دون أن أعرف",
    },
  },
};

export const translations: Record<Lang, Dict> = { pt: PT, en: EN, pl: PL, ro: RO, ar: AR };
