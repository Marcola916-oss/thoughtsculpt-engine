import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { createCheckoutSession } from "@/lib/payments/checkout.functions";
import { getCheckoutQuote } from "@/lib/payments/quote.functions";
import {
  Lock,
  ShieldCheck,
  Check,
  Clock,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Globe2,
  Plus,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/interaction/Reveal";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { AnimatedCounter } from "@/components/sales/AnimatedCounter";
import { track, EVENTS } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import adamPhoto from "@/assets/testimonials/adam.jpg";
import mariaPhoto from "@/assets/testimonials/maria.jpg";
import ramiPhoto from "@/assets/testimonials/rami.jpg";
import ioanaPhoto from "@/assets/testimonials/ioana.webp";
import katarzynaPhoto from "@/assets/testimonials/katarzyna.webp";
import yousefPhoto from "@/assets/testimonials/yousef.webp";

function getPhotoForName(name: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("adam")) return adamPhoto;
  if (n.includes("maria")) return mariaPhoto;
  if (n.includes("rami")) return ramiPhoto;
  if (n.includes("ioana")) return ioanaPhoto;
  if (n.includes("katarzyna")) return katarzynaPhoto;
  if (n.includes("yousef") || n.includes("youssef")) return yousefPhoto;
  return ioanaPhoto;
}

/**
 * Tela 13 — Decision Page (PR3 redesign).
 * Single-viewport-first checkout page that mirrors the landing/reveal language:
 * - red pulsing badge (badge-pulse) above the hero
 * - Syne 800 uppercase headlines, Inter 800 CTA
 * - bumps as big decision cards with archetype glow + roll-up total
 * - rolling mini-testimonials, guarantee seal, trust strip, sticky mobile CTA
 *
 * Backend integration (Stripe + quote) is unchanged from PR1/PR2.
 */

// ────────────────────────────────────────────────────────────────────────────
// COPY (5 langs) — checkout-specific strings live here.
// Deliverables list + mini-testimonials are sourced from the shared dict
// (t.salesV2.b5.deliverables / t.landing.testimonials) to keep one source of truth.
// ────────────────────────────────────────────────────────────────────────────

type Copy = {
  decideNow: string;
  hello: (name: string) => string;
  sub: string;
  statDiagnoses: string;
  statRating: string;
  statDelivery: string;
  statGuarantee: string;
  starAriaLabel: string;
  mainTitle: string;
  mainDesc: string;
  includedTitle: string;
  bump1Title: string;
  bump1Desc: string;
  bump2Title: string;
  bump2Desc: string;
  bumpPlus: string;
  total: string;
  oneTimeNote: string;
  discountToday: (pct: number) => string;
  payCta: (total: string) => string;
  payCtaWithBumps: (total: string) => string;
  processing: string;
  ctaSubcopy: (methods: string) => string;
  paymentMethods: string;
  trustStripe: string;
  trustSsl: string;
  trustGuarantee: string;
  trustLangs: string;
  socialTitle: string;
  guaranteeTitle: string;
  guaranteeBody: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  countdownLabel: string;
  anchorLabel: string;
  archByline: (arch: string) => string;
};

