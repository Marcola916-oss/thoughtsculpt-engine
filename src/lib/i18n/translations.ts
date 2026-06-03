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
  hero: { kicker: string; headline: string; sub: string; cta: string; trust: string };
  identity: { title: string; sub: string };
  questions: { title: (n: number, total: number) => string; intro: (name: string) => string };
  q: Array<{ q: string; options: string[] }>;
  emailCapture: { title: (name: string) => string; sub: string; cta: string };
  loader: { title: string; steps: string[] };
  archetypes: Record<"AO" | "SS" | "EA" | "HI", { name: string; tagline: string; hooks: string[] }>;
  reveal: {
    kicker: (name: string) => string; sub: string; cta: string; share: string;
    errorTitle: string; errorBody: string; errorRetry: string;
  };
  sales: {
    h1: (name: string, arch: string) => string;
    promise: string;
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
    ctaFinal: { title: string; subtitle: string; cta: string; trust: string };
    cta: string;
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
      };
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
    };
    diagnosis: {
      tabs: { financial: string; professional: string; romantic: string; personal: string };
      empty: { heading: string; description: string };
      generating: string; unlockButton: string;
      share: { clipboardMessage: (name: string, url: string) => string; whatsappMessage: (name: string, url: string) => string };
      result: { heading: string; generatedOn: string };
      actions: { downloadPdf: string; copied: string; copyLink: string; whatsapp: string };
      disclaimer: string;
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
  hero: {
    kicker: "Finanças comportamentais • 8 perguntas • 3 minutos",
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
  loader: {
    title: "Processando as tuas respostas",
    steps: [
      "A cruzar 8 respostas com 4 arquétipos…",
      "A identificar o teu padrão dominante…",
      "A preparar a tua revelação…",
    ],
  },
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
  reveal: {
    kicker: (name) => `${name}, o teu arquétipo é:`,
    sub: "Isto não é sorte. É um padrão — e padrões mudam-se.",
    cta: "Quero o meu protocolo",
    share: "Partilhar o meu arquétipo",
    errorTitle: "Não conseguimos salvar o teu diagnóstico.",
    errorBody: "A tua revelação ainda aparece abaixo, mas o link de partilha não está disponível.",
    errorRetry: "Tentar novamente",
  },
  sales: {
    h1: (name, arch) => `${name}, foi por isto que nada do que tentaste antes funcionou.`,
    promise: "Em 30 dias, vais reconhecer o gatilho antes de ele acontecer.",
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
    ctaFinal: {
      title: "Chega de repetir os mesmos padrões.",
      subtitle: "O seu arquétipo não é um destino. É um ponto de partida.",
      cta: "Iniciar Meu MindReset Agora →",
      trust: "🔒 Stripe • 🛡️ SSL • Cancelar a qualquer momento",
    },
    cta: "Escolher o meu plano",
  },
  plans: {
    title: "Escolhe a duração do teu Reset", sub: "Subscrição recorrente. Cancelas quando quiseres.",
    mostPopular: "MAIS POPULAR", perDay: (v) => `${v} / dia`,
    p30: "30 dias", p6m: "6 meses", p1y: "1 ano",
    chooseCta: "Começar agora",
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
    },
    diagnosis: {
      tabs: { financial: "Finanças", professional: "Profissional", romantic: "Relacionamentos", personal: "Pessoal" },
      empty: { heading: "Seu diagnóstico está pronto para ser revelado.", description: "Nossa IA estruturou uma análise psicológica profunda de 4 dimensões sobre como o seu arquétipo toma decisões invisíveis diariamente." },
      generating: "Gerando análise (≈ 20s)...", unlockButton: "Desbloquear Meu Diagnóstico",
      share: { clipboardMessage: (n, u) => `Descobri que meu arquétipo financeiro é ${n}! 🧠\nDescubra o seu gratuitamente: ${u}`, whatsappMessage: (n, u) => `Descobri que meu arquétipo financeiro é *${n}*! 🧠\nDescubra o seu gratuitamente: ${u}` },
      result: { heading: "Dossiê Comportamental", generatedOn: "Análise gerada por IA em" },
      actions: { downloadPdf: "📄 Baixar PDF", copied: "✓ Copiado!", copyLink: "🔗 Copiar Link", whatsapp: "WhatsApp" },
      disclaimer: "Isenção de responsabilidade: Esta análise é baseada em padrões comportamentais identificados em suas respostas. Não constitui aconselhamento financeiro, psicológico ou médico profissional.",
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
  hero: {
    kicker: "Behavioral finance • 8 questions • 3 minutes",
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
  loader: {
    title: "Processing your answers",
    steps: [
      "Cross-checking 8 answers across 4 archetypes…",
      "Identifying your dominant pattern…",
      "Preparing your reveal…",
    ],
  },
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
  reveal: {
    kicker: (name) => `${name}, your archetype is:`,
    sub: "This isn't luck. It's a pattern — and patterns can change.",
    cta: "I want my protocol",
    share: "Share my archetype",
    errorTitle: "We couldn't save your diagnosis.",
    errorBody: "Your reveal still appears below, but the share link isn't available.",
    errorRetry: "Try again",
  },
  sales: {
    h1: (name, arch) => `${name}, this is why nothing you tried before worked.`,
    promise: "In 30 days you'll recognize the trigger before it happens.",
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
    ctaFinal: {
      title: "Stop repeating the same patterns.",
      subtitle: "Your archetype isn't a destination. It's a starting point.",
      cta: "Start My MindReset Now →",
      trust: "🔒 Stripe • 🛡️ SSL • Cancel anytime",
    },
    cta: "Choose my plan",
  },
  plans: {
    title: "Choose your Reset length", sub: "Recurring subscription. Cancel anytime.",
    mostPopular: "MOST POPULAR", perDay: (v) => `${v} / day`,
    p30: "30 days", p6m: "6 months", p1y: "1 year",
    chooseCta: "Start now",
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
    },
    diagnosis: {
      tabs: { financial: "Finance", professional: "Professional", romantic: "Relationships", personal: "Personal" },
      empty: { heading: "Your diagnosis is ready to be revealed.", description: "Our AI structured a deep 4-dimension psychological analysis of how your archetype makes invisible decisions daily." },
      generating: "Generating analysis (≈ 20s)...", unlockButton: "Unlock My Diagnosis",
      share: { clipboardMessage: (n, u) => `I discovered my financial archetype is ${n}! 🧠\nDiscover yours for free: ${u}`, whatsappMessage: (n, u) => `I discovered my financial archetype is *${n}*! 🧠\nDiscover yours for free: ${u}` },
      result: { heading: "Behavioral Dossier", generatedOn: "AI-generated analysis on" },
      actions: { downloadPdf: "📄 Download PDF", copied: "✓ Copied!", copyLink: "🔗 Copy Link", whatsapp: "WhatsApp" },
      disclaimer: "Disclaimer: This analysis is based on behavioral patterns identified in your responses. It does not constitute professional financial, psychological, or medical advice.",
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
  loader: { title: "Przetwarzam Twoje odpowiedzi", steps: ["Krzyżuję 8 odpowiedzi z 4 archetypami…","Identyfikuję dominujący wzorzec…","Przygotowuję wynik…"] },
  reveal: { kicker: (name) => `${name}, Twój archetyp to:`, sub: "To nie przypadek. To wzorzec — a wzorce można zmieniać.", cta: "Chcę swój protokół", share: "Udostępnij mój archetyp", errorTitle: "Nie udało się zapisać diagnozy.", errorBody: "Twój wynik nadal się wyświetla, ale link do udostępniania nie jest dostępny.", errorRetry: "Spróbuj ponownie" },
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
    securePayment: "Plată securizată prin Stripe", processing: "Se procesează…",
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
  loader: { title: "Procesez răspunsurile tale", steps: ["Cross-check pe 8 răspunsuri și 4 arhetipuri…","Identific tiparul dominant…","Pregătesc revelația…"] },
  reveal: { kicker: (name) => `${name}, arhetipul tău este:`, sub: "Nu e noroc. E un tipar — iar tiparele se schimbă.", cta: "Vreau protocolul meu", share: "Distribuie arhetipul meu", errorTitle: "Nu am putut salva diagnoza.", errorBody: "Rezultatul tău apare mai jos, dar linkul de distribuire nu este disponibil.", errorRetry: "Încearcă din nou" },
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
    securePayment: "دفع آمن عبر Stripe", processing: "جارٍ المعالجة…",
  },
  hero: {
    kicker: "السلوك المالي • ٨ أسئلة • ٣ دقائق",
    headline: "ليست المشكلة في المال. المشكلة في النمط الذي لا تراه.",
    sub: "MindReset يشخّص نمطك المالي ويقدّم بروتوكول عمل مخصّصاً لك. بدون ميزانيات. بدون ربط بنكي. علم نفس يغيّر السلوك.",
    cta: "ابدأ التشخيص المجاني",
    trust: "+12,000 تشخيص • بدون بطاقة للبدء",
  },
  identity: { title: "قبل أن نبدأ — من أنت؟", sub: "سنستخدم اسمك خلال التشخيص ليكون شخصياً." },
  questions: { title: (n, total) => `السؤال ${n} من ${total}`, intro: (name) => `${name}، اختر الإجابة الأقرب لك — لا توجد إجابة خاطئة.` },
  emailCapture: { title: (name) => `${name}، تشخيصك جاهز.`, sub: "أدخل بريدك لاستلام التقرير الكامل وفتح صفحة نمطك.", cta: "اعرض نمطي" },
  loader: { title: "جارٍ معالجة إجاباتك", steps: ["مقارنة ٨ إجابات بـ٤ أنماط…","تحديد النمط المهيمن…","تجهيز النتيجة…"] },
  reveal: { kicker: (name) => `${name}، نمطك هو:`, sub: "ليس صدفة. إنه نمط — والأنماط تتغيّر.", cta: "أريد بروتوكولي", share: "شارك نمطي", errorTitle: "لم نتمكن من حفظ تشخيصك.", errorBody: "نتيجتك تظهر أدناه، لكن رابط المشاركة غير متاح.", errorRetry: "حاول مجدداً" },
  plans: { ...EN.plans, title: "اختر مدة الـ Reset", sub: "اشتراك متجدّد. يمكنك الإلغاء في أي وقت.", mostPopular: "الأكثر شعبية", p30: "٣٠ يوماً", p6m: "٦ أشهر", p1y: "سنة", chooseCta: "ابدأ الآن", guarantee: "استرداد كامل خلال ٧ أيام — بدون أسئلة." },
  cookies: { body: "نستخدم تقنيات الموقع لتخصيص تجربتك. بالمتابعة فإنك توافق على سياسة الخصوصية." },
};

export const translations: Record<Lang, Dict> = { pt: PT, en: EN, pl: PL, ro: RO, ar: AR };
