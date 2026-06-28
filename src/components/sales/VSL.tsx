/**
 * VSL — Video Sales Letter em 8 blocos.
 *
 * Block 1 — Âncora emocional (headline do arquétipo)
 * Block 2 — Espelho de dor (4 áreas)
 * Block 3 — Revelação científica (método)
 * Block 4 — O produto (mockup PDF)
 * Block 5 — Prova social (3 testimonials)
 * Block 6 — Oferta + preço + order bumps
 * Block 7 — FAQ (6 objeções)
 * Block 8 — CTA final + garantia
 *
 * Copy multi-idioma embutida (PT/EN/PL/RO/AR). Fase D pluga Stripe Elements
 * no `onCheckout`.
 */

import { useState } from "react";
import {
  Coins,
  Briefcase,
  Heart,
  Sparkles,
  FileText,
  ShieldCheck,
  Lock,
  Star,
  ChevronDown,
  Check,
  Zap,
  Brain,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Archetype } from "@/lib/quiz/scoring";
import { getPricing } from "@/lib/funnel/pricing-stub";
import { Reveal } from "@/components/interaction";
import { Atmosphere } from "@/components/atmosphere";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { MarbleBust } from "@/components/identity/MarbleBust";

type Lang = "pt" | "en" | "pl" | "ro" | "ar";
type B = Record<Lang, string>;

const ARCH_LABEL: Record<Archetype, B> = {
  AO: { pt: "O Avesso", en: "The Avoidant", pl: "Unikajacy", ro: "Evitantul", ar: "المتجنب" },
  SS: { pt: "O Estatua", en: "The Status-Seeker", pl: "Pawi", ro: "Statutarul", ar: "الباحث عن المكانة" },
  EA: { pt: "O Evitante", en: "The Anxious", pl: "Lekowy", ro: "Anxiosul", ar: "القلق" },
  HI: { pt: "O Cacador", en: "The Hunter", pl: "Lowca", ro: "Vanatorul", ar: "الصياد" },
};