const COPY: Record<string, Copy> = {
  pt: {
    decideNow: "Decide agora",
    hello: (n) => `${n}, escolhe o teu protocolo.`,
    sub: "Tudo o que viste nas últimas páginas, num só ecrã. Sem letra pequena.",
    statDiagnoses: "12.000 diagnósticos",
    statRating: "4,9★ média",
    statDelivery: "PDF em 60s",
    statGuarantee: "30 dias garantia",
    starAriaLabel: "5 estrelas",
    mainTitle: "Protocolo MindReset",
    mainDesc: "Tudo o que precisas para sair do padrão — sem assinatura, sem letra pequena.",
    includedTitle: "O que está incluído",
    bump1Title: "Guia de Relações por Arquétipo",
    bump1Desc: "Como cada arquétipo se relaciona — parceiros, família, sócios.",
    bump2Title: "Protocolo de Reset 30 dias",
    bump2Desc: "Plano diário com 30 micro-ações que rompem o padrão.",
    bumpPlus: "Adiciona",
    total: "Total hoje",
    oneTimeNote: "Pagamento único · Sem renovação",
    discountToday: (pct) => `−${pct}% só hoje`,
    payCta: (t) => `Desbloquear protocolo por ${t}`,
    payCtaWithBumps: (t) => `Desbloquear tudo por ${t}`,
    processing: "A processar…",
    ctaSubcopy: (m) => `Pagamento processado pelo Stripe. Aceitamos ${m}.`,
    paymentMethods: "cartão, Apple Pay, Google Pay e Pix",
    trustStripe: "Stripe",
    trustSsl: "SSL 256-bit",
    trustGuarantee: "30 dias garantia",
    trustLangs: "5 idiomas",
    socialTitle: "Gente como tu já decidiu",
    guaranteeTitle: "Garantia incondicional de 30 dias",
    guaranteeBody: "Se em 30 dias não vires mudança real, devolvemos 100% sem perguntas. Basta um email.",
    faqTitle: "Dúvidas finais",
    faq: [
      { q: "Vou ter que assinar algo?", a: "Não. Pagamento único. Nada renova, nada cobra de novo." },
      { q: "E se eu não gostar?", a: "Tens 30 dias para pedir reembolso integral — basta um email." },
      { q: "Quanto tempo até receber?", a: "Minutos. Vai direto para o teu email assim que pagares." },
    ],
    countdownLabel: "Expira em",
    anchorLabel: "Antes",
    archByline: (a) => `Arquétipo ${a}`,
  },
  en: {
    decideNow: "Decide now",
    hello: (n) => `${n}, choose your protocol.`,
    sub: "Everything you saw on the last screens, in one place. No fine print.",
    statDiagnoses: "12,000 diagnoses",
    statRating: "4.9★ avg",
    statDelivery: "PDF in 60s",
    statGuarantee: "30-day guarantee",
    starAriaLabel: "5 stars",
    mainTitle: "MindReset Protocol",
    mainDesc: "Everything you need to break the pattern — no subscription, no fine print.",
    includedTitle: "What's included",
    bump1Title: "Relationship Guide by Archetype",
    bump1Desc: "How each archetype relates — partners, family, co-founders.",
    bump2Title: "30-Day Reset Protocol",
    bump2Desc: "Daily plan with 30 micro-actions that break the pattern.",
    bumpPlus: "Add",
    total: "Total today",
    oneTimeNote: "One-time payment · No renewals",
    discountToday: (pct) => `−${pct}% today only`,
    payCta: (t) => `Unlock protocol for ${t}`,
    payCtaWithBumps: (t) => `Unlock everything for ${t}`,
    processing: "Processing…",
    ctaSubcopy: (m) => `Payment processed by Stripe. We accept ${m}.`,
    paymentMethods: "card, Apple Pay, Google Pay & Link",
    trustStripe: "Stripe",
    trustSsl: "256-bit SSL",
    trustGuarantee: "30-day guarantee",
    trustLangs: "5 languages",
    socialTitle: "People like you already decided",
    guaranteeTitle: "Unconditional 30-day guarantee",
    guaranteeBody: "If in 30 days you don't see real change, we refund 100% — no questions asked. One email is enough.",
    faqTitle: "Final questions",
    faq: [
      { q: "Will I be subscribed to anything?", a: "No. One-time payment. Nothing renews, nothing recurs." },
      { q: "What if I don't like it?", a: "You have 30 days for a full refund — one email is enough." },
      { q: "How long until I receive it?", a: "Minutes. Straight to your inbox the moment payment clears." },
    ],
    countdownLabel: "Expires in",
    anchorLabel: "Was",
    archByline: (a) => `${a} archetype`,
  },
  pl: {
    decideNow: "Zdecyduj teraz",
    hello: (n) => `${n}, wybierz swój protokół.`,
    sub: "Wszystko, co widziałeś na ostatnich ekranach, w jednym miejscu. Bez drobnego druku.",
    statDiagnoses: "12 000 diagnoz",
    statRating: "4,9★ średnio",
    statDelivery: "PDF w 60s",
    statGuarantee: "30 dni gwarancji",
    starAriaLabel: "5 gwiazdek",
    mainTitle: "Protokół MindReset",
    mainDesc: "Wszystko, czego potrzebujesz, by przerwać wzorzec — bez subskrypcji, bez drobnego druku.",
    includedTitle: "Co jest w środku",
    bump1Title: "Przewodnik Relacji wg Archetypu",
    bump1Desc: "Jak każdy archetyp tworzy relacje — partnerzy, rodzina, wspólnicy.",
    bump2Title: "30-dniowy Protokół Resetu",
    bump2Desc: "Codzienny plan z 30 mikro-działaniami, które przerywają wzorzec.",
    bumpPlus: "Dodaj",
    total: "Razem dziś",
    oneTimeNote: "Płatność jednorazowa · Bez odnowień",
    discountToday: (pct) => `−${pct}% tylko dziś`,
    payCta: (t) => `Odblokuj protokół za ${t}`,
    payCtaWithBumps: (t) => `Odblokuj wszystko za ${t}`,
    processing: "Przetwarzanie…",
    ctaSubcopy: (m) => `Płatność obsługiwana przez Stripe. Akceptujemy ${m}.`,
    paymentMethods: "kartę, Apple Pay, Google Pay, BLIK i Link",
    trustStripe: "Stripe",
    trustSsl: "SSL 256-bit",
    trustGuarantee: "30 dni gwarancji",
    trustLangs: "5 języków",
    socialTitle: "Ludzie tacy jak ty już zdecydowali",
    guaranteeTitle: "Bezwarunkowa gwarancja 30 dni",
    guaranteeBody: "Jeśli w 30 dni nie zobaczysz realnej zmiany, zwracamy 100% — bez pytań. Wystarczy jeden e-mail.",
    faqTitle: "Ostatnie pytania",
    faq: [
      { q: "Czy zostanę zapisany do subskrypcji?", a: "Nie. Płatność jednorazowa. Nic się nie odnawia." },
      { q: "Co jeśli mi się nie spodoba?", a: "Masz 30 dni na pełen zwrot — wystarczy jeden e-mail." },
      { q: "Kiedy to dostanę?", a: "W kilka minut. Prosto na e-mail po zaksięgowaniu płatności." },
    ],
    countdownLabel: "Wygasa za",
    anchorLabel: "Było",
    archByline: (a) => `Archetyp ${a}`,
  },
  ro: {
    decideNow: "Decide acum",
    hello: (n) => `${n}, alege-ți protocolul.`,
    sub: "Tot ce ai văzut pe ecranele anterioare, într-un singur loc. Fără text mărunt.",
    statDiagnoses: "12.000 de diagnoze",
    statRating: "4,9★ medie",
    statDelivery: "PDF în 60s",
    statGuarantee: "30 zile garanție",
    starAriaLabel: "5 stele",
    mainTitle: "Protocolul MindReset",
    mainDesc: "Tot ce ai nevoie ca să ieși din tipar — fără abonament, fără text mărunt.",
    includedTitle: "Ce este inclus",
    bump1Title: "Ghid de Relații pe Arhetip",
    bump1Desc: "Cum se relaționează fiecare arhetip — parteneri, familie, asociați.",
    bump2Title: "Protocol Reset 30 zile",
    bump2Desc: "Plan zilnic cu 30 de micro-acțiuni care rup tiparul.",
    bumpPlus: "Adaugă",
    total: "Total astăzi",
    oneTimeNote: "Plată unică · Fără reînnoiri",
    discountToday: (pct) => `−${pct}% doar astăzi`,
    payCta: (t) => `Deblochează protocolul pentru ${t}`,
    payCtaWithBumps: (t) => `Deblochează tot pentru ${t}`,
    processing: "Se procesează…",
    ctaSubcopy: (m) => `Plată procesată de Stripe. Acceptăm ${m}.`,
    paymentMethods: "card, Apple Pay, Google Pay și Link",
    trustStripe: "Stripe",
    trustSsl: "SSL 256-bit",
    trustGuarantee: "30 zile garanție",
    trustLangs: "5 limbi",
    socialTitle: "Oameni ca tine au decis deja",
    guaranteeTitle: "Garanție necondiționată de 30 de zile",
    guaranteeBody: "Dacă în 30 de zile nu vezi o schimbare reală, returnăm 100% — fără întrebări. Un singur e-mail e suficient.",
    faqTitle: "Întrebări finale",
    faq: [
      { q: "Voi fi abonat la ceva?", a: "Nu. Plată unică. Nimic nu se reînnoiește." },
      { q: "Și dacă nu-mi place?", a: "Ai 30 de zile pentru rambursare integrală — un e-mail e suficient." },
      { q: "Cât durează până primesc?", a: "Minute. Direct în e-mail după confirmarea plății." },
    ],
    countdownLabel: "Expiră în",
    anchorLabel: "Înainte",
    archByline: (a) => `Arhetip ${a}`,
  },
  ar: {
    decideNow: "قرّر الآن",
    hello: (n) => `${n}، اختر بروتوكولك.`,
    sub: "كل ما رأيته في الشاشات الأخيرة، في مكان واحد. بلا حروف صغيرة.",
    statDiagnoses: "12,000 تشخيص",
    statRating: "4.9★ متوسط",
    statDelivery: "PDF خلال 60 ثانية",
    statGuarantee: "ضمان 30 يوماً",
    starAriaLabel: "5 نجوم",
    mainTitle: "بروتوكول MindReset",
    mainDesc: "كل ما تحتاج لكسر النمط — بدون اشتراك، بدون حروف صغيرة.",
    includedTitle: "ما المتضمَّن",
    bump1Title: "دليل العلاقات حسب النمط",
    bump1Desc: "كيف يتعامل كل نمط — الشركاء، العائلة، الشركاء التجاريون.",
    bump2Title: "بروتوكول إعادة الضبط لـ 30 يوماً",
    bump2Desc: "خطة يومية مع 30 إجراءً صغيراً تكسر النمط.",
    bumpPlus: "أضف",
    total: "الإجمالي اليوم",
    oneTimeNote: "دفعة واحدة · بدون تجديد",
    discountToday: (pct) => `−${pct}% اليوم فقط`,
    payCta: (t) => `افتح البروتوكول مقابل ${t}`,
    payCtaWithBumps: (t) => `افتح كل شيء مقابل ${t}`,
    processing: "جارٍ المعالجة…",
    ctaSubcopy: (m) => `الدفع عبر Stripe. نقبل ${m}.`,
    paymentMethods: "البطاقة، Apple Pay، Google Pay و Link",
    trustStripe: "Stripe",
    trustSsl: "SSL 256-bit",
    trustGuarantee: "ضمان 30 يوماً",
    trustLangs: "5 لغات",
    socialTitle: "أناس مثلك قرّروا بالفعل",
    guaranteeTitle: "ضمان غير مشروط لمدة 30 يوماً",
    guaranteeBody: "إن لم ترَ تغييراً حقيقياً خلال 30 يوماً، نرد 100% بلا أسئلة. بريد إلكتروني واحد يكفي.",
    faqTitle: "أسئلة أخيرة",
    faq: [
      { q: "هل سأشترك في شيء؟", a: "لا. دفعة واحدة. لا شيء يتجدد." },
      { q: "ماذا لو لم يعجبني؟", a: "لديك 30 يوماً لاسترداد كامل — بريد إلكتروني واحد يكفي." },
      { q: "كم من الوقت حتى أستلم؟", a: "دقائق. مباشرة إلى بريدك بعد تأكيد الدفع." },
    ],
    countdownLabel: "ينتهي خلال",
    anchorLabel: "من",
    archByline: (a) => `نمط ${a}`,
  },
};

