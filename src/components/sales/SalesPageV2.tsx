/**
 * SalesPageV2 v3 — "The Awakening"
 *
 * Editorial premium sales page: archetype palette continuity from Reveal,
 * scroll-driven MarbleBust sculpture, inline checkout monolith, brand-red
 * CTA reserved for the single purchase moment.
 *
 * Same export + props as previous version. Inline OB1/OB2 inside the
 * OfferMonolith; `onContinue({ bumps })` still gateway to hosted Stripe.
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Archetype } from "@/lib/quiz/scoring";
import type { AreaScores } from "@/lib/funnel/area-scores";
import { getPricing } from "@/lib/funnel/pricing-stub";
import { Reveal } from "@/components/interaction";
import { EVENTS, track } from "@/lib/analytics";
import { useExitIntent } from "@/hooks/use-exit-intent";
import { fillTpl } from "@/lib/sales/template";
import { AnimatedCounter } from "@/components/sales/AnimatedCounter";

import { HeroScene } from "./v3/HeroScene";
import { SceneFrame } from "./v3/SceneFrame";
import { PainScar } from "./v3/PainScar";
import { AreaPoster, type Area } from "./v3/AreaPoster";
import { OfferMonolith } from "./v3/OfferMonolith";
import { ScrollSculpture } from "./v3/ScrollSculpture";
import { StickyOfferBar } from "./v3/StickyOfferBar";
import { ExitIntentModal } from "./v3/ExitIntentModal";
import { parseMoney, formatMoneyLike } from "@/lib/sales/sigils";

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

const AREA_ORDER: Area[] = ["money", "career", "love", "personal"];

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

  const rootRef = useRef<HTMLDivElement | null>(null);
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

  const v2 = t.salesV2;
  const tpl = (s: string) => fillTpl(s, tplVars);

  // Sticky logic + dynamic total (used by sticky bar)
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const obsHero = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { threshold: 0.1 });
    const obsFinal = new IntersectionObserver(([e]) => { if (e.isIntersecting) setShowSticky(false); }, { threshold: 0.1 });
    if (heroRef.current) obsHero.observe(heroRef.current);
    if (finalRef.current) obsFinal.observe(finalRef.current);
    return () => { obsHero.disconnect(); obsFinal.disconnect(); };
  }, []);

  const totalNumeric =
    parseMoney(price.main) +
    (bump1 ? parseMoney(price.bump1) : 0) +
    (bump2 ? parseMoney(price.bump2) : 0);
  const totalLabel = formatMoneyLike(price.main, totalNumeric);

  return (
    <div ref={rootRef} data-arch={archetype} className="relative bg-background text-foreground">
      {/* ─── Layout split: copy column + sculpture column ───── */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-0 px-5 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:px-12">
        {/* COPY COLUMN ─────────────────────────────────────── */}
        <div className="relative z-10">
          {/* B1 — Hero */}
          <div ref={heroRef}>
            <HeroScene
              eyebrow={v2.b1.eyebrow}
              title={tpl(v2.b1.h1)}
              promise={tpl(v2.b1.promise)}
              cta={v2.b1.cta}
              timer={v2.b1.timer}
              onCta={() => advance("b1")}
              proofs={[
                { value: "+12.000", label: v2.b6.counter.replace(/[+\d.,\s]+/g, " ").trim() || "Diagnoses" },
                { value: "4.9★", label: v2.b6.rating.replace(/[★⭐\d.,/\s]+/g, " ").trim() || "Rating" },
                { value: "60s", label: "PDF" },
                { value: "5", label: "Languages" },
              ]}
            />
          </div>

          {/* I — Pain Mirror */}
          <SceneFrame
            sceneId="pain"
            index={1}
            eyebrow={v2.b3.title.split(" ").slice(0, 2).join(" ")}
            title={tpl(v2.b2.title)}
          >
            <p className="sales-dropcap text-foreground/85">{tpl(v2.b2.body)}</p>
            <ul className="mt-8 space-y-1">
              {v2.b2.bullets.map((b, i) => (
                <PainScar key={i}>{tpl(b)}</PainScar>
              ))}
            </ul>
            <p className="mt-8 text-lg italic text-foreground/70">{tpl(v2.b2.conclusion)}</p>
          </SceneFrame>

          {/* II — Scientific Breakthrough */}
          <SceneFrame sceneId="science" index={2} title={v2.b3.title}>
            <p className="text-foreground/85 leading-[1.75] text-[17px]">{v2.b3.body}</p>
            <blockquote
              className="mt-8 border-s-2 ps-5 text-sm italic text-foreground/55"
              style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 50%, transparent)" }}
            >
              {v2.b3.references}
            </blockquote>
            <p className="mt-8 text-[17px] leading-relaxed text-foreground/90">
              <strong style={{ color: "var(--arch-primary)" }}>{v2.b3.pivot}</strong>{" "}
              {tpl(v2.b3.solution)}
            </p>
          </SceneFrame>

          {/* III — 4D Diagnosis */}
          <SceneFrame sceneId="4d" index={3} title={tpl(v2.b4.title)}>
            <p className="mb-8 text-foreground/70 text-base">{tpl(v2.b4.subtitle)}</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {AREA_ORDER.map((area, i) => {
                const feat = v2.b4.features[i];
                return (
                  <AreaPoster
                    key={area}
                    area={area}
                    title={feat?.title ?? area}
                    description={tpl(feat?.description ?? "")}
                    score={areaScores[area]}
                  />
                );
              })}
            </div>
          </SceneFrame>

          {/* Value Anchor (B5) */}
          <SceneFrame sceneId="anchor">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-foreground/55">
                {v2.b5.eyebrow}
              </p>
              <div className="mt-6 space-y-1 text-sm">
                <p className="text-foreground/35 line-through">{v2.b5.was}</p>
                <p className="text-foreground/45 line-through">{v2.b5.then}</p>
                <p className="mt-3 text-foreground/70">{v2.b5.now}</p>
                <p
                  className="pt-4 font-display font-extrabold tabular-nums"
                  style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", color: "var(--arch-primary)" }}
                >
                  {price.main}
                </p>
              </div>
              <p className="mt-4 text-xs text-foreground/50">{v2.b5.note}</p>
            </div>
          </SceneFrame>

          {/* IV — Social Proof */}
          <SceneFrame
            sceneId="proof"
            index={4}
            title={
              <span>
                <AnimatedCounter end={12000} prefix="+" />{" "}
                {v2.b6.counter.replace(/\+\s?12[.,]?000\s?/, "").trim()}
              </span>
            }
          >
            <p className="mb-8 text-sm uppercase tracking-widest text-foreground/55">
              {v2.b6.rating}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {v2.b6.testimonials.map((tst, i) => (
                <figure
                  key={i}
                  className="rounded-2xl p-5 sales-card-arch transition-transform hover:-translate-y-1"
                >
                  <div
                    className="mb-3 inline-flex h-1 w-10 rounded-full"
                    style={{ background: "var(--arch-primary)" }}
                  />
                  <blockquote className="text-[15px] leading-relaxed text-foreground/90">
                    &ldquo;{tpl(tst.quote)}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-xs text-foreground/55">
                    <span className="font-semibold text-foreground/75">{tst.author}</span>
                    {" · "}
                    {tst.country} · {tst.arch}
                  </figcaption>
                </figure>
              ))}
            </div>
          </SceneFrame>

          {/* ★ OFFER MONOLITH (B7 + OB1 + OB2 embedded) */}
          <SceneFrame sceneId="offer">
            <OfferMonolith
              eyebrow={tpl(v2.b7.eyebrow)}
              productTitle={tpl(v2.b4.title)}
              productSubtitle={tpl(v2.b4.subtitle)}
              price={price}
              bumps={{
                bump1: {
                  active: bump1,
                  title: v2.ob1.title,
                  description: tpl(v2.ob1.desc),
                  badge: v2.ob1.badge,
                },
                bump2: {
                  active: bump2,
                  title: v2.ob2.title,
                  description: tpl(v2.ob2.desc),
                  badge: v2.ob2.eyebrow,
                },
              }}
              onToggle={toggleBump}
              cta={tpl(v2.b7.cta)}
              trust={v2.b7.trust}
              onCta={() => advance("b7")}
            />
          </SceneFrame>

          {/* V — FAQ */}
          <SceneFrame sceneId="faq" index={5} title={v2.b8.title}>
            <ul
              className="divide-y rounded-2xl border"
              style={{
                borderColor: "color-mix(in oklab, var(--arch-primary) 22%, transparent)",
                background: "color-mix(in oklab, var(--arch-primary) 4%, rgba(0,0,0,0.3))",
              }}
            >
              {v2.b8.items.map((it, i) => (
                <li key={i} style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 18%, transparent)" }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="flex w-full items-center justify-between gap-4 p-5 text-start"
                  >
                    <span className="font-medium text-foreground">{it.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                      style={{ color: "var(--arch-primary)" }}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-[15px] leading-relaxed text-foreground/75">
                      {tpl(it.a)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </SceneFrame>

          {/* B9 — Final */}
          <section ref={finalRef} className="relative py-24 text-center">
            <Reveal>
              <h2
                className="font-display font-extrabold leading-[1.02]"
                style={{ fontSize: "clamp(2.25rem, 5.5vw, 4rem)" }}
              >
                {tpl(v2.b9.title)}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-foreground/80 text-lg">
                {tpl(v2.b9.subtitle)}
              </p>
              <p className="mt-3 text-sm text-foreground/60">{tpl(v2.b9.tagline)}</p>
              <button
                type="button"
                onClick={() => advance("b9")}
                className="mt-10 inline-flex items-center gap-3 rounded-full px-10 py-5 text-lg font-bold uppercase tracking-wide text-white transition-all hover:brightness-110 sales-final-pulse"
                style={{
                  background: "#CC0000",
                  boxShadow: "0 30px 80px -20px rgba(204,0,0,0.6)",
                }}
              >
                {v2.b9.cta}
              </button>
              <p className="mt-4 text-xs text-foreground/55">{v2.b9.trust}</p>
            </Reveal>
          </section>

          {onBack && (
            <div className="pb-16 text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-foreground/45 underline-offset-4 hover:underline"
              >
                ← {t.common.back}
              </button>
            </div>
          )}
        </div>

        {/* SCULPTURE COLUMN — desktop sticky / mobile fixed ambient */}
        <aside className="pointer-events-none relative hidden lg:block">
          <div className="sticky top-0 h-screen w-full">
            <ScrollSculpture archetype={archetype} targetRef={rootRef} />
          </div>
        </aside>
      </div>

      {/* Mobile/tablet sculpture — fixed ambient behind copy */}
      <div
        className="pointer-events-none fixed inset-0 -z-0 lg:hidden"
        style={{ opacity: 0.32, mixBlendMode: "screen" }}
      >
        <ScrollSculpture archetype={archetype} targetRef={rootRef} />
      </div>

      <StickyOfferBar
        show={showSticky}
        price={totalLabel}
        cta={v2.b1.cta}
        onCta={() => advance("sticky")}
      />

      <ExitIntentModal
        open={exit.triggered}
        title={tpl(v2.exit.title)}
        body={tpl(v2.exit.body)}
        cta={tpl(v2.exit.cta)}
        decline={v2.exit.decline}
        onAccept={() => {
          track(EVENTS.EXIT_INTENT_CTA, { stage: "vsl" });
          exit.markDismissed();
          advance("exit_intent");
        }}
        onDismiss={() => {
          track(EVENTS.EXIT_INTENT_DISMISS, { stage: "vsl" });
          exit.markDismissed();
        }}
      />
    </div>
  );
}