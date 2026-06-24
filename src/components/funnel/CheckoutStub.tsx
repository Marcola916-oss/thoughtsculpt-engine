import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { createCheckoutSession } from "@/lib/payments/checkout.functions";
import { getCheckoutQuote } from "@/lib/payments/quote.functions";
import {
  Lock,
  ShieldCheck,
  Check,
  ChevronDown,
  Zap,
  Mail,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/interaction/Reveal";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { track, EVENTS } from "@/lib/analytics";

/**
 * Conversion-tuned pre-checkout page.
 * No fake card form — the CTA opens Stripe Checkout (hosted) so the user
 * enters payment details ONCE in PCI-compliant infrastructure with
 * Apple Pay / Google Pay / Link auto-detected by Stripe.
 */

type Copy = {
  title: string;
  sub: string;
  summary: string;
  mainItem: string;
  mainDesc: string;
  bump1Title: string;
  bump1Desc: string;
  bump2Title: string;
  bump2Desc: string;
  addLabel: string;
  addedLabel: string;
  total: string;
  payButton: (total: string) => string;
  processing: string;
  secureBy: string;
  guarantee: string;
  poweredBy: string;
  anchorLabel: string;       // "De"
  oneTimeNote: string;       // "Pagamento único · Sem renovação"
  offerBadge: string;        // "Oferta única — não reaparece"
  countdownLabel: string;    // "Esta oferta expira em"
  ctaSubcopy: (methods: string) => string; // "Serás levado para o Stripe seguro. Aceitamos {methods}."
  paymentMethods: string;    // "cartão, Apple Pay, Google Pay, Pix"
  trustTitle: string;
  trustGuarantee: string;
  trustGuaranteeDesc: string;
  trustStripe: string;
  trustStripeDesc: string;
  trustSecure: string;
  trustSecureDesc: string;
  trustDelivery: string;
  trustDeliveryDesc: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  testimonialQuote: string;
  testimonialAuthor: string;
};

const COPY: Record<string, Copy> = {
  pt: {
    title: "A 1 clique do teu diagnóstico",
    sub: "Pagamento único. Sem assinatura. PDF entregue em minutos.",
    summary: "Resumo do pedido",
    mainItem: "Diagnóstico Comportamental — PDF",
    mainDesc: "30+ páginas · 4 áreas · personalizado",
    bump1Title: "Guia de Relações por Arquétipo",
    bump1Desc: "Como cada arquétipo se relaciona — útil para parceiros, família, sócios.",
    bump2Title: "Protocolo de Reset 30 dias",
    bump2Desc: "Plano diário com 30 micro-ações para sair do padrão.",
    addLabel: "Adicionar",
    addedLabel: "Adicionado",
    total: "Total",
    payButton: (total) => `Pagar ${total} com segurança`,
    processing: "A processar pagamento…",
    secureBy: "Pagamento seguro via Stripe",
    guarantee: "Garantia de 7 dias — reembolso integral sem perguntas.",
    poweredBy: "🔒 SSL · Stripe · 7 dias garantia",
    anchorLabel: "De",
    oneTimeNote: "Pagamento único · Sem renovação",
    offerBadge: "Oferta única — não reaparece",
    countdownLabel: "Esta oferta expira em",
    ctaSubcopy: (m) => `Serás levado(a) para o ambiente seguro do Stripe. Aceitamos ${m}.`,
    paymentMethods: "cartão, Apple Pay, Google Pay e Pix",
    trustTitle: "Porque podes confiar",
    trustGuarantee: "Garantia de 7 dias",
    trustGuaranteeDesc: "Reembolso integral, sem perguntas. Basta um email.",
    trustStripe: "Processado pelo Stripe",
    trustStripeDesc: "A mesma infra usada por Apple, Google e Amazon.",
    trustSecure: "SSL 256-bit · PCI-DSS",
    trustSecureDesc: "Nunca tocamos no teu cartão. Tudo cifrado ponta-a-ponta.",
    trustDelivery: "Entrega em minutos",
    trustDeliveryDesc: "Recebes o PDF no email assim que o pagamento é confirmado.",
    faqTitle: "Perguntas rápidas",
    faq: [
      { q: "Vou ter que assinar algo?", a: "Não. É pagamento único. Nada renova, nada cobra de novo." },
      { q: "E se eu não gostar?", a: "Tens 7 dias para pedir reembolso integral, sem perguntas." },
      { q: "Quanto tempo até receber?", a: "Minutos. Vai direto para o teu email assim que pagares." },
    ],
    testimonialQuote: "Em 10 minutos entendi padrões que arrastava há 10 anos.",
    testimonialAuthor: "Marta R. · Arquétipo Estatuto",
  },
  en: {
    title: "One click from your diagnosis",
    sub: "One-time payment. No subscription. PDF delivered in minutes.",
    summary: "Order summary",
    mainItem: "Behavioral Diagnosis — PDF",
    mainDesc: "30+ pages · 4 areas · personalized",
    bump1Title: "Relationship Guide by Archetype",
    bump1Desc: "How each archetype relates — useful for partners, family, co-founders.",
    bump2Title: "30-Day Reset Protocol",
    bump2Desc: "Daily plan with 30 micro-actions to break the pattern.",
    addLabel: "Add",
    addedLabel: "Added",
    total: "Total",
    payButton: (total) => `Pay ${total} securely`,
    processing: "Processing payment…",
    secureBy: "Secure payment via Stripe",
    guarantee: "7-day guarantee — full refund, no questions asked.",
    poweredBy: "🔒 SSL · Stripe · 7-day guarantee",
    anchorLabel: "Was",
    oneTimeNote: "One-time payment · No renewals",
    offerBadge: "One-time offer — won't appear again",
    countdownLabel: "This offer expires in",
    ctaSubcopy: (m) => `You'll be taken to Stripe's secure checkout. We accept ${m}.`,
    paymentMethods: "card, Apple Pay, Google Pay & Link",
    trustTitle: "Why you can trust us",
    trustGuarantee: "7-day guarantee",
    trustGuaranteeDesc: "Full refund, no questions asked. One email is all it takes.",
    trustStripe: "Powered by Stripe",
    trustStripeDesc: "Same infrastructure used by Apple, Google and Amazon.",
    trustSecure: "256-bit SSL · PCI-DSS",
    trustSecureDesc: "We never touch your card. End-to-end encrypted.",
    trustDelivery: "Delivered in minutes",
    trustDeliveryDesc: "Your PDF lands in your inbox right after payment clears.",
    faqTitle: "Quick questions",
    faq: [
      { q: "Will I be subscribed to anything?", a: "No. One-time payment. Nothing renews, nothing recurs." },
      { q: "What if I don't like it?", a: "You have 7 days for a full refund. No questions asked." },
      { q: "How long until I receive it?", a: "Minutes. Straight to your inbox the moment payment clears." },
    ],
    testimonialQuote: "In 10 minutes I understood patterns I'd dragged for 10 years.",
    testimonialAuthor: "Marta R. · Status archetype",
  },
  pl: {
    title: "Jedno kliknięcie od diagnozy",
    sub: "Płatność jednorazowa. Bez subskrypcji. PDF w skrzynce w kilka minut.",
    summary: "Podsumowanie zamówienia",
    mainItem: "Diagnoza Behawioralna — PDF",
    mainDesc: "30+ stron · 4 obszary · spersonalizowane",
    bump1Title: "Przewodnik Relacji wg Archetypu",
    bump1Desc: "Jak każdy archetyp tworzy relacje — dla partnerów, rodziny, wspólników.",
    bump2Title: "30-dniowy Protokół Resetu",
    bump2Desc: "Codzienny plan z 30 mikro-działaniami, aby przerwać wzorzec.",
    addLabel: "Dodaj",
    addedLabel: "Dodano",
    total: "Razem",
    payButton: (total) => `Zapłać ${total} bezpiecznie`,
    processing: "Przetwarzanie płatności…",
    secureBy: "Bezpieczna płatność przez Stripe",
    guarantee: "Gwarancja 7 dni — pełen zwrot bez pytań.",
    poweredBy: "🔒 SSL · Stripe · 7-dniowa gwarancja",
    anchorLabel: "Było",
    oneTimeNote: "Płatność jednorazowa · Bez odnowień",
    offerBadge: "Oferta jednorazowa — nie pojawi się ponownie",
    countdownLabel: "Ta oferta wygasa za",
    ctaSubcopy: (m) => `Zostaniesz przeniesiony(a) do bezpiecznego Stripe. Akceptujemy ${m}.`,
    paymentMethods: "kartę, Apple Pay, Google Pay, BLIK i Link",
    trustTitle: "Dlaczego możesz nam zaufać",
    trustGuarantee: "Gwarancja 7 dni",
    trustGuaranteeDesc: "Pełen zwrot, bez pytań. Wystarczy jeden e-mail.",
    trustStripe: "Obsługiwane przez Stripe",
    trustStripeDesc: "Ta sama infrastruktura, której używają Apple, Google i Amazon.",
    trustSecure: "256-bit SSL · PCI-DSS",
    trustSecureDesc: "Nigdy nie dotykamy twojej karty. Szyfrowanie end-to-end.",
    trustDelivery: "Dostawa w kilka minut",
    trustDeliveryDesc: "PDF trafia do skrzynki tuż po potwierdzeniu płatności.",
    faqTitle: "Szybkie pytania",
    faq: [
      { q: "Czy zostanę zapisany do subskrypcji?", a: "Nie. Płatność jednorazowa. Nic się nie odnawia." },
      { q: "Co jeśli mi się nie spodoba?", a: "Masz 7 dni na pełen zwrot. Bez pytań." },
      { q: "Kiedy to dostanę?", a: "W kilka minut. Prosto na e-mail po zaksięgowaniu płatności." },
    ],
    testimonialQuote: "W 10 minut zrozumiałam wzorce, które ciągnęłam przez 10 lat.",
    testimonialAuthor: "Marta R. · Archetyp Status",
  },
  ro: {
    title: "La un clic de diagnoză",
    sub: "Plată unică. Fără abonament. PDF livrat în câteva minute.",
    summary: "Sumar comandă",
    mainItem: "Diagnoză Comportamentală — PDF",
    mainDesc: "30+ pagini · 4 zone · personalizat",
    bump1Title: "Ghid de Relații pe Arhetip",
    bump1Desc: "Cum se relaționează fiecare arhetip — util pentru parteneri, familie, asociați.",
    bump2Title: "Protocol Reset 30 zile",
    bump2Desc: "Plan zilnic cu 30 micro-acțiuni pentru a ieși din tipar.",
    addLabel: "Adaugă",
    addedLabel: "Adăugat",
    total: "Total",
    payButton: (total) => `Plătește ${total} în siguranță`,
    processing: "Se procesează plata…",
    secureBy: "Plată securizată prin Stripe",
    guarantee: "Garanție 7 zile — rambursare integrală fără întrebări.",
    poweredBy: "🔒 SSL · Stripe · Garanție 7 zile",
    anchorLabel: "De la",
    oneTimeNote: "Plată unică · Fără reînnoiri",
    offerBadge: "Ofertă unică — nu va reapărea",
    countdownLabel: "Această ofertă expiră în",
    ctaSubcopy: (m) => `Vei fi dus(ă) la checkout-ul securizat Stripe. Acceptăm ${m}.`,
    paymentMethods: "card, Apple Pay, Google Pay și Link",
    trustTitle: "De ce poți avea încredere",
    trustGuarantee: "Garanție 7 zile",
    trustGuaranteeDesc: "Rambursare integrală, fără întrebări. Un singur e-mail e suficient.",
    trustStripe: "Procesat prin Stripe",
    trustStripeDesc: "Aceeași infrastructură folosită de Apple, Google și Amazon.",
    trustSecure: "SSL 256-bit · PCI-DSS",
    trustSecureDesc: "Nu atingem niciodată cardul tău. Criptat end-to-end.",
    trustDelivery: "Livrare în câteva minute",
    trustDeliveryDesc: "PDF-ul ajunge pe e-mail imediat după confirmarea plății.",
    faqTitle: "Întrebări rapide",
    faq: [
      { q: "Voi fi abonat la ceva?", a: "Nu. Plată unică. Nimic nu se reînnoiește." },
      { q: "Ce dacă nu-mi place?", a: "Ai 7 zile pentru rambursare integrală. Fără întrebări." },
      { q: "Cât durează să primesc?", a: "Câteva minute. Direct pe e-mail după ce plata e confirmată." },
    ],
    testimonialQuote: "În 10 minute am înțeles tipare pe care le tragem de 10 ani.",
    testimonialAuthor: "Marta R. · Arhetip Statut",
  },
  ar: {
    title: "نقرة واحدة تفصلك عن تشخيصك",
    sub: "دفعة واحدة. بدون اشتراك. PDF يصل خلال دقائق.",
    summary: "ملخص الطلب",
    mainItem: "التشخيص السلوكي — PDF",
    mainDesc: "أكثر من 30 صفحة · 4 مجالات · شخصي",
    bump1Title: "دليل العلاقات حسب النمط",
    bump1Desc: "كيف يتعامل كل نمط — مفيد للشركاء والعائلة والشركاء التجاريين.",
    bump2Title: "بروتوكول إعادة الضبط لـ 30 يوماً",
    bump2Desc: "خطة يومية مع 30 إجراءً صغيراً لكسر النمط.",
    addLabel: "أضف",
    addedLabel: "تمت الإضافة",
    total: "الإجمالي",
    payButton: (total) => `ادفع ${total} بأمان`,
    processing: "جارٍ معالجة الدفع…",
    secureBy: "دفع آمن عبر Stripe",
    guarantee: "ضمان 7 أيام — استرداد كامل بدون أسئلة.",
    poweredBy: "🔒 SSL · Stripe · ضمان 7 أيام",
    anchorLabel: "من",
    oneTimeNote: "دفعة واحدة · بدون تجديد",
    offerBadge: "عرض لمرة واحدة — لن يظهر مجدداً",
    countdownLabel: "ينتهي هذا العرض خلال",
    ctaSubcopy: (m) => `سيتم نقلك إلى صفحة الدفع الآمنة من Stripe. نقبل ${m}.`,
    paymentMethods: "البطاقة، Apple Pay، Google Pay و Link",
    trustTitle: "لماذا يمكنك الوثوق بنا",
    trustGuarantee: "ضمان 7 أيام",
    trustGuaranteeDesc: "استرداد كامل، بدون أسئلة. بريد إلكتروني واحد يكفي.",
    trustStripe: "مدعوم من Stripe",
    trustStripeDesc: "نفس البنية التي تستخدمها Apple وGoogle وAmazon.",
    trustSecure: "تشفير SSL 256-bit · PCI-DSS",
    trustSecureDesc: "لا نلمس بطاقتك أبداً. تشفير من الطرف إلى الطرف.",
    trustDelivery: "التسليم خلال دقائق",
    trustDeliveryDesc: "يصلك PDF عبر البريد فور تأكيد الدفع.",
    faqTitle: "أسئلة سريعة",
    faq: [
      { q: "هل سأشترك في شيء؟", a: "لا. دفعة واحدة. لا شيء يتجدد." },
      { q: "ماذا لو لم يعجبني؟", a: "لديك 7 أيام لاسترداد كامل. بدون أسئلة." },
      { q: "كم من الوقت حتى أستلم؟", a: "دقائق. مباشرة إلى بريدك بعد تأكيد الدفع." },
    ],
    testimonialQuote: "في 10 دقائق فهمت أنماطاً جررتها لـ 10 سنوات.",
    testimonialAuthor: "مارتا ر. · نمط المكانة",
  },
};

interface Props {
  email: string;
  name: string;
  leadId: string | null;
  /** Bumps pré-seleccionados na página VSL (Fase 4). Sobrepõe defaults. */
  initialBumps?: ("bump1" | "bump2")[];
}

export function CheckoutStub({ email, name, leadId, initialBumps }: Props) {
  const { lang } = useI18n();
  const startCheckout = useServerFn(createCheckoutSession);
  const fetchQuote = useServerFn(getCheckoutQuote);
  const copy = COPY[lang] ?? COPY.en;

  const [bump1, setBump1] = useState(
    initialBumps ? initialBumps.includes("bump1") : false,
  );
  // Bump2 (30-day reset protocol) pre-ticked por Bible V2 quando o utilizador
  // não vem da VSL; quando vem, respeita a escolha feita lá.
  const [bump2, setBump2] = useState(
    initialBumps ? initialBumps.includes("bump2") : true,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    track(EVENTS.CHECKOUT_VIEW, { lang, has_lead: Boolean(leadId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleBump1 = () => {
    setBump1((v) => {
      track(EVENTS.BUMP_TOGGLED, { bump: "bump1", state: !v });
      return !v;
    });
  };
  const toggleBump2 = () => {
    setBump2((v) => {
      track(EVENTS.BUMP_TOGGLED, { bump: "bump2", state: !v });
      return !v;
    });
  };

  // Single source of truth: o servidor calcula tudo a partir do lang+bumps.
  // Mesma função usada para criar a Stripe Checkout Session.
  const bumps: ("bump1" | "bump2")[] = [];
  if (bump1) bumps.push("bump1");
  if (bump2) bumps.push("bump2");

  const quoteQuery = useQuery({
    queryKey: ["checkout-quote", lang, bump1, bump2],
    queryFn: () => fetchQuote({ data: { lang, bumps } }),
    staleTime: 60_000,
  });

  const prices = quoteQuery.data?.prices;
  const totalFormatted = prices?.total.formatted ?? "—";

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!leadId) {
      console.error("[checkout] missing leadId");
      return;
    }
    setSubmitting(true);
    try {
      const res = await startCheckout({
        data: { leadId, bumps, lang, origin: window.location.origin },
      });
      window.location.href = res.url;
    } catch (err) {
      console.error("[checkout]", err);
      setSubmitting(false);
    }
  };

  // Anchor price = ~3x the main price (shown struck-through to anchor value).
  const anchorFormatted = useMemo(() => {
    if (!prices) return null;
    const cents3x = prices.main.cents * 3;
    return formatCentsLike(cents3x, prices.main.formatted, prices.main.cents);
  }, [prices]);

  const handleClick = async () => {
    if (submitting) return;
    if (!leadId) {
      console.error("[checkout] missing leadId");
      return;
    }
    setSubmitting(true);
    track(EVENTS.CHECKOUT_CTA_CLICKED, {
      lang,
      bumps,
      total_cents: prices?.total.cents ?? null,
    });
    try {
      const res = await startCheckout({
        data: { leadId, bumps, lang, origin: window.location.origin },
      });
      track(EVENTS.STRIPE_SESSION_CREATED, { lang });
      window.location.href = res.url;
    } catch (err) {
      console.error("[checkout]", err);
      setSubmitting(false);
    }
  };
  // suppress unused-var warning for legacy form handler
  void handlePay;

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-12 md:px-8 md:py-20 pb-32 md:pb-20">
      <Reveal variant="fade-up" className="mx-auto mb-8 max-w-2xl text-center">
        <span aria-hidden className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-arch-primary">
          <Lock className="h-3 w-3" />
          {copy.secureBy}
        </span>
        <h1 className="font-display text-3xl font-black uppercase italic leading-tight tracking-tight md:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 text-base text-white/70 md:text-lg">{copy.sub}</p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
        {/* ──────── Order + CTA ──────── */}
        <Reveal variant="fade-up">
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6 md:p-8 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                {copy.summary}
              </h2>
              <CountdownPill minutes={10} label={copy.countdownLabel} />
            </div>

            {/* Main item */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-black uppercase italic tracking-tight">{copy.mainItem}</p>
                <p className="mt-1 text-sm text-white/60">{copy.mainDesc}</p>
              </div>
              <div className="shrink-0 text-end">
                {anchorFormatted && (
                  <p className="text-xs text-white/40 line-through">
                    {copy.anchorLabel} {anchorFormatted}
                  </p>
                )}
                <p className="font-mono text-base font-bold text-arch-primary">{prices?.main.formatted ?? "—"}</p>
              </div>
            </div>

            {/* Bumps */}
            <BumpRow
              active={bump1}
              onToggle={toggleBump1}
              title={copy.bump1Title}
              desc={copy.bump1Desc}
              price={prices?.bump1.formatted ?? "—"}
              addLabel={copy.addLabel}
              addedLabel={copy.addedLabel}
            />
            <BumpRow
              active={bump2}
              onToggle={toggleBump2}
              title={copy.bump2Title}
              desc={copy.bump2Desc}
              price={prices?.bump2.formatted ?? "—"}
              addLabel={copy.addLabel}
              addedLabel={copy.addedLabel}
            />

            {/* Total */}
            <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-5">
              <div>
                <span className="block text-sm font-bold uppercase tracking-[0.15em] text-white/80">{copy.total}</span>
                <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-white/45">{copy.oneTimeNote}</span>
              </div>
              <span className="font-display text-3xl font-black italic text-arch-primary md:text-4xl">
                {totalFormatted}
              </span>
            </div>

            {/* Offer badge */}
            <div
              aria-hidden
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-arch-primary/30 bg-arch-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-arch-primary"
            >
              <Zap className="h-3 w-3" />
              {copy.offerBadge}
            </div>

            {/* CTA — direct redirect to Stripe Checkout */}
            <ButtonPress>
              <button
                type="button"
                onClick={handleClick}
                disabled={submitting || !leadId}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-arch-primary px-6 py-5 text-base md:text-lg font-black uppercase tracking-wide text-primary-foreground shadow-[0_0_40px_-6px_var(--arch-glow)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-arch-primary/90 disabled:opacity-60"
              >
                <Lock className="h-5 w-5" />
                {submitting ? copy.processing : copy.payButton(totalFormatted)}
                {!submitting && <ArrowRight className="h-5 w-5" />}
              </button>
            </ButtonPress>

            <p className="mt-4 text-center text-xs text-white/55">
              {copy.ctaSubcopy(copy.paymentMethods)}
            </p>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-white/35">
              {copy.poweredBy}
            </p>
          </div>
        </Reveal>

        {/* ──────── Trust stack ──────── */}
        <Reveal variant="fade-up">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                {copy.trustTitle}
              </h3>
              <ul className="space-y-4">
                <TrustItem icon={ShieldCheck} title={copy.trustGuarantee} desc={copy.trustGuaranteeDesc} />
                <TrustItem icon={Lock} title={copy.trustStripe} desc={copy.trustStripeDesc} />
                <TrustItem icon={Check} title={copy.trustSecure} desc={copy.trustSecureDesc} />
                <TrustItem icon={Mail} title={copy.trustDelivery} desc={copy.trustDeliveryDesc} />
              </ul>
            </div>

            {/* Mini-testimonial */}
            <div className="rounded-3xl border border-arch-primary/20 bg-arch-primary/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-2 flex gap-0.5 text-arch-primary" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                    <path d="M10 1.5l2.6 5.4 6 .9-4.3 4.2 1 6L10 15.3l-5.3 2.7 1-6L1.4 7.8l6-.9z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-white/85 italic">"{copy.testimonialQuote}"</p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
                {copy.testimonialAuthor}
              </p>
            </div>

            {/* FAQ */}
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                {copy.faqTitle}
              </h3>
              <div className="divide-y divide-white/10">
                {copy.faq.map((f, i) => (
                  <FAQItem key={i} q={f.q} a={f.a} />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ──────── Sticky mobile CTA ──────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">{copy.total}</p>
            <p className="font-display text-lg font-black italic text-arch-primary">{totalFormatted}</p>
          </div>
          <button
            type="button"
            onClick={handleClick}
            disabled={submitting || !leadId}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-arch-primary px-4 py-3 text-sm font-black uppercase tracking-wide text-primary-foreground shadow-[0_0_24px_-6px_var(--arch-glow)] transition-all active:scale-[0.98] disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {submitting ? "…" : copy.payButton(totalFormatted)}
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Format cents using same currency formatting as the server quote.
 * Quick heuristic: replace the digits in the formatted main price with
 * the anchor amount, preserving prefix/suffix (R$, €, $, zł, etc).
 */
function formatCentsLike(targetCents: number, mainFormatted: string, mainCents: number): string {
  // Replace the numeric portion of mainFormatted with the scaled amount.
  const ratio = targetCents / mainCents;
  return mainFormatted.replace(/[\d.,]+/, (num) => {
    const sep = num.includes(",") && !num.includes(".") ? "," : ".";
    const cleaned = num.replace(/[^\d]/g, "");
    const numeric = Number(cleaned) / 100; // cents → value
    const scaled = numeric * ratio;
    return scaled.toFixed(2).replace(".", sep);
  });
}

/** Countdown pill — UI-only urgency cue. Uses sessionStorage so it doesn't reset on rerender. */
function CountdownPill({ minutes, label }: { minutes: number; label: string }) {
  const [remaining, setRemaining] = useState<number>(minutes * 60);

  useEffect(() => {
    const KEY = "checkout-countdown-deadline";
    let deadline = Number(sessionStorage.getItem(KEY) || 0);
    const now = Date.now();
    if (!deadline || deadline < now) {
      deadline = now + minutes * 60 * 1000;
      sessionStorage.setItem(KEY, String(deadline));
    }
    const tick = () => {
      const sec = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemaining(sec);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [minutes]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div
      aria-hidden
      className="inline-flex items-center gap-1.5 rounded-full border border-arch-primary/40 bg-arch-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-arch-primary"
    >
      <Clock className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
      <span className="font-mono tabular-nums">{mm}:{ss}</span>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-arch-primary/10 text-arch-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-white/60">{desc}</p>
      </div>
    </li>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-start text-sm font-bold text-white/90 transition-colors hover:text-white"
      >
        <span>{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-2 text-xs leading-relaxed text-white/65">{a}</p>}
    </div>
  );
}

function BumpRow(props: {
  active: boolean;
  onToggle: () => void;
  title: string;
  desc: string;
  price: string;
  addLabel: string;
  addedLabel: string;
}) {
  const { active, onToggle, title, desc, price, addLabel, addedLabel } = props;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`mt-4 flex w-full items-start gap-3 rounded-2xl border p-4 text-start transition-all ${
        active
          ? "border-arch-primary/60 bg-arch-primary/[0.08]"
          : "border-white/10 bg-black/30 hover:border-white/25"
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
          active ? "border-arch-primary bg-arch-primary text-primary-foreground" : "border-white/30 bg-transparent"
        }`}
      >
        {active && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-white">{title}</p>
          <span className="shrink-0 font-mono text-sm font-bold text-arch-primary">+{price}</span>
        </div>
        <p className="mt-1 text-xs text-white/55">{desc}</p>
        <p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.15em] ${active ? "text-arch-primary" : "text-white/40"}`}>
          {active ? `✓ ${addedLabel}` : `+ ${addLabel}`}
        </p>
      </div>
    </button>
  );
}