const COPY = {
  anchorEyebrow: { pt: "Diagnostico revelado", en: "Diagnosis revealed", pl: "Diagnoza ujawniona", ro: "Diagnostic dezvaluit", ar: "تم الكشف عن التشخيص" } as B,
  anchorH1: {
    pt: (n: string, a: string) => `${n}, voce e ${a}. E isso explica tudo.`,
    en: (n: string, a: string) => `${n}, you are ${a}. And this explains everything.`,
    pl: (n: string, a: string) => `${n}, jestes ${a}. I to wszystko tlumaczy.`,
    ro: (n: string, a: string) => `${n}, esti ${a}. Si asta explica totul.`,
    ar: (n: string, a: string) => `${n}، أنت ${a}. وهذا يفسر كل شيء.`,
  },
  anchorSub: {
    pt: "O mesmo padrao silencioso que sabota suas financas sabota sua carreira, suas relacoes e sua paz interna. Voce nao esta quebrado. Esta repetindo.",
    en: "The same silent pattern that sabotages your finances sabotages your career, your relationships and your inner peace. You are not broken. You are repeating.",
    pl: "Ten sam cichy wzorzec, ktory sabotuje Twoje finanse, sabotuje Twoja kariere, relacje i wewnetrzny spokoj. Nie jestes zepsuty. Powtarzasz sie.",
    ro: "Acelasi tipar tacut care iti saboteaza finantele iti saboteaza cariera, relatiile si pacea interioara. Nu esti stricat. Te repeti.",
    ar: "نفس النمط الصامت الذي يخرب أموالك يخرب مسيرتك المهنية وعلاقاتك وسلامك الداخلي. أنت لست محطما. أنت تكرر.",
  } as B,
  painTitle: { pt: "Veja como ele te controla agora.", en: "See how it controls you right now.", pl: "Zobacz, jak kontroluje Cie teraz.", ro: "Vezi cum te controleaza acum.", ar: "انظر كيف يتحكم بك الآن." } as B,
  painAreaTitles: {
    money:    { pt: "Dinheiro",  en: "Money",     pl: "Pieniadze",  ro: "Bani",      ar: "المال" } as B,
    career:   { pt: "Carreira",  en: "Career",    pl: "Kariera",    ro: "Cariera",   ar: "المسيرة" } as B,
    love:     { pt: "Amor",      en: "Love",      pl: "Milosc",     ro: "Iubire",    ar: "الحب" } as B,
    personal: { pt: "Pessoal",   en: "Personal",  pl: "Osobiste",   ro: "Personal",  ar: "الذات" } as B,
  },
  pain: {
    AO: {
      money:    { pt: "Voce evita olhar o saldo. Adia decisoes. Vive em modo depois eu vejo.", en: "You avoid checking the balance. You delay decisions. You live in I will deal with it later mode.", pl: "Unikasz sprawdzania salda. Odkladasz decyzje. Zyjesz w trybie zajme sie tym pozniej.", ro: "Eviti sa te uiti la sold. Amani deciziile. Traiesti in modul ma ocup mai tarziu.", ar: "تتجنب رؤية الرصيد. تؤجل القرارات." } as B,
      career:   { pt: "Recusa promocoes porque parece responsabilidade demais. Trava antes de pedir mais.", en: "You decline promotions because they feel like too much. You freeze before asking for more.", pl: "Odrzucasz awanse, bo wydaja sie zbyt duza odpowiedzialnoscia.", ro: "Refuzi promovari fiindca par prea multa responsabilitate.", ar: "ترفض الترقيات لأنها تبدو مسؤولية كبيرة." } as B,
      love:     { pt: "Some quando alguem te quer perto demais. Foge antes de ser visto.", en: "You vanish when someone wants you too close. You flee before being seen.", pl: "Znikasz, gdy ktos chce byc zbyt blisko. Uciekasz, zanim zostaniesz zobaczony.", ro: "Dispari cand cineva te vrea prea aproape. Fugi inainte sa fii vazut.", ar: "تختفي حين يريدك أحد قريبا. تهرب قبل أن ترى." } as B,
      personal: { pt: "Sente um ruido de fundo: um dia eu resolvo. Esse dia nunca chega.", en: "You feel a background noise: one day I will fix it. That day never comes.", pl: "Czujesz szum w tle: kiedys to naprawie. Ten dzien nie nadchodzi.", ro: "Simti un zgomot de fundal: intr-o zi rezolv. Ziua aceea nu vine.", ar: "تشعر بضجيج خفي: يوما ما سأحلها. ذلك اليوم لا يأتي." } as B,
    },
    SS: {
      money:    { pt: "Compra para sinalizar status. O cartao fica vermelho. A imagem fica intacta.", en: "You buy to signal status. The card goes red. The image stays intact.", pl: "Kupujesz, by sygnalizowac status. Karta na minusie. Wizerunek bez szwanku.", ro: "Cumperi ca sa semnalezi statut. Cardul intra in rosu.", ar: "تشتري لإظهار المكانة. الحساب يصبح في الأحمر." } as B,
      career:   { pt: "Aceita cargos pelo titulo, nao pelo trabalho. E depois detesta cada segundo.", en: "You accept jobs for the title, not the work. Then you hate every second.", pl: "Przyjmujesz stanowiska dla tytulu. Potem nienawidzisz kazdej sekundy.", ro: "Accepti posturi pentru titlu, nu pentru munca.", ar: "تقبل الوظائف لأجل المسمى، لا لأجل العمل." } as B,
      love:     { pt: "Escolhe parceiros que parecem bem na foto. Depois se sente sozinho na cama.", en: "You pick partners who look good in the photo. Then you feel alone in bed.", pl: "Wybierasz partnerow, ktorzy dobrze wygladaja na zdjeciu.", ro: "Alegi parteneri care arata bine in poza.", ar: "تختار شركاء يبدون جيدين في الصورة." } as B,
      personal: { pt: "A aprovacao dos outros pesa mais que a sua paz. E vai pesando.", en: "Other people approval weighs more than your peace.", pl: "Aprobata innych wazy wiecej niz Twoj spokoj.", ro: "Aprobarea altora cantareste mai mult decat pacea ta.", ar: "موافقة الآخرين أثقل من سلامك." } as B,
    },
    EA: {
      money:    { pt: "Confere o saldo 10 vezes por dia e ainda dorme mal. Dinheiro virou ansiedade.", en: "You check the balance 10 times a day and still sleep badly. Money became anxiety.", pl: "Sprawdzasz saldo 10 razy dziennie i wciaz zle spisz.", ro: "Verifici soldul de 10 ori pe zi si tot dormi prost.", ar: "تتفقد الرصيد 10 مرات يوميا ومع ذلك تنام بسوء." } as B,
      career:   { pt: "Aceita tudo por medo de perder. Trabalha demais. Cobra de menos.", en: "You accept everything for fear of losing. You overwork. You undercharge.", pl: "Przyjmujesz wszystko ze strachu przed strata.", ro: "Accepti totul de teama sa nu pierzi.", ar: "تقبل كل شيء خوفا من الخسارة." } as B,
      love:     { pt: "Le a mensagem tres vezes. Reage rapido demais. Pede confirmacao que ninguem pode dar.", en: "You read the message three times. You react too fast. You ask for reassurance no one can give.", pl: "Czytasz wiadomosc trzy razy. Reagujesz za szybko.", ro: "Citesti mesajul de trei ori. Reactionezi prea repede.", ar: "تقرأ الرسالة ثلاث مرات. ترد بسرعة زائدة." } as B,
      personal: { pt: "Sua cabeca nunca para. Plano A, B, C — e ainda o medo no pano de fundo.", en: "Your head never stops. Plan A, B, C — and still fear in the background.", pl: "Twoja glowa nigdy nie odpoczywa.", ro: "Mintea ta nu se opreste.", ar: "عقلك لا يتوقف. خطة أ، ب، ج." } as B,
    },
    HI: {
      money:    { pt: "Caca oportunidades. Entra rapido, sai tarde. Ganha — e depois perde tudo.", en: "You hunt opportunities. You enter fast, exit late. You win — then lose it all.", pl: "Polujesz na okazje. Wchodzisz szybko, wychodzisz pozno.", ro: "Vanezi oportunitati. Intri rapid, iesi tarziu.", ar: "تطارد الفرص. تدخل بسرعة وتخرج متأخرا." } as B,
      career:   { pt: "Pula de projeto em projeto. Comeca 5, termina 1.", en: "You jump from project to project. Start 5, finish 1.", pl: "Skaczesz od projektu do projektu. Zaczynasz 5, konczysz 1.", ro: "Sari de la un proiect la altul. Incepi 5, termini 1.", ar: "تقفز من مشروع لآخر. تبدأ 5، تنهي 1." } as B,
      love:     { pt: "Intensidade no inicio. Tedio depois. Repete o ciclo com pessoas diferentes.", en: "Intensity at the start. Boredom after. You repeat the cycle with different people.", pl: "Intensywnosc na poczatku. Potem nuda.", ro: "Intensitate la inceput. Plictiseala dupa.", ar: "حدة في البداية. ملل بعدها." } as B,
      personal: { pt: "Adrenalina e a sua moeda. Sem ela, vazio. Voce precisa de mais — sempre.", en: "Adrenaline is your currency. Without it, emptiness. You need more — always.", pl: "Adrenalina to Twoja waluta. Bez niej pustka.", ro: "Adrenalina e moneda ta. Fara ea gol.", ar: "الأدرينالين عملتك. بدونه فراغ." } as B,
    },
  },
  scienceEyebrow: { pt: "O metodo", en: "The method", pl: "Metoda", ro: "Metoda", ar: "المنهج" } as B,
  scienceH2: {
    pt: "8 anos de pesquisa. 4 arquetipos. 1 padrao que governa sua vida.",
    en: "8 years of research. 4 archetypes. 1 pattern that governs your life.",
    pl: "8 lat badan. 4 archetypy. 1 wzorzec rzadzacy Twoim zyciem.",
    ro: "8 ani de cercetare. 4 arhetipuri. 1 tipar care iti guverneaza viata.",
    ar: "8 سنوات من البحث. 4 أنماط. نمط واحد يحكم حياتك.",
  } as B,
  scienceBody: {
    pt: "Neurociencia comportamental, psicologia financeira e estudo de padroes em 12.000 perfis. O que parece personalidade e, na verdade, um circuito de decisao. Quando voce ve o circuito, ele perde poder.",
    en: "Behavioral neuroscience, financial psychology, and pattern study across 12,000 profiles. What looks like personality is actually a decision circuit. The moment you see the circuit, it loses power.",
    pl: "Neuronauka behawioralna, psychologia finansowa i analiza wzorcow w 12 000 profilach. To, co wyglada jak osobowosc, jest w istocie obwodem decyzyjnym. Gdy go widzisz, traci moc.",
    ro: "Neurostiinta comportamentala, psihologie financiara si studiu de tipare in 12.000 profiluri. Ceea ce pare personalitate este, de fapt, un circuit de decizie.",
    ar: "علم الأعصاب السلوكي وعلم النفس المالي ودراسة الأنماط في 12,000 ملف. ما يبدو شخصية هو في الواقع دائرة قرار.",
  } as B,
  scienceBadges: {
    pt: ["Neurociencia comportamental", "Psicologia financeira", "12.000 perfis analisados"],
    en: ["Behavioral neuroscience", "Financial psychology", "12,000 profiles analyzed"],
    pl: ["Neuronauka behawioralna", "Psychologia finansowa", "12 000 profili"],
    ro: ["Neurostiinta comportamentala", "Psihologie financiara", "12.000 profiluri"],
    ar: ["علم الأعصاب السلوكي", "علم النفس المالي", "12,000 ملف محلل"],
  } as Record<Lang, string[]>,
  productEyebrow: { pt: "O que voce recebe", en: "What you get", pl: "Co otrzymujesz", ro: "Ce primesti", ar: "ما الذي ستحصل عليه" } as B,
  productH2: {
    pt: "Seu diagnostico completo em PDF — entregue agora.",
    en: "Your complete diagnosis in PDF — delivered now.",
    pl: "Twoja pelna diagnoza w PDF — dostarczona teraz.",
    ro: "Diagnosticul tau complet in PDF — livrat acum.",
    ar: "تشخيصك الكامل بصيغة PDF — يسلم الآن.",
  } as B,
  productItems: {
    pt: [
      "Mapa dos 4 arquetipos com o seu posicionamento exato",
      "Diagnostico das 4 areas: Dinheiro, Carreira, Amor, Pessoal",
      "Plano de acao de 7 dias para quebrar o ciclo",
      "Mapa de relacoes: como voce se conecta com cada outro arquetipo",
    ],
    en: [
      "Map of the 4 archetypes with your exact position",
      "Diagnosis across 4 areas: Money, Career, Love, Personal",
      "7-day action plan to break the cycle",
      "Relationship map: how you connect with every other archetype",
    ],
    pl: [
      "Mapa 4 archetypow z Twoim dokladnym polozeniem",
      "Diagnoza w 4 obszarach: Pieniadze, Kariera, Milosc, Osobiste",
      "7-dniowy plan dzialania, aby przerwac cykl",
      "Mapa relacji: jak laczysz sie z kazdym innym archetypem",
    ],
    ro: [
      "Harta celor 4 arhetipuri cu pozitia ta exacta",
      "Diagnostic pe 4 zone: Bani, Cariera, Iubire, Personal",
      "Plan de actiune de 7 zile pentru a rupe ciclul",
      "Harta relatiilor: cum te conectezi cu fiecare alt arhetip",
    ],
    ar: [
      "خريطة الأنماط الأربعة مع موقعك بدقة",
      "تشخيص في 4 مجالات: المال، المسيرة، الحب، الذات",
      "خطة عمل لـ 7 أيام لكسر الدورة",
      "خريطة العلاقات: كيف ترتبط بكل نمط آخر",
    ],
  } as Record<Lang, string[]>,
  pdfPages: { pt: "32 paginas", en: "32 pages", pl: "32 strony", ro: "32 pagini", ar: "32 صفحة" } as B,
  pdfLanguage: { pt: "Em Portugues", en: "In English", pl: "Po polsku", ro: "In romana", ar: "بالعربية" } as B,
  socialEyebrow: { pt: "Quem ja viu", en: "Who already saw it", pl: "Kto juz zobaczyl", ro: "Cine a vazut deja", ar: "من رأى بالفعل" } as B,
  socialH2: {
    pt: "12.000 pessoas. O mesmo choque.",
    en: "12,000 people. The same shock.",
    pl: "12 000 osob. Ten sam szok.",
    ro: "12.000 de oameni. Acelasi soc.",
    ar: "12,000 شخص. الصدمة نفسها.",
  } as B,
  pricingEyebrow: { pt: "Oferta unica", en: "One-time offer", pl: "Oferta jednorazowa", ro: "Oferta unica", ar: "عرض لمرة واحدة" } as B,
  pricingH2: {
    pt: "Acesso imediato. Pagamento unico.",
    en: "Instant access. One-time payment.",
    pl: "Natychmiastowy dostep. Platnosc jednorazowa.",
    ro: "Acces imediat. Plata unica.",
    ar: "وصول فوري. دفع لمرة واحدة.",
  } as B,
  pricingMainLabel: { pt: "Diagnostico completo (PDF)", en: "Complete diagnosis (PDF)", pl: "Pelna diagnoza (PDF)", ro: "Diagnostic complet (PDF)", ar: "التشخيص الكامل (PDF)" } as B,
  bump1Title: { pt: "Guia de Relacoes por Arquetipo", en: "Archetype Relationship Guide", pl: "Przewodnik po relacjach archetypow", ro: "Ghid de relatii pe arhetipuri", ar: "دليل العلاقات حسب النمط" } as B,
  bump1Desc: { pt: "Como conviver, namorar e trabalhar com cada um dos outros 3 arquetipos.", en: "How to live, date and work with each of the other 3 archetypes.", pl: "Jak zyc, randkowac i pracowac z kazdym z pozostalych 3 archetypow.", ro: "Cum sa traiesti si sa lucrezi cu fiecare din celelalte 3 arhetipuri.", ar: "كيف تعايش وتواعد وتعمل مع كل من الأنماط الثلاثة الأخرى." } as B,
  bump2Title: { pt: "Protocolo de Reset 30 dias", en: "30-day Reset Protocol", pl: "Protokol Resetu 30 dni", ro: "Protocol Reset 30 de zile", ar: "بروتوكول إعادة الضبط 30 يوما" } as B,
  bump2Desc: { pt: "Plano diario guiado para reprogramar o padrao em 30 dias.", en: "Daily guided plan to reprogram the pattern in 30 days.", pl: "Codzienny plan, aby przeprogramowac wzorzec w 30 dni.", ro: "Plan zilnic ghidat pentru a reprograma tiparul in 30 de zile.", ar: "خطة يومية موجهة لإعادة برمجة النمط خلال 30 يوما." } as B,
  totalLabel: { pt: "Total", en: "Total", pl: "Razem", ro: "Total", ar: "الإجمالي" } as B,
  pricingCta: { pt: "Quero meu diagnostico agora", en: "I want my diagnosis now", pl: "Chce swoja diagnoze teraz", ro: "Vreau diagnosticul acum", ar: "أريد تشخيصي الآن" } as B,
  pricingSecure: { pt: "Pagamento seguro via Stripe • SSL 256-bit", en: "Secure payment via Stripe • SSL 256-bit", pl: "Bezpieczna platnosc przez Stripe • SSL 256-bit", ro: "Plata securizata prin Stripe • SSL 256-bit", ar: "دفع آمن عبر Stripe • SSL 256-bit" } as B,
  guarantee: { pt: "7 dias de garantia. Nao gostou? Devolvemos.", en: "7-day guarantee. Don't like it? We refund.", pl: "7-dniowa gwarancja. Nie podoba sie? Zwracamy.", ro: "Garantie 7 zile. Nu iti place? Returnam.", ar: "ضمان 7 أيام. لم يعجبك؟ نعيد المال." } as B,
  faqEyebrow: { pt: "Perguntas frequentes", en: "Frequently asked", pl: "Najczestsze pytania", ro: "Intrebari frecvente", ar: "أسئلة شائعة" } as B,
  faq: {
    pt: [
      { q: "Quando recebo o PDF?", a: "Imediatamente apos o pagamento. Cai no e-mail e fica disponivel na tela de obrigado." },
      { q: "E so sobre dinheiro?", a: "Nao. Cobre as 4 areas: dinheiro, carreira, amor e vida pessoal." },
      { q: "Funciona para mim?", a: "Se voce fez o quiz, sim. O diagnostico e gerado a partir das suas respostas." },
      { q: "Como e o pagamento?", a: "Stripe processa. Aceitamos cartao, Apple Pay e Google Pay. Sem assinatura." },
      { q: "E se eu nao gostar?", a: "Pedimos reembolso em ate 7 dias. Sem perguntas." },
      { q: "Em que idioma vem?", a: "No mesmo idioma desta pagina. PT, EN, PL, RO ou AR." },
    ],
    en: [
      { q: "When do I receive the PDF?", a: "Immediately after payment. It arrives in your email and shows up on the thank-you screen." },
      { q: "Is it only about money?", a: "No. It covers 4 areas: money, career, love and personal life." },
      { q: "Will it work for me?", a: "If you took the quiz, yes. The diagnosis is generated from your answers — not generic." },
      { q: "How does payment work?", a: "Stripe processes the payment. We accept card, Apple Pay and Google Pay. No subscription." },
      { q: "What if I don't like it?", a: "Ask for a refund within 7 days. No questions asked." },
      { q: "Which language?", a: "The same language as this page. PT, EN, PL, RO or AR." },
    ],
    pl: [
      { q: "Kiedy otrzymam PDF?", a: "Natychmiast po platnosci. Przychodzi mailem i pojawia sie na ekranie podziekowania." },
      { q: "Czy to tylko o pieniadzach?", a: "Nie. Obejmuje 4 obszary: pieniadze, kariere, milosc i zycie osobiste." },
      { q: "Czy zadziala u mnie?", a: "Tak, jesli zrobiles quiz. Diagnoza powstaje z Twoich odpowiedzi — nie jest ogolna." },
      { q: "Jak dziala platnosc?", a: "Stripe. Karta, Apple Pay, Google Pay. Bez subskrypcji." },
      { q: "A jesli mi sie nie spodoba?", a: "Zwrot w ciagu 7 dni. Bez pytan." },
      { q: "W jakim jezyku?", a: "W jezyku tej strony. PT, EN, PL, RO lub AR." },
    ],
    ro: [
      { q: "Cand primesc PDF-ul?", a: "Imediat dupa plata. Ajunge pe e-mail si apare pe ecranul de multumire." },
      { q: "E doar despre bani?", a: "Nu. Acopera 4 zone: bani, cariera, iubire si viata personala." },
      { q: "Va functiona pentru mine?", a: "Da, daca ai facut quiz-ul. Diagnosticul este generat din raspunsurile tale." },
      { q: "Cum se face plata?", a: "Stripe. Card, Apple Pay, Google Pay. Fara abonament." },
      { q: "Si daca nu imi place?", a: "Cerere de retur in 7 zile. Fara intrebari." },
      { q: "In ce limba?", a: "In limba acestei pagini. PT, EN, PL, RO sau AR." },
    ],
    ar: [
      { q: "متى أستلم الـ PDF؟", a: "فور إتمام الدفع. يصل عبر البريد ويظهر في شاشة الشكر." },
      { q: "هل يتعلق بالمال فقط؟", a: "لا. يغطي 4 مجالات: المال، المسيرة، الحب، والحياة الشخصية." },
      { q: "هل سيناسبني؟", a: "نعم، إن أنهيت الاختبار. التشخيص يولد من إجاباتك." },
      { q: "كيف تتم الدفعة؟", a: "عبر Stripe. بطاقة، Apple Pay، Google Pay. بدون اشتراك." },
      { q: "ماذا لو لم يعجبني؟", a: "استرداد كامل خلال 7 أيام." },
      { q: "بأي لغة؟", a: "بنفس لغة هذه الصفحة. PT أو EN أو PL أو RO أو AR." },
    ],
  } as Record<Lang, { q: string; a: string }[]>,
  finalEyebrow: { pt: "Seu diagnostico esta pronto", en: "Your diagnosis is ready", pl: "Twoja diagnoza jest gotowa", ro: "Diagnosticul tau e gata", ar: "تشخيصك جاهز" } as B,
  finalH2: {
    pt: "Voce ja viu o padrao. Agora veja o caminho.",
    en: "You've seen the pattern. Now see the way out.",
    pl: "Zobaczyles wzorzec. Teraz zobacz wyjscie.",
    ro: "Ai vazut tiparul. Acum vezi iesirea.",
    ar: "رأيت النمط. الآن انظر إلى المخرج.",
  } as B,
  finalCta: { pt: "Desbloquear meu diagnostico", en: "Unlock my diagnosis", pl: "Odblokuj diagnoze", ro: "Deblocheaza diagnosticul", ar: "افتح تشخيصي" } as B,
} as const;