// ────────────────────────────────────────────────────────────────────────────

interface Props {
  email: string;
  name: string;
  leadId: string | null;
  /** Bumps pré-seleccionados na página VSL. Sobrepõe defaults. */
  initialBumps?: ("bump1" | "bump2")[];
}

const ABSENT_NAME: Record<string, string> = {
  pt: "Tu",
  en: "You",
  pl: "Ty",
  ro: "Tu",
  ar: "أنت",
};

export function CheckoutStub({ email, name, leadId, initialBumps }: Props) {
  void email;
  const { lang, t } = useI18n();
  const startCheckout = useServerFn(createCheckoutSession);
  const fetchQuote = useServerFn(getCheckoutQuote);
  const copy = COPY[lang] ?? COPY.en;
  const displayName = name?.trim() || ABSENT_NAME[lang] || ABSENT_NAME.en;

  const [bump1, setBump1] = useState(
    initialBumps ? initialBumps.includes("bump1") : false,
  );
  const [bump2, setBump2] = useState(
    initialBumps ? initialBumps.includes("bump2") : true,
  );
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const ctaRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    track(EVENTS.CHECKOUT_VIEW, { lang, has_lead: Boolean(leadId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Micro-shake do CTA depois de 8s idle (a11y: respeita reduced-motion)
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setTimeout(() => setShake(true), 8000);
    const off = window.setTimeout(() => setShake(false), 9200);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(off);
    };
  }, []);

  const bumps: ("bump1" | "bump2")[] = [];
  if (bump1) bumps.push("bump1");
  if (bump2) bumps.push("bump2");

  const toggleBump = (which: "bump1" | "bump2") => {
    const setter = which === "bump1" ? setBump1 : setBump2;
    setter((v) => {
      const next = !v;
      track(EVENTS.BUMP_TOGGLED, { bump: which, state: next });
      track(EVENTS.CHECKOUT_BUMP_TOGGLED, { bump: which, state: next });
      return next;
    });
  };

  const quoteQuery = useQuery({
    queryKey: ["checkout-quote", lang, bump1, bump2],
    queryFn: () => fetchQuote({ data: { lang, bumps } }),
    staleTime: 60_000,
  });

  const prices = quoteQuery.data?.prices;
  const totalFormatted = prices?.total.formatted ?? "—";

  const anchorFormatted = useMemo(() => {
    if (!prices) return null;
    return formatCentsLike(prices.main.cents * 3, prices.main.formatted, prices.main.cents);
  }, [prices]);

  const discountPct = useMemo(() => {
    if (!prices) return 50;
    const anchor = prices.main.cents * 3;
    return Math.round(((anchor - prices.main.cents) / anchor) * 100);
  }, [prices]);

  // Total animado em "moeda × 100" (cents) → formatamos só o número, sufixo fica fixo
  const totalAnim = useMemo(() => {
    if (!prices) return { value: 0, prefix: "", suffix: "" };
    const formatted = prices.total.formatted;
    const match = formatted.match(/([\d.,]+)/);
    if (!match) return { value: prices.total.cents / 100, prefix: "", suffix: "" };
    const idx = formatted.indexOf(match[0]);
    const prefix = formatted.slice(0, idx);
    const suffix = formatted.slice(idx + match[0].length);
    return { value: Math.round(prices.total.cents / 100), prefix, suffix };
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

  // Deliverables (shared dict) — primeiros 6
  const deliverables = (t.salesV2?.b5?.deliverables ?? []).slice(0, 6);

  // Mini-testemunhos (rolling) — usa landing testimonials (3 itens)
  const miniTestimonials = (t.landing?.testimonials?.items ?? []).slice(0, 3);

  const ctaCopy = bumps.length === 0 ? copy.payCta(totalFormatted) : copy.payCtaWithBumps(totalFormatted);

  return (
      <section className="relative mx-auto w-full max-w-5xl min-h-screen px-4 py-10 md:px-8 md:py-16 pb-32 md:pb-20">
        {/* ─────────── Header ─────────── */}
        <Reveal variant="fade-up" className="mx-auto mb-10 max-w-3xl text-center">
          <span
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-arch-primary/30 bg-arch-primary/10 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-arch-primary shadow-[0_0_18px_-4px_var(--arch-glow)] badge-pulse"
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            {copy.decideNow}
          </span>
          <h1 className="font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight md:text-5xl">
            {copy.hello(displayName)}
          </h1>
          <p className="mt-4 text-base text-foreground/70 md:text-lg">{copy.sub}</p>

          {/* Stat chips */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/75">
            {[
              { icon: <Sparkles className="h-3 w-3" aria-hidden />, text: copy.statDiagnoses },
              { icon: <Star className="h-3 w-3" aria-hidden />, text: copy.statRating },
              { icon: <Clock className="h-3 w-3" aria-hidden />, text: copy.statDelivery },
              { icon: <ShieldCheck className="h-3 w-3" aria-hidden />, text: copy.statGuarantee },
            ].map((s) => (
              <li
                key={s.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-black/40 px-3 py-1 backdrop-blur-md"
              >
                <span className="text-arch-primary">{s.icon}</span>
                {s.text}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* ─────────── Main card ─────────── */}
        <Reveal variant="fade-up">
          <article className="relative overflow-hidden rounded-[2.5rem] border border-arch-primary/30 bg-black/55 p-6 backdrop-blur-xl shadow-[0_50px_120px_-40px_var(--arch-glow)] md:p-9">
            {/* Top: title + countdown */}
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-extrabold uppercase tracking-tight md:text-2xl">
                  {copy.mainTitle}
                </h2>
                <p className="mt-1 max-w-xl text-sm text-foreground/65 md:text-base">{copy.mainDesc}</p>
              </div>
              <CountdownPill minutes={10} label={copy.countdownLabel} />
            </header>

            {/* Includes grid */}
            <section className="mt-6">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/55">
                {copy.includedTitle}
              </h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {deliverables.map((d, i) => (
                  <li
                    key={i}
                    className="group flex items-start gap-3 rounded-[1.5rem] border border-foreground/10 bg-black/30 p-3 transition-all duration-300 hover:border-arch-primary/20 hover:bg-black/40"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-arch-primary/15 text-arch-primary">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{d.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-foreground/60">
                        {d.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Price anchor */}
            <section className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-foreground/10 pt-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/55">
                  {copy.total}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                  {copy.oneTimeNote}
                </p>
              </div>
              <div className="text-end">
                {anchorFormatted && (
                  <p className="text-xs text-foreground/40 line-through">
                    {copy.anchorLabel} {anchorFormatted}
                  </p>
                )}
                <p className="mt-1 font-display text-4xl font-extrabold leading-none text-arch-primary md:text-5xl">
                  <AnimatedCounter
                    end={totalAnim.value}
                    prefix={totalAnim.prefix}
                    suffix={totalAnim.suffix}
                    duration={0.8}
                  />
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-arch-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-arch-primary">
                  <Zap className="h-3 w-3" /> {copy.discountToday(discountPct)}
                </span>
              </div>
            </section>

            {/* Bumps */}
            <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              <BumpCard
                active={bump1}
                onToggle={() => toggleBump("bump1")}
                title={copy.bump1Title}
                desc={copy.bump1Desc}
                price={prices?.bump1.formatted ?? "—"}
                plus={copy.bumpPlus}
              />
              <BumpCard
                active={bump2}
                onToggle={() => toggleBump("bump2")}
                title={copy.bump2Title}
                desc={copy.bump2Desc}
                price={prices?.bump2.formatted ?? "—"}
                plus={copy.bumpPlus}
              />
            </section>

            {/* CTA */}
            <div className="mt-8 flex w-full justify-center">
              <ButtonPress
                ref={ctaRef}
                type="button"
                onClick={handleClick}
                disabled={submitting || !leadId}
                style={{
                  animation: shake ? "checkout-cta-shake 0.7s ease-in-out" : undefined,
                }}
                className="group relative flex h-20 w-full items-center justify-center gap-3 overflow-hidden rounded-[1.5rem] bg-arch-primary px-6 font-sans text-base font-extrabold uppercase tracking-wide text-primary-foreground shadow-[0_0_60px_-6px_var(--arch-glow)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-arch-primary/95 disabled:opacity-60 md:h-28 md:text-lg"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none"
                />
                <Lock className="relative z-10 h-5 w-5" aria-hidden />
                <span className="relative z-10">{submitting ? copy.processing : ctaCopy}</span>
                {!submitting && (
                  <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
                )}
              </ButtonPress>
            </div>

            <p className="mt-3 text-center text-xs text-foreground/55">
              {copy.ctaSubcopy(copy.paymentMethods)}
            </p>

            {/* Trust strip */}
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/55">
              <li className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" aria-hidden />{copy.trustStripe}</li>
              <li className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" aria-hidden />{copy.trustSsl}</li>
              <li className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" aria-hidden />{copy.trustGuarantee}</li>
              <li className="inline-flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" aria-hidden />{copy.trustLangs}</li>
            </ul>
          </article>
        </Reveal>

        {/* ─────────── Mini-testimonials rolling ─────────── */}
        {miniTestimonials.length > 0 && (
          <Reveal variant="fade-up" className="mt-12">
            <h3 className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/55">
              {copy.socialTitle}
            </h3>
            <RollingTestimonials items={miniTestimonials} archByline={copy.archByline} starAriaLabel={copy.starAriaLabel} />
          </Reveal>
        )}

        {/* ─────────── Guarantee + FAQ ─────────── */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Reveal variant="fade-up">
            <article className="relative h-full overflow-hidden rounded-[2.5rem] border border-arch-primary/25 bg-black/40 p-6 backdrop-blur-3xl shadow-[0_30px_80px_-30px_var(--arch-glow)]">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-arch-primary/15 text-arch-primary">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-extrabold uppercase tracking-tight md:text-xl">
                    {copy.guaranteeTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    {copy.guaranteeBody}
                  </p>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal variant="fade-up">
            <article className="h-full rounded-[2.5rem] border border-foreground/10 bg-black/40 p-6 backdrop-blur-3xl">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/55">
                {copy.faqTitle}
              </h3>
              <div className="divide-y divide-foreground/10">
                {copy.faq.map((f, i) => (
                  <FAQItem key={i} q={f.q} a={f.a} index={i} />
                ))}
              </div>
            </article>
          </Reveal>
        </div>

        {/* ─────────── Sticky mobile CTA ─────────── */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-black/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/55">{copy.total}</p>
              <p className="font-display text-lg font-extrabold text-arch-primary">{totalFormatted}</p>
            </div>
            <button
              type="button"
              onClick={handleClick}
              disabled={submitting || !leadId}
              aria-label={submitting ? copy.processing : ctaCopy}
              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-arch-primary px-5 py-3.5 font-sans text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-[0_0_30px_-4px_var(--arch-glow)] transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <span
                aria-hidden
                className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none"
              />
              <Lock className="relative z-10 h-4 w-4" aria-hidden />
              <span className="relative z-10">{submitting ? "…" : ctaCopy}</span>
            </button>
          </div>
        </div>

        {/* keyframes for the CTA shake (scoped) */}
        <style>{`
          @keyframes checkout-cta-shake {
            0%, 100% { transform: translateX(0); }
            15% { transform: translateX(-3px); }
            30% { transform: translateX(3px); }
            45% { transform: translateX(-2px); }
            60% { transform: translateX(2px); }
            75% { transform: translateX(-1px); }
          }
        `}</style>
      </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Subcomponents
// ────────────────────────────────────────────────────────────────────────────

function BumpCard({
  active,
  onToggle,
  title,
  desc,
  price,
  plus,
}: {
  active: boolean;
  onToggle: () => void;
  title: string;
  desc: string;
  price: string;
  plus: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`group relative flex h-full w-full flex-col items-start gap-4 rounded-[1.5rem] border p-5 text-start transition-all duration-300 hover:-translate-y-1 ${
        active
          ? "border-arch-primary bg-arch-primary/10 shadow-[0_15px_40px_-15px_var(--arch-glow)]"
          : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-black/60"
      }`}
    >
      <div className="flex w-full items-start gap-4">
        {/* Checkbox */}
        <div className="pt-0.5 shrink-0">
           <div className={`flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-300 ${
             active 
               ? "border-arch-primary bg-arch-primary text-white shadow-[0_0_12px_var(--arch-glow)]" 
               : "border-white/20 bg-black/50 text-transparent group-hover:border-white/40"
           }`}>
             <Check strokeWidth={3} className="h-4 w-4" />
           </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <span className="font-sans text-sm font-bold uppercase tracking-wide text-white leading-snug">
              {title}
            </span>
            <span className="shrink-0 rounded-full bg-arch-primary/15 px-2.5 py-0.5 font-mono text-xs font-bold text-arch-primary whitespace-nowrap">
              +{price}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">{desc}</p>
        </div>
      </div>
      
      {/* Badge / Indicator */}
      <div className="mt-auto pt-2 flex w-full items-center justify-end">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
            active ? "bg-arch-primary/20 text-arch-primary" : "bg-foreground/5 text-foreground/45 group-hover:bg-foreground/10"
          }`}
        >
          {active ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {plus}
        </span>
      </div>
    </button>
  );
}

function CountdownPill({ minutes, label }: { minutes: number; label: string }) {
  const [remaining, setRemaining] = useState<number>(minutes * 60);
  const firedEnd = useRef(false);

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
      if (sec === 0 && !firedEnd.current) {
        firedEnd.current = true;
        track(EVENTS.CHECKOUT_TIMER_END);
      }
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
      className="inline-flex items-center gap-1.5 rounded-full border border-arch-primary/50 bg-arch-primary/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-arch-primary shadow-[0_0_12px_-2px_var(--arch-glow)] badge-pulse"
    >
      <Clock className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
      <span className="font-mono tabular-nums">{mm}:{ss}</span>
    </div>
  );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const faqId = `checkout-faq-${index}`;
  return (
    <div className="py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={faqId}
        className="flex w-full items-center justify-between gap-3 text-start text-sm font-bold text-foreground/90 transition-colors hover:text-foreground"
      >
        <span>{q}</span>
        <Plus
          className={`h-4 w-4 shrink-0 text-arch-primary transition-transform duration-300 ${open ? "rotate-45" : ""}`}
          aria-hidden
        />
      </button>
      <div
        id={faqId}
        role="region"
        aria-hidden={!open}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100 pb-2" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <p className="min-h-0 text-xs leading-relaxed text-foreground/65">{a}</p>
      </div>
    </div>
  );
}

function RollingTestimonials({
  items,
  archByline,
  starAriaLabel,
}: {
  items: Array<{ stars: number; quote: string; name: string; arch: string }>;
  archByline: (arch: string) => string;
  starAriaLabel: string;
}) {
  const [idx, setIdx] = useState(0);
  
  useEffect(() => {
    // Garante que o carrossel gira automaticamente, independente de configurações de SO
    const id = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000); 
    return () => clearInterval(id);
  }, [items.length]);

  const cur = items[idx];
  if (!cur) return null;

  const curPhoto = getPhotoForName(cur.name);

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-arch-primary/25 bg-black/50 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col"
        >
          <div className="mb-3 flex gap-0.5 text-arch-primary" role="img" aria-label={starAriaLabel}>
            {Array.from({ length: cur.stars || 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="text-[15px] font-semibold italic leading-relaxed text-foreground/85 md:text-base">
            &ldquo;{cur.quote}&rdquo;
          </p>
          <div className="mt-5 flex items-center gap-3">
            <img
              src={curPhoto}
              alt={cur.name}
              loading="lazy"
              className="h-10 w-10 shrink-0 rounded-full object-cover object-center shadow-sm ring-1 ring-arch-primary/30"
            />
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/55">
              <span className="text-foreground">{cur.name}</span> <span className="mx-1 opacity-40">·</span> {archByline(cur.arch)}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* dots */}
      <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
        {items.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === idx ? "w-5 bg-arch-primary" : "w-1.5 bg-foreground/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

function formatCentsLike(targetCents: number, mainFormatted: string, mainCents: number): string {
  const ratio = targetCents / mainCents;
  return mainFormatted.replace(/[\d.,]+/, (num) => {
    const sep = num.includes(",") && !num.includes(".") ? "," : ".";
    const cleaned = num.replace(/[^\d]/g, "");
    const numeric = Number(cleaned) / 100;
    const scaled = numeric * ratio;
    return scaled.toFixed(2).replace(".", sep);
  });
}

export default CheckoutStub;
