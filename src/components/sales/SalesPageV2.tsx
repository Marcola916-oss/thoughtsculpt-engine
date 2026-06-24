/**
 * Fase 4 — SalesPageV2 (substitui VSL.tsx)
 *
 * Esqueleto da página de vendas em 11 blocos fixos:
 *   B1 Emotional Anchor → B2 Pain Mirror → B3 Scientific Breakthrough →
 *   B4 Produto 4D → B5 Value Anchor → B6 Social Proof → OB1 →
 *   B7 Preço + CTA → B8 FAQ → B9 Final CTA → OB2
 *
 * Commit 1: skeleton + props + state + sticky observer + exit-intent hook +
 * analytics events. Blocos contêm placeholders + reusam copy `t.sales.*`
 * existente onde já há texto pronto. Commits 2-5 vão preencher cada bloco
 * com copy Bible V2 completa em 5 idiomas, plus StickyVSLBar e
 * ExitIntentModal dedicados.
 */

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Star, X as XIcon, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Archetype } from "@/lib/quiz/scoring";
import type { AreaScores } from "@/lib/funnel/area-scores";
import { getPricing } from "@/lib/funnel/pricing-stub";
import { Atmosphere } from "@/components/atmosphere";
import { Reveal } from "@/components/interaction";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { MarbleBust } from "@/components/identity/MarbleBust";
import { EVENTS, track } from "@/lib/analytics";
import { useExitIntent } from "@/hooks/use-exit-intent";
import { fillTpl } from "@/lib/sales/template";

type Bumps = ("bump1" | "bump2")[];

export type SalesPageV2Props = {
  archetype: Archetype;
  displayName: string;
  areaScores: AreaScores;
  leadId: string | null;
  onContinue: (payload: { bumps: Bumps }) => void;
  onBack?: () => void;
};

const ARCH_PRIMARY: Record<Archetype, { pt: string; en: string; pl: string; ro: string; ar: string }> = {
  AO: { pt: "Acumulador Obsessivo", en: "Obsessive Saver", pl: "Skrupulatny Oszczędny", ro: "Acumulator Obsesiv", ar: "المدّخر القهري" },
  SS: { pt: "Buscador de Status",   en: "Status Seeker",   pl: "Łowca Statusu",         ro: "Căutător de Statut", ar: "الباحث عن المكانة" },
  EA: { pt: "Evitador Ansioso",     en: "Anxious Avoider", pl: "Lękowy Unikający",      ro: "Evitant Anxios",     ar: "المتجنّب القلق" },
  HI: { pt: "Hedonista Impulsivo",  en: "Impulsive Hedonist", pl: "Impulsywny Hedonista", ro: "Hedonist Impulsiv", ar: "الهيدوني الاندفاعي" },
};

// Arquétipo secundário aproximado (oposto/complementar) — usado em copy "X com traço de Y".
const ARCH_SECONDARY: Record<Archetype, Archetype> = {
  AO: "EA",
  SS: "HI",
  EA: "AO",
  HI: "SS",
};