const TESTIMONIALS: Record<Lang, { name: string; arch: string; quote: string }[]> = {
  pt: [
    { name: "Mariana, 34", arch: "Anxious",  quote: "Em 20 minutos entendi por que sempre acabo no mesmo lugar — dinheiro, trabalho, relacoes." },
    { name: "Pedro, 41",   arch: "Hunter",   quote: "Achei que era so sobre financas. Era sobre mim. Mudou como eu olho cada decisao." },
    { name: "Sara, 29",    arch: "Avoidant", quote: "Eu adiava tudo. Vi o circuito no PDF e finalmente parei de fugir." },
  ],
  en: [
    { name: "Marian, 34", arch: "Anxious",  quote: "In 20 minutes I understood why I always end up in the same place — money, work, relationships." },
    { name: "Peter, 41",  arch: "Hunter",   quote: "I thought it was just about finance. It was about me." },
    { name: "Sara, 29",   arch: "Avoidant", quote: "I postponed everything. I saw the circuit in the PDF and finally stopped running." },
  ],
  pl: [
    { name: "Maria, 34", arch: "Lekowy",    quote: "W 20 minut zrozumialam, dlaczego zawsze laduje w tym samym miejscu." },
    { name: "Piotr, 41", arch: "Lowca",     quote: "Myslalem, ze to tylko o finansach. To bylo o mnie." },
    { name: "Sara, 29",  arch: "Unikajacy", quote: "Wszystko odkladalam. Zobaczylam obwod w PDF i wreszcie przestalam uciekac." },
  ],
  ro: [
    { name: "Maria, 34", arch: "Anxioasa", quote: "In 20 de minute am inteles de ce ajung mereu in acelasi loc." },
    { name: "Petru, 41", arch: "Vanator",  quote: "Credeam ca e doar despre finante. Era despre mine." },
    { name: "Sara, 29",  arch: "Evitanta", quote: "Amanam totul. Am vazut circuitul in PDF si am incetat sa mai fug." },
  ],
  ar: [
    { name: "مريم، 34", arch: "القلقة",   quote: "في 20 دقيقة فهمت لماذا أنتهي دائما في نفس المكان." },
    { name: "بطرس، 41", arch: "الصياد",    quote: "ظننتها عن المال فقط. كانت عني." },
    { name: "سارة، 29", arch: "المتجنبة", quote: "كنت أؤجل كل شيء. رأيت الدائرة في الـ PDF وتوقفت عن الهروب." },
  ],
};

