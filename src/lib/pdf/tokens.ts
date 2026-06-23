/**
 * Phase C — Tokens visuais do PDF.
 * Espelha a identidade web (preto + #CC0000) e a paleta oficial de cada arquétipo
 * (msg #467). Vermelho da marca é a "tinta editorial" transversal; cor do arquétipo
 * entra como wash / accent secundário nas capas e cabeçalhos de área.
 */
import type { ArchetypeCode } from "@/lib/ai/diagnosis-schema";

export const PDF_COLORS = {
  ink: "#0B0B0B",         // preto editorial (não puro #000 para print)
  paper: "#F5F0E6",        // creme — fundo de páginas brancas (ref 2)
  paperDeep: "#EAE3D3",    // creme mais escuro p/ contraste
  brand: "#CC0000",        // accent global
  brandDeep: "#990000",
  brandSurface: "#1A0000",
  gridLine: "#2A2A2A",
  mute: "#7A7370",
  white: "#FFFFFF",
} as const;

export const ARCHETYPE_PALETTES: Record<
  ArchetypeCode,
  { primary: string; secondary: string; accent: string; sensation: string }
> = {
  AO: { primary: "#0F4C5C", secondary: "#3B82F6", accent: "#7DD3FC", sensation: "vault" },
  SS: { primary: "#7C3AED", secondary: "#C084FC", accent: "#F5D0FE", sensation: "imperial" },
  EA: { primary: "#64748B", secondary: "#94A3B8", accent: "#CBD5E1", sensation: "fog" },
  HI: { primary: "#F97316", secondary: "#FBBF24", accent: "#FED7AA", sensation: "blaze" },
};

export const PDF_FONTS = {
  display: "Syne",
  body: "Inter",
  arabic: "NotoNaskhArabic",
} as const;

/** Tamanhos em pt (react-pdf usa pt como default). A4 = 595 × 842pt. */
export const PDF_TYPE = {
  giantDisplay: 180,
  hero: 90,
  h1: 48,
  h2: 30,
  h3: 18,
  body: 11,
  small: 9,
  micro: 7.5,
  leading: 1.45,
} as const;

export const PDF_SPACING = {
  pageMarginX: 48,
  pageMarginY: 56,
  gridGutter: 16,
} as const;

/** URLs absolutas dos fonts (Google Fonts CDN — react-pdf aceita HTTPS). */
export const PDF_FONT_URLS = {
  syne800: "https://fonts.gstatic.com/s/syne/v22/8vIS7w4qzmVxsWxjBZRjr0FKM_04.ttf",
  syne700: "https://fonts.gstatic.com/s/syne/v22/8vIS7w4qzmVxsWxjBZRjr0FKM_04.ttf",
  inter400: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50ojIa1ZL7.ttf",
  inter600: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50ojIa1ZL7.ttf",
  inter700: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50ojIa1ZL7.ttf",
  notoNaskh400: "https://fonts.gstatic.com/s/notonaskharabic/v34/RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwvc5sjT4G.ttf",
  notoNaskh700: "https://fonts.gstatic.com/s/notonaskharabic/v34/RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwvc5sjT4G.ttf",
} as const;

export type Lang = "pt" | "en" | "pl" | "ro" | "ar";

export const isRtl = (lang: Lang) => lang === "ar";