export default function SalesPageV2({
  archetype,
  displayName,
  areaScores,
  leadId,
  onContinue,
  onBack,
}: SalesPageV2Props) {
  const { lang, t } = useI18n();
  const price = getPricing(lang);

  const primaryLabel = ARCH_PRIMARY[archetype][lang as "pt" | "en" | "pl" | "ro" | "ar"] ?? ARCH_PRIMARY[archetype].en;
  const secondaryLabel = ARCH_PRIMARY[ARCH_SECONDARY[archetype]][lang as "pt" | "en" | "pl" | "ro" | "ar"] ?? ARCH_PRIMARY[ARCH_SECONDARY[archetype]].en;
  const tplVars = { name: displayName || "—", primary: primaryLabel, secondary: secondaryLabel };

  const [bump1, setBump1] = useState(false);
  const [bump2, setBump2] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);

  // VSL_VIEW on mount
  useEffect(() => {
    track(EVENTS.VSL_VIEW, { arch: archetype, has_lead: Boolean(leadId), source: "reveal" });
  }, [archetype, leadId]);

  // Sticky CTA: aparece quando hero sai de viewport e some quando final entra.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const obsHero = new IntersectionObserver(
      ([e]) => setShowSticky(!e.isIntersecting),
      { threshold: 0.1 },
    );
    const obsFinal = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setShowSticky(false); },
      { threshold: 0.1 },
    );
    if (heroRef.current) obsHero.observe(heroRef.current);
    if (finalRef.current) obsFinal.observe(finalRef.current);
    return () => { obsHero.disconnect(); obsFinal.disconnect(); };
  }, []);

  // Exit intent
  const exit = useExitIntent({
    enabled: true,
    onTrigger: () => track(EVENTS.EXIT_INTENT_SHOWN, { stage: "vsl", arch: archetype }),
  });

  const toggleBump = (which: "bump1" | "bump2") => {
    if (which === "bump1") {
      setBump1((v) => { track(EVENTS.VSL_BUMP_TOGGLED, { bump: "bump1", state: !v }); return !v; });
    } else {
      setBump2((v) => { track(EVENTS.VSL_BUMP_TOGGLED, { bump: "bump2", state: !v }); return !v; });
    }
  };

  const advance = (source: string) => {
    const bumps: Bumps = [];
    if (bump1) bumps.push("bump1");
    if (bump2) bumps.push("bump2");
    track(EVENTS.VSL_CTA_CLICK, { arch: archetype, bumps, source });
    onContinue({ bumps });
  };

  // Reuse existing dict where pronto. Os textos longos serão preenchidos
  // nos commits 2-3 via novas chaves t.sales.*.
  const dict = t.sales;
  const v2 = t.salesV2;
  const tpl = (s: string) => fillTpl(s, tplVars);

  return (
    <Atmosphere fog="dramatic" symbols="sparse" scan="subtle">
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 pb-32 pt-8 text-foreground">

        {/* ─── B1 Emotional Anchor ────────────────────────────── */}
        <section ref={heroRef} className="relative pt-8 pb-16 text-center">
          <div className="pointer-events-none absolute inset-x-0 -top-6 mx-auto h-40 w-40 opacity-30">
            <MarbleBust variant="mini" />
          </div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/60">{v2.b1.eyebrow}</p>
            <h1 className="mt-4 text-3xl sm:text-5xl font-display font-extrabold leading-tight">
              {tpl(v2.b1.h1)}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-foreground/80">
              {tpl(v2.b1.promise)}
            </p>
            <div className="mt-8">
              <ButtonPress>
                <button
                  type="button"
                  onClick={() => advance("b1")}
                  className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[hsl(var(--accent))]/30 transition-transform hover:-translate-y-0.5"
                >
                  {v2.b1.cta} <ArrowRight size={18} />
                </button>
              </ButtonPress>
              <p className="mt-3 text-xs text-foreground/60">{v2.b1.timer}</p>
            </div>
          </Reveal>
        </section>

        {/* ─── B2 Pain Mirror ─────────────────────────────────── */}
        <Section title={tpl(v2.b2.title)}>
          <p className="mb-6 text-foreground/80">{tpl(v2.b2.body)}</p>
          <ul className="space-y-3">
            {v2.b2.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <XIcon size={18} className="mt-1 shrink-0 text-destructive" aria-hidden />
                <span className="text-foreground/85">{tpl(b)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 italic text-foreground/70">{tpl(v2.b2.conclusion)}</p>
        </Section>

        {/* ─── B3 Scientific Breakthrough ─────────────────────── */}
        <Section title={v2.b3.title}>
          <p className="mb-4 text-foreground/80">{v2.b3.body}</p>
          <p className="mb-4 text-sm text-foreground/60">{v2.b3.references}</p>
          <p className="text-foreground/85">
            <strong>{v2.b3.pivot}</strong> {tpl(v2.b3.solution)}
          </p>
        </Section>

        {/* ─── B4 Produto 4D ──────────────────────────────────── */}
        <Section title={tpl(v2.b4.title)}>
          <p className="mb-5 text-sm text-foreground/70">{tpl(v2.b4.subtitle)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["money", "career", "love", "personal"] as const).map((area, i) => {
              const feat = v2.b4.features[i];
              return (
                <div key={area} className="rounded-2xl border border-border bg-card/60 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{feat?.title ?? area}</h3>
                    <span className="rounded-full bg-[hsl(var(--accent))]/15 px-2 py-0.5 text-xs font-bold text-[hsl(var(--accent))]">
                      {areaScores[area]}/100
                    </span>
                  </div>
                  <p className="text-sm text-foreground/75">{tpl(feat?.description ?? "")}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ─── B5 Value Anchor ────────────────────────────────── */}
        <Section>
          <div className="rounded-3xl border border-border bg-card/60 p-6 text-center">
            <p className="text-sm uppercase tracking-widest text-foreground/60">{v2.b5.eyebrow}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-foreground/45 line-through">{v2.b5.was}</p>
              <p className="text-foreground/55 line-through">{v2.b5.then}</p>
              <p className="mt-2 text-foreground/70">{v2.b5.now}</p>
              <p className="pt-2 text-4xl font-extrabold text-[hsl(var(--accent))]">{price.main}</p>
            </div>
            <p className="mt-4 text-xs text-foreground/55">{v2.b5.note}</p>
          </div>
        </Section>

        {/* ─── B6 Social Proof ────────────────────────────────── */}
        <Section title={v2.b6.counter}>
          <p className="mb-5 text-sm text-foreground/60">{v2.b6.rating}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {v2.b6.testimonials.map((tst, i) => (
              <figure key={i} className="rounded-2xl border border-border bg-card/60 p-4">
                <div className="mb-2 flex" role="img" aria-label="5 stars">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-sm text-foreground/85">&ldquo;{tpl(tst.quote)}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs text-foreground/60">
                  {tst.author} · {tst.country} · {tst.arch}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* ─── OB1 — Guia de Relações ─────────────────────────── */}
        <BumpCard
          checked={bump1}
          onToggle={() => toggleBump("bump1")}
          title={v2.ob1.title}
          desc={tpl(v2.ob1.desc)}
          price={`+${price.bump1}`}
          badge={v2.ob1.badge}
          ctaLabel={v2.ob1.cta}
        />

        {/* ─── B7 Preço + CTA ─────────────────────────────────── */}
        <Section>
          <div className="rounded-3xl border-2 border-[hsl(var(--accent))]/40 bg-card/80 p-6 sm:p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-foreground/55">{tpl(v2.b7.eyebrow)}</p>
            <p className="mt-3 text-sm text-foreground/55 line-through">{v2.b7.was}</p>
            <p className="text-sm text-foreground/55 line-through">{v2.b7.then}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-foreground/65">{v2.b7.price}</p>
            <p className="mt-2 text-5xl sm:text-6xl font-extrabold text-[hsl(var(--accent))]">
              {price.main}
            </p>
            <ButtonPress>
              <button
                type="button"
                onClick={() => advance("b7")}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-8 py-4 text-lg font-semibold text-white sm:w-auto"
              >
                {tpl(v2.b7.cta)} <ArrowRight size={18} />
              </button>
            </ButtonPress>
            <p className="mt-4 text-xs text-foreground/60">{v2.b7.trust}</p>
          </div>
        </Section>

        {/* ─── B8 FAQ ─────────────────────────────────────────── */}
        <Section title="FAQ">
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card/40">
            {(dict.faq ?? []).slice(0, 4).map((it, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="flex w-full items-center justify-between gap-4 p-4 text-start"
                >
                  <span className="font-medium">{it.q}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-foreground/75">{it.a}</div>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {/* ─── B9 Final CTA ───────────────────────────────────── */}
        <section ref={finalRef} className="py-12 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold">
              {dict.ctaFinal?.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground/80">
              {dict.ctaFinal?.subtitle}
            </p>
            <p className="mt-3 text-sm text-foreground/70">
              {fillTpl("[NOME], você é [PRIMARY] com traço de [SECONDARY].", tplVars)}
            </p>
            <ButtonPress>
              <button
                type="button"
                onClick={() => advance("b9")}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-10 py-5 text-lg font-semibold text-white"
              >
                {dict.ctaFinal?.cta ?? dict.cta} <ArrowRight size={20} />
              </button>
            </ButtonPress>
            <p className="mt-3 text-xs text-foreground/60">{dict.ctaFinal?.trust}</p>
          </Reveal>
        </section>

        {/* ─── OB2 — Protocolo 30 dias ────────────────────────── */}
        <Section>
          <div className="rounded-3xl border border-border bg-card/60 p-6">
            <p className="text-xs uppercase tracking-widest text-foreground/60">
              Antes de avançar…
            </p>
            <h3 className="mt-2 text-xl font-semibold">Protocolo de Reset 30 dias</h3>
            <p className="mt-2 text-sm text-foreground/75">
              Plano diário com 30 micro-ações para sair do padrão do teu arquétipo.
            </p>
            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={bump2}
                onChange={() => toggleBump("bump2")}
                className="h-5 w-5 accent-[hsl(var(--accent))]"
              />
              <span className="text-sm">
                Sim, quero adicionar <strong>{price.bump2}</strong>
              </span>
            </label>
            <button
              type="button"
              onClick={() => { if (bump2) toggleBump("bump2"); }}
              className="mt-3 text-xs text-foreground/50 underline-offset-2 hover:underline"
            >
              Não, prefiro descobrir sozinho
            </button>
          </div>
        </Section>

        {onBack && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-foreground/50 underline-offset-2 hover:underline"
            >
              ← {t.common.back}
            </button>
          </div>
        )}
      </div>

      {/* Sticky CTA bar */}
      {showSticky && (
        <div
          role="region"
          aria-label="Sticky checkout"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md animate-fade-in"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-foreground/60 line-through me-2">$47</span>
              <strong className="text-[hsl(var(--accent))]">{price.main}</strong>
            </div>
            <ButtonPress>
              <button
                type="button"
                onClick={() => advance("sticky")}
                className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-white"
              >
                {dict.cta} <ArrowRight size={16} />
              </button>
            </ButtonPress>
          </div>
        </div>
      )}

      {/* Exit intent modal (skeleton — visual completo no Commit 4) */}
      {exit.triggered && (
        <div
          role="dialog"
          aria-modal="true"
          aria-live="assertive"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 animate-fade-in"
          onClick={() => {
            track(EVENTS.EXIT_INTENT_DISMISS, { stage: "vsl" });
            exit.markDismissed();
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-background p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-display font-extrabold">
              {fillTpl("[NOME], espera.", tplVars)}
            </h2>
            <p className="mt-3 text-sm text-foreground/75">
              {fillTpl("Tu já és [PRIMARY]. Sair agora apaga o teu diagnóstico.", tplVars)}
            </p>
            <div className="mt-6 space-y-3">
              <ButtonPress>
                <button
                  type="button"
                  onClick={() => {
                    track(EVENTS.EXIT_INTENT_CTA, { stage: "vsl" });
                    exit.markDismissed();
                    advance("exit_intent");
                  }}
                  className="w-full rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-semibold text-white"
                >
                  Quero entender meu padrão →
                </button>
              </ButtonPress>
              <button
                type="button"
                onClick={() => {
                  track(EVENTS.EXIT_INTENT_DISMISS, { stage: "vsl" });
                  exit.markDismissed();
                }}
                className="text-xs text-foreground/50 underline-offset-2 hover:underline"
              >
                Prefiro sair sem descobrir
              </button>
            </div>
          </div>
        </div>
      )}
    </Atmosphere>
  );
}

/* ─── Subcomponents ─────────────────────────────────────── */

function Section(props: { title?: string; children: React.ReactNode }) {
  return (
    <section className="py-10">
      <Reveal>
        {props.title && (
          <h2 className="mb-5 text-2xl sm:text-3xl font-display font-bold">{props.title}</h2>
        )}
        {props.children}
      </Reveal>
    </section>
  );
}

function BumpCard(props: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  desc: string;
  price: string;
  badge?: string;
  ctaLabel?: string;
}) {
  return (
    <Section>
      <div className="relative rounded-3xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
        {props.badge && (
          <span className="absolute -top-3 end-4 rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {props.badge}
          </span>
        )}
        <label className="flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            checked={props.checked}
            onChange={props.onToggle}
            className="mt-1 h-5 w-5 accent-[hsl(var(--accent))]"
          />
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-semibold">{props.title}</h3>
              <span className="font-bold text-[hsl(var(--accent))]">{props.price}</span>
            </div>
            <p className="mt-1 text-sm text-foreground/70">{props.desc}</p>
            {props.checked && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-500">
                <Check size={14} /> {props.ctaLabel ?? "Added"}
              </p>
            )}
          </div>
        </label>
      </div>
    </Section>
  );
}