const AREA_ICONS = { money: Coins, career: Briefcase, love: Heart, personal: Sparkles } as const;

function PainCard({ icon: Icon, title, body }: { icon: typeof Coins; title: string; body: string }) {
  return (
    <div className="group rounded-2xl border border-white/8 bg-[#0D0D0D] p-6 transition hover:border-[var(--accent)]/60 hover:-translate-y-1">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/12 text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-foreground/70">{body}</p>
    </div>
  );
}

function PdfMockup({ archLabel, pages, langLabel }: { archLabel: string; pages: string; langLabel: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="absolute -inset-6 rounded-3xl bg-[var(--accent)]/15 blur-3xl" aria-hidden />
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#161616] to-black p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-foreground/50">
          <span>MindReset</span>
          <span>{pages}</span>
        </div>
        <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">Diagnostico</div>
        <h4 className="font-display text-3xl leading-[1.1] text-foreground">{archLabel}</h4>
        <div className="mt-6 space-y-2">
          {[78, 64, 88, 52].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-white/8">
              <div className="h-full rounded-full bg-[var(--accent)]/60" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-6 inset-x-8 flex items-center justify-between text-[10px] text-foreground/40">
          <span>{langLabel}</span>
          <FileText className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-start"
        aria-expanded={open}
      >
        <span className="text-base font-medium text-foreground">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-foreground/70">{a}</p>}
    </div>
  );
}

export interface VSLProps {
  name: string;
  arch: Archetype;
  onCheckout: () => void;
}

export function VSL({ name, arch, onCheckout }: VSLProps) {
  const { lang, currency } = useI18n();
  const L = lang as Lang;
  const pricing = getPricing(L, currency);
  const archLabel = ARCH_LABEL[arch][L];
  const painSet = COPY.pain[arch];

  return (
    <div className="relative bg-black">
      {/* Block 1 — Anchor */}
      <section className="relative overflow-hidden border-b border-white/5">
        <Atmosphere fog="dramatic" symbols="sparse" scan="subtle" pinned>
          <div className="container mx-auto grid items-center gap-10 px-6 py-24 md:grid-cols-[1fr_auto] md:py-32">
            <Reveal>
              <div className="mb-4 inline-block rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                {COPY.anchorEyebrow[L]}
              </div>
              <h1 className="font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
                {COPY.anchorH1[L](name || "—", archLabel)}
              </h1>
              <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-foreground/75">
                {COPY.anchorSub[L]}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="hidden md:block">
                <MarbleBust size={260} />
              </div>
            </Reveal>
          </div>
        </Atmosphere>
      </section>

      {/* Block 2 — Pain */}
      <section className="border-b border-white/5 py-24">
        <div className="container mx-auto px-6">
          <Reveal>
            <h2 className="mb-12 max-w-[24ch] font-display text-3xl leading-tight text-foreground md:text-5xl">
              {COPY.painTitle[L]}
            </h2>
          </Reveal>
          <Reveal.Group className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(["money", "career", "love", "personal"] as const).map((area) => (
              <PainCard
                key={area}
                icon={AREA_ICONS[area]}
                title={COPY.painAreaTitles[area][L]}
                body={painSet[area][L]}
              />
            ))}
          </Reveal.Group>
        </div>
      </section>

      {/* Block 3 — Science */}
      <section className="relative border-b border-white/5 py-28">
        <Atmosphere fog="subtle" symbols="off" scan="off">
          <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                {COPY.scienceEyebrow[L]}
              </div>
              <h2 className="font-display text-3xl leading-[1.1] text-foreground md:text-5xl">
                {COPY.scienceH2[L]}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-lg leading-relaxed text-foreground/75">{COPY.scienceBody[L]}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {COPY.scienceBadges[L].map((b, i) => {
                  const Icon = [Brain, Zap, ShieldCheck][i] ?? Brain;
                  return (
                    <span
                      key={b}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground/80"
                    >
                      <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
                      {b}
                    </span>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </Atmosphere>
      </section>

      {/* Block 4 — Product */}
      <section className="border-b border-white/5 py-28">
        <div className="container mx-auto grid items-center gap-14 px-6 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <PdfMockup archLabel={archLabel} pages={COPY.pdfPages[L]} langLabel={COPY.pdfLanguage[L]} />
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
              {COPY.productEyebrow[L]}
            </div>
            <h2 className="mb-8 font-display text-3xl leading-[1.1] text-foreground md:text-5xl">
              {COPY.productH2[L]}
            </h2>
            <ul className="space-y-4">
              {COPY.productItems[L].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-[var(--accent)]" />
                  <span className="text-base text-foreground/85">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Block 5 — Testimonials */}
      <section className="border-b border-white/5 py-24">
        <div className="container mx-auto px-6">
          <Reveal>
            <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
              {COPY.socialEyebrow[L]}
            </div>
            <h2 className="mb-12 max-w-[22ch] font-display text-3xl leading-tight text-foreground md:text-5xl">
              {COPY.socialH2[L]}
            </h2>
          </Reveal>
          <Reveal.Group className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS[L].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/8 bg-[#0D0D0D] p-6 transition hover:border-white/20">
                <div className="mb-3 flex gap-0.5 text-[var(--accent)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mb-5 text-sm leading-relaxed text-foreground/85">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#7a0000]" aria-hidden />
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-foreground/55">{t.arch}</div>
                  </div>
                </div>
              </div>
            ))}
          </Reveal.Group>
        </div>
      </section>

      {/* Block 6 — Pricing */}
      <section id="vsl-offer" className="border-b border-white/5 py-28">
        <div className="container mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
              {COPY.pricingEyebrow[L]}
            </div>
            <h2 className="mb-12 text-center font-display text-3xl leading-tight text-foreground md:text-5xl">
              {COPY.pricingH2[L]}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <PricingBlock
              pricing={pricing}
              mainLabel={COPY.pricingMainLabel[L]}
              bump1Title={COPY.bump1Title[L]}
              bump1Desc={COPY.bump1Desc[L]}
              bump2Title={COPY.bump2Title[L]}
              bump2Desc={COPY.bump2Desc[L]}
              totalLabel={COPY.totalLabel[L]}
              cta={COPY.pricingCta[L]}
              secure={COPY.pricingSecure[L]}
              guarantee={COPY.guarantee[L]}
              onCheckout={onCheckout}
            />
          </Reveal>
        </div>
      </section>

      {/* Block 7 — FAQ */}
      <section className="border-b border-white/5 py-24">
        <div className="container mx-auto max-w-2xl px-6">
          <Reveal>
            <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
              {COPY.faqEyebrow[L]}
            </div>
            <h2 className="mb-10 font-display text-3xl leading-tight text-foreground md:text-4xl">FAQ</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              {COPY.faq[L].map((item, i) => (
                <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Block 8 — Final CTA */}
      <section className="relative py-28">
        <Atmosphere fog="dramatic" symbols="sparse" scan="subtle">
          <div className="container mx-auto max-w-2xl px-6 text-center">
            <Reveal>
              <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                {COPY.finalEyebrow[L]}
              </div>
              <h2 className="mb-8 font-display text-3xl leading-tight text-foreground md:text-5xl">
                {COPY.finalH2[L]}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <ButtonPress
                onClick={onCheckout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-8 py-5 text-base font-semibold text-white shadow-[0_10px_40px_-10px_rgba(204,0,0,0.6)] transition hover:-translate-y-0.5"
              >
                {COPY.finalCta[L]} <Lock className="h-4 w-4" />
              </ButtonPress>
              <p className="mt-5 text-sm text-foreground/60">{COPY.guarantee[L]}</p>
            </Reveal>
          </div>
        </Atmosphere>
      </section>
    </div>
  );
}

interface PricingBlockProps {
  pricing: ReturnType<typeof getPricing>;
  mainLabel: string;
  bump1Title: string;
  bump1Desc: string;
  bump2Title: string;
  bump2Desc: string;
  totalLabel: string;
  cta: string;
  secure: string;
  guarantee: string;
  onCheckout: () => void;
}

function PricingBlock(props: PricingBlockProps) {
  const [bump1, setBump1] = useState(false);
  const [bump2, setBump2] = useState(false);

  const total = (() => {
    if (bump1 && bump2) return props.pricing.totalWithBumps;
    if (!bump1 && !bump2) return props.pricing.main;
    return bump1 ? `${props.pricing.main} + ${props.pricing.bump1}` : `${props.pricing.main} + ${props.pricing.bump2}`;
  })();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#101010] to-black p-8 shadow-2xl">
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-white/8 pb-6">
        <div className="text-sm font-medium text-foreground">{props.mainLabel}</div>
        <div className="font-display text-3xl text-foreground">{props.pricing.main}</div>
      </div>
      <div className="space-y-3">
        <BumpRow checked={bump1} onChange={setBump1} title={props.bump1Title} desc={props.bump1Desc} price={props.pricing.bump1} />
        <BumpRow checked={bump2} onChange={setBump2} title={props.bump2Title} desc={props.bump2Desc} price={props.pricing.bump2} />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-6">
        <span className="text-sm uppercase tracking-[0.15em] text-foreground/60">{props.totalLabel}</span>
        <span className="font-display text-3xl text-[var(--accent)]">{total}</span>
      </div>
      <ButtonPress
        onClick={props.onCheckout}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white shadow-[0_10px_40px_-10px_rgba(204,0,0,0.6)] transition hover:-translate-y-0.5"
      >
        {props.cta} <Lock className="h-4 w-4" />
      </ButtonPress>
      <div className="mt-4 flex flex-col items-center gap-1 text-center">
        <p className="text-xs text-foreground/55">{props.secure}</p>
        <p className="text-xs text-foreground/55">{props.guarantee}</p>
      </div>
    </div>
  );
}

function BumpRow({
  checked,
  onChange,
  title,
  desc,
  price,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-start transition ${
        checked
          ? "border-[var(--accent)]/60 bg-[var(--accent)]/8"
          : "border-white/10 bg-white/[0.02] hover:border-white/25"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
          checked ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30"
        }`}
        aria-hidden
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span className="flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="text-sm font-semibold text-foreground/85">{price}</span>
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-foreground/60">{desc}</span>
      </span>
    </button>
  );
}