export const PDF_COPY: Record<Lang, {
  edition: string;
  diagnosisOf: (name: string) => string;
  forYou: string;
  invisiblePattern: string;
  areas: { money: string; career: string; love: string; personal: string };
  area: string;
  dossier: string;
  weekPlan: string;
  exercise: string;
  protocolTitle: string;
  protocolSub: string;
  triggersTitle: string;
  triggersSub: string;
  ritualTitle: string;
  ritualBody: string;
  pageOf: (n: number, total: number) => string;
  score: string;
  intensity: string;
  rootBehavior: string;
  day: string;
  cue: string;
  trigger: string;
  counter: string;
  signoff: string;
  greetingLabel: string;
}> = {
  pt: {
    edition: "EDIÇÃO Nº 0001 · MINDRESET",
    diagnosisOf: (n) => `DIAGNÓSTICO DE ${n.toUpperCase()}`,
    forYou: "Documento confidencial · gerado especificamente para ti",
    invisiblePattern: "O padrão invisível",
    areas: { money: "Dinheiro", career: "Carreira", love: "Amor", personal: "Pessoal" },
    area: "ÁREA",
    dossier: "DOSSIÊ",
    weekPlan: "Plano de 7 dias",
    exercise: "Exercício prático",
    protocolTitle: "Protocolo dos 7 dias",
    protocolSub: "Uma micro-ação por dia. Sem culpa. Sem desculpa.",
    triggersTitle: "Mapa de gatilhos",
    triggersSub: "Cinco armadilhas típicas do teu arquétipo e a contramedida exata.",
    ritualTitle: "Ritual de fechamento",
    ritualBody: "Lê este documento uma vez por semana durante 30 dias. O padrão não se rompe com informação — rompe-se com repetição consciente.",
    pageOf: (n, t) => `${String(n).padStart(2, "0")} / ${String(t).padStart(2, "0")}`,
    score: "Intensidade",
    intensity: "Intensidade do padrão",
    rootBehavior: "Comportamento-raiz",
    day: "Dia",
    cue: "Gatilho",
    trigger: "Gatilho",
    counter: "Contramedida",
    signoff: "MindReset — leitura comportamental editorial.",
    greetingLabel: "ABERTURA",
  },
  en: {
    edition: "EDITION №0001 · MINDRESET",
    diagnosisOf: (n) => `${n.toUpperCase()}'S DIAGNOSIS`,
    forYou: "Confidential document · generated specifically for you",
    invisiblePattern: "The invisible pattern",
    areas: { money: "Money", career: "Career", love: "Love", personal: "Personal" },
    area: "AREA",
    dossier: "DOSSIER",
    weekPlan: "7-day plan",
    exercise: "Practical exercise",
    protocolTitle: "The 7-day protocol",
    protocolSub: "One micro-action per day. No guilt. No excuses.",
    triggersTitle: "Trigger map",
    triggersSub: "Five typical traps of your archetype and the exact countermeasure.",
    ritualTitle: "Closing ritual",
    ritualBody: "Read this document once a week for 30 days. The pattern doesn't break with information — it breaks with conscious repetition.",
    pageOf: (n, t) => `${String(n).padStart(2, "0")} / ${String(t).padStart(2, "0")}`,
    score: "Intensity",
    intensity: "Pattern intensity",
    rootBehavior: "Root behavior",
    day: "Day",
    cue: "Cue",
    trigger: "Trigger",
    counter: "Countermeasure",
    signoff: "MindReset — editorial behavioral reading.",
    greetingLabel: "OPENING",
  },
  pl: {
    edition: "EDYCJA №0001 · MINDRESET",
    diagnosisOf: (n) => `DIAGNOZA: ${n.toUpperCase()}`,
    forYou: "Dokument poufny · wygenerowany specjalnie dla ciebie",
    invisiblePattern: "Niewidzialny wzorzec",
    areas: { money: "Pieniądze", career: "Kariera", love: "Miłość", personal: "Osobiste" },
    area: "OBSZAR",
    dossier: "DOSSIER",
    weekPlan: "Plan na 7 dni",
    exercise: "Ćwiczenie praktyczne",
    protocolTitle: "Protokół 7 dni",
    protocolSub: "Jedno mikro-działanie dziennie. Bez winy. Bez wymówek.",
    triggersTitle: "Mapa wyzwalaczy",
    triggersSub: "Pięć typowych pułapek twojego archetypu i dokładny środek zaradczy.",
    ritualTitle: "Rytuał zamknięcia",
    ritualBody: "Czytaj ten dokument raz w tygodniu przez 30 dni. Wzorzec nie pęka pod wpływem informacji — pęka pod wpływem świadomego powtarzania.",
    pageOf: (n, t) => `${String(n).padStart(2, "0")} / ${String(t).padStart(2, "0")}`,
    score: "Intensywność",
    intensity: "Intensywność wzorca",
    rootBehavior: "Zachowanie źródłowe",
    day: "Dzień",
    cue: "Bodziec",
    trigger: "Wyzwalacz",
    counter: "Środek zaradczy",
    signoff: "MindReset — redakcyjne czytanie behawioralne.",
    greetingLabel: "OTWARCIE",
  },
  ro: {
    edition: "EDIȚIA №0001 · MINDRESET",
    diagnosisOf: (n) => `DIAGNOSTICUL LUI ${n.toUpperCase()}`,
    forYou: "Document confidențial · generat special pentru tine",
    invisiblePattern: "Tiparul invizibil",
    areas: { money: "Bani", career: "Carieră", love: "Iubire", personal: "Personal" },
    area: "ARIE",
    dossier: "DOSAR",
    weekPlan: "Plan de 7 zile",
    exercise: "Exercițiu practic",
    protocolTitle: "Protocolul de 7 zile",
    protocolSub: "O micro-acțiune pe zi. Fără vinovăție. Fără scuze.",
    triggersTitle: "Harta declanșatorilor",
    triggersSub: "Cinci capcane tipice ale arhetipului tău și contramăsura exactă.",
    ritualTitle: "Ritual de încheiere",
    ritualBody: "Citește acest document o dată pe săptămână timp de 30 de zile. Tiparul nu se rupe cu informație — se rupe cu repetiție conștientă.",
    pageOf: (n, t) => `${String(n).padStart(2, "0")} / ${String(t).padStart(2, "0")}`,
    score: "Intensitate",
    intensity: "Intensitatea tiparului",
    rootBehavior: "Comportament-rădăcină",
    day: "Ziua",
    cue: "Declanșator",
    trigger: "Declanșator",
    counter: "Contramăsură",
    signoff: "MindReset — lectură comportamentală editorială.",
    greetingLabel: "DESCHIDERE",
  },
  ar: {
    edition: "الإصدار رقم 0001 · مايند ريسِت",
    diagnosisOf: (n) => `تشخيص: ${n}`,
    forYou: "وثيقة سرّية · أُنشئت خصّيصًا لك",
    invisiblePattern: "النمط الخفيّ",
    areas: { money: "المال", career: "المسيرة", love: "الحبّ", personal: "الذاتي" },
    area: "المجال",
    dossier: "ملفّ",
    weekPlan: "خطّة سبعة أيّام",
    exercise: "تمرين عمليّ",
    protocolTitle: "بروتوكول السبعة أيّام",
    protocolSub: "إجراء صغير واحد كلّ يوم. بلا ذنب. بلا أعذار.",
    triggersTitle: "خريطة المُحفّزات",
    triggersSub: "خمسة فخاخ نمطيّة لنمطك السلوكي والمضادّ الدقيق لكلٍّ منها.",
    ritualTitle: "طقس الختام",
    ritualBody: "اقرأ هذه الوثيقة مرّة في الأسبوع لمدّة ثلاثين يومًا. لا ينكسر النمط بالمعلومة — ينكسر بالتكرار الواعي.",
    pageOf: (n, t) => `${String(n).padStart(2, "0")} / ${String(t).padStart(2, "0")}`,
    score: "الحدّة",
    intensity: "حدّة النمط",
    rootBehavior: "السلوك الجذري",
    day: "اليوم",
    cue: "إشارة",
    trigger: "المُحفّز",
    counter: "المضادّ",
    signoff: "مايند ريسِت — قراءة سلوكيّة تحريريّة.",
    greetingLabel: "افتتاح",
  },
};