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
}

export function CheckoutStub({ email, name, leadId }: Props) {
  const { lang } = useI18n();
  const startCheckout = useServerFn(createCheckoutSession);
  const fetchQuote = useServerFn(getCheckoutQuote);
  const copy = COPY[lang] ?? COPY.en;

  const [bump1, setBump1] = useState(false);
  const [bump2, setBump2] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 py-16 md:px-8 md:py-24">
      <Reveal variant="fade-up" className="mx-auto mb-10 max-w-2xl text-center">
        <span aria-hidden className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-arch-primary">
          <Lock className="h-3 w-3" />
          {copy.secureBy}
        </span>
        <h1 className="font-display text-3xl font-black uppercase italic leading-tight tracking-tight md:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 text-base text-white/70 md:text-lg">{copy.sub}</p>
      </Reveal>

      <form onSubmit={handlePay} className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* ──────── Order summary ──────── */}
        <Reveal variant="fade-up" className="order-2 lg:order-1">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-xl">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              {copy.summary}
            </h2>

            {/* Main item */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-black uppercase italic tracking-tight">{copy.mainItem}</p>
                <p className="mt-1 text-sm text-white/60">{copy.mainDesc}</p>
              </div>
              <p className="shrink-0 font-mono text-base font-bold text-arch-primary">{prices?.main.formatted ?? "—"}</p>
            </div>

            {/* Bumps */}
            <BumpRow
              active={bump1}
              onToggle={() => setBump1((v) => !v)}
              title={copy.bump1Title}
              desc={copy.bump1Desc}
              price={prices?.bump1.formatted ?? "—"}
              addLabel={copy.addLabel}
              addedLabel={copy.addedLabel}
            />
            <BumpRow
              active={bump2}
              onToggle={() => setBump2((v) => !v)}
              title={copy.bump2Title}
              desc={copy.bump2Desc}
              price={prices?.bump2.formatted ?? "—"}
              addLabel={copy.addLabel}
              addedLabel={copy.addedLabel}
            />

            {/* Total */}
            <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-5">
              <span className="text-sm font-bold uppercase tracking-[0.15em] text-white/80">{copy.total}</span>
              <span className="font-display text-2xl font-black italic text-arch-primary md:text-3xl">
                {totalFormatted}
              </span>
            </div>

            <p className="mt-5 flex items-start gap-2 text-xs text-white/60">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-arch-primary" />
              <span>{copy.guarantee}</span>
            </p>
          </div>
        </Reveal>

        {/* ──────── Payment form ──────── */}
        <Reveal variant="fade-up" className="order-1 lg:order-2">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-xl">
            <div className="space-y-4">
              <Field label={copy.emailLabel}>
                <input
                  type="email"
                  defaultValue={email}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-arch-primary focus:bg-black/70"
                />
              </Field>

              <Field label={copy.cardLabel}>
                <div className="relative">
                  <input
                    inputMode="numeric"
                    placeholder={copy.cardPlaceholder}
                    required
                    autoComplete="cc-number"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 pe-12 text-sm font-mono text-white placeholder-white/30 outline-none transition-all focus:border-arch-primary focus:bg-black/70"
                  />
                  <CreditCard aria-hidden className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label={copy.expLabel}>
                  <input
                    inputMode="numeric"
                    placeholder="MM / YY"
                    required
                    autoComplete="cc-exp"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-mono text-white placeholder-white/30 outline-none transition-all focus:border-arch-primary focus:bg-black/70"
                  />
                </Field>
                <Field label={copy.cvcLabel}>
                  <input
                    inputMode="numeric"
                    placeholder="123"
                    required
                    autoComplete="cc-csc"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-mono text-white placeholder-white/30 outline-none transition-all focus:border-arch-primary focus:bg-black/70"
                  />
                </Field>
              </div>

              <Field label={copy.nameLabel}>
                <input
                  type="text"
                  defaultValue={name}
                  required
                  autoComplete="cc-name"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-arch-primary focus:bg-black/70"
                />
              </Field>
            </div>

            <ButtonPress>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-arch-primary px-6 py-4 text-base font-black uppercase tracking-wide text-primary-foreground shadow-[0_0_30px_-6px_var(--arch-glow)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-arch-primary/90 disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {submitting ? copy.processing : copy.payButton(totalFormatted)}
              </button>
            </ButtonPress>

            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.15em] text-white/40">
              {copy.poweredBy}
            </p>
          </div>
        </Reveal>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">
        {label}
      </span>
      {children}
    </label>
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