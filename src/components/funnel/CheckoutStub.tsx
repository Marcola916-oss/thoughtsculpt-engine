import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock, ShieldCheck, CreditCard, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getPricing } from "@/lib/funnel/pricing-stub";
import { Reveal } from "@/components/interaction/Reveal";
import { ButtonPress } from "@/components/interaction/ButtonPress";

/**
 * Phase B6 — Checkout stub.
 * Visual-only checkout. Replaced in Phase D by real Stripe Elements
 * (the layout/contract stays identical so swap is trivial).
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
  emailLabel: string;
  cardLabel: string;
  cardPlaceholder: string;
  expLabel: string;
  cvcLabel: string;
  nameLabel: string;
  payButton: (total: string) => string;
  processing: string;
  secureBy: string;
  guarantee: string;
  poweredBy: string;
};

const COPY: Record<string, Copy> = {
  pt: {
    title: "Finaliza o teu diagnóstico",
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
    emailLabel: "Email",
    cardLabel: "Dados do cartão",
    cardPlaceholder: "1234 1234 1234 1234",
    expLabel: "MM / AA",
    cvcLabel: "CVC",
    nameLabel: "Nome no cartão",
    payButton: (total) => `Pagar ${total}`,
    processing: "A processar pagamento…",
    secureBy: "Pagamento seguro via Stripe",
    guarantee: "Garantia de 7 dias — reembolso integral sem perguntas.",
    poweredBy: "🔒 SSL · Stripe · 7 dias garantia",
  },
  en: {
    title: "Complete your diagnosis",
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
    emailLabel: "Email",
    cardLabel: "Card details",
    cardPlaceholder: "1234 1234 1234 1234",
    expLabel: "MM / YY",
    cvcLabel: "CVC",
    nameLabel: "Name on card",
    payButton: (total) => `Pay ${total}`,
    processing: "Processing payment…",
    secureBy: "Secure payment via Stripe",
    guarantee: "7-day guarantee — full refund, no questions asked.",
    poweredBy: "🔒 SSL · Stripe · 7-day guarantee",
  },
  pl: {
    title: "Dokończ swoją diagnozę",
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
    emailLabel: "E-mail",
    cardLabel: "Dane karty",
    cardPlaceholder: "1234 1234 1234 1234",
    expLabel: "MM / RR",
    cvcLabel: "CVC",
    nameLabel: "Imię i nazwisko na karcie",
    payButton: (total) => `Zapłać ${total}`,
    processing: "Przetwarzanie płatności…",
    secureBy: "Bezpieczna płatność przez Stripe",
    guarantee: "Gwarancja 7 dni — pełen zwrot bez pytań.",
    poweredBy: "🔒 SSL · Stripe · 7-dniowa gwarancja",
  },
  ro: {
    title: "Finalizează diagnoza",
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
    emailLabel: "E-mail",
    cardLabel: "Date card",
    cardPlaceholder: "1234 1234 1234 1234",
    expLabel: "LL / AA",
    cvcLabel: "CVC",
    nameLabel: "Nume pe card",
    payButton: (total) => `Plătește ${total}`,
    processing: "Se procesează plata…",
    secureBy: "Plată securizată prin Stripe",
    guarantee: "Garanție 7 zile — rambursare integrală fără întrebări.",
    poweredBy: "🔒 SSL · Stripe · Garanție 7 zile",
  },
  ar: {
    title: "أكمل تشخيصك",
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
    emailLabel: "البريد الإلكتروني",
    cardLabel: "بيانات البطاقة",
    cardPlaceholder: "1234 1234 1234 1234",
    expLabel: "MM / YY",
    cvcLabel: "CVC",
    nameLabel: "الاسم على البطاقة",
    payButton: (total) => `ادفع ${total}`,
    processing: "جارٍ معالجة الدفع…",
    secureBy: "دفع آمن عبر Stripe",
    guarantee: "ضمان 7 أيام — استرداد كامل بدون أسئلة.",
    poweredBy: "🔒 SSL · Stripe · ضمان 7 أيام",
  },
};

interface Props {
  email: string;
  name: string;
}

export function CheckoutStub({ email, name }: Props) {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const copy = COPY[lang] ?? COPY.en;
  const pricing = getPricing(lang);

  const [bump1, setBump1] = useState(false);
  const [bump2, setBump2] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Numeric totals derived from the stub strings — Phase D replaces this with Stripe Prices.
  const totals = useMemo(() => {
    const parse = (s: string) => {
      const n = parseFloat(s.replace(/[^\d.,]/g, "").replace(",", "."));
      return Number.isFinite(n) ? n : 0;
    };
    const main = parse(pricing.main);
    const b1 = parse(pricing.bump1);
    const b2 = parse(pricing.bump2);
    const sum = main + (bump1 ? b1 : 0) + (bump2 ? b2 : 0);
    // Reformat keeping the original symbol style.
    const formatted = pricing.symbol.includes("R$") || pricing.symbol === "€"
      ? `${pricing.symbol}${sum.toFixed(2).replace(".", ",")}`
      : pricing.symbol === "$"
        ? `${pricing.symbol}${sum.toFixed(2)}`
        : `${sum.toFixed(0)} ${pricing.symbol}`;
    return { sum, formatted };
  }, [pricing, bump1, bump2]);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // Phase D: replace this with stripe.confirmPayment() then redirect on webhook success.
    setTimeout(() => {
      navigate({ to: "/obrigado", search: { ob1: bump1 ? 1 : 0, ob2: bump2 ? 1 : 0 } as never });
    }, 1200);
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
              <p className="shrink-0 font-mono text-base font-bold text-arch-primary">{pricing.main}</p>
            </div>

            {/* Bumps */}
            <BumpRow
              active={bump1}
              onToggle={() => setBump1((v) => !v)}
              title={copy.bump1Title}
              desc={copy.bump1Desc}
              price={pricing.bump1}
              addLabel={copy.addLabel}
              addedLabel={copy.addedLabel}
            />
            <BumpRow
              active={bump2}
              onToggle={() => setBump2((v) => !v)}
              title={copy.bump2Title}
              desc={copy.bump2Desc}
              price={pricing.bump2}
              addLabel={copy.addLabel}
              addedLabel={copy.addedLabel}
            />

            {/* Total */}
            <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-5">
              <span className="text-sm font-bold uppercase tracking-[0.15em] text-white/80">{copy.total}</span>
              <span className="font-display text-2xl font-black italic text-arch-primary md:text-3xl">
                {totals.formatted}
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
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 pr-12 text-sm font-mono text-white placeholder-white/30 outline-none transition-all focus:border-arch-primary focus:bg-black/70"
                  />
                  <CreditCard aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
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
                {submitting ? copy.processing : copy.payButton(totals.formatted)}
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
      className={`mt-4 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
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