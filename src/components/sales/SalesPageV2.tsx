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
import { Plus } from "lucide-react";
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
import { StickyOfferBar } from "./v3/StickyOfferBar";
import { ExitIntentModal } from "./v3/ExitIntentModal";
import { SalesTestimonials } from "./v3/SalesTestimonials";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { Atmosphere } from "@/components/atmosphere";

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

// Section badges per language — landing-style pulsing red pills.
// Kept inline (not in translations.ts) to ship visual PR1 without i18n surgery.
type BadgeLang = "pt" | "en" | "pl" | "ro" | "ar";
const SECTION_BADGES: Record<BadgeLang, {
  pain: string; science: string; fourD: string; deliver: string; proof: string; faq: string; decision: string;
}> = {
  pt: { pain: "O PROBLEMA", science: "A CIÊNCIA", fourD: "DIAGNÓSTICO REVELADO", deliver: "O QUE VAIS RECEBER", proof: "DEPOIMENTOS REAIS", faq: "DÚVIDAS FREQUENTES", decision: "A TUA DECISÃO" },
  en: { pain: "THE PROBLEM", science: "THE SCIENCE", fourD: "DIAGNOSIS REVEALED", deliver: "WHAT YOU GET", proof: "REAL TESTIMONIALS", faq: "FREQUENT QUESTIONS", decision: "YOUR DECISION" },
  pl: { pain: "PROBLEM", science: "NAUKA", fourD: "UJAWNIONA DIAGNOZA", deliver: "CO OTRZYMASZ", proof: "PRAWDZIWE OPINIE", faq: "CZĘSTE PYTANIA", decision: "TWOJA DECYZJA" },
  ro: { pain: "PROBLEMA", science: "ȘTIINȚA", fourD: "DIAGNOSTIC DEZVĂLUIT", deliver: "CE PRIMEȘTI", proof: "MĂRTURII REALE", faq: "ÎNTREBĂRI FRECVENTE", decision: "DECIZIA TA" },
  ar: { pain: "المشكلة", science: "العلم", fourD: "التشخيص الكامل", deliver: "ما ستحصل عليه", proof: "شهادات حقيقية", faq: "أسئلة شائعة", decision: "قرارك" },
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

  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);
  const maxScrollRef = useRef(0);

  // VSL_SCROLL_DEPTH: track max scroll % and fire on unmount
  useEffect(() => {
    const handleScroll = () => {
      const depth = Math.round((window.scrollY / document.body.scrollHeight) * 100);
      if (depth > maxScrollRef.current) maxScrollRef.current = depth;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (maxScrollRef.current > 0) {
        track(EVENTS.VSL_SCROLL_DEPTH, { max_depth: maxScrollRef.current });
      }
    };
  }, []);

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
  const badges = SECTION_BADGES[(lang as BadgeLang)] ?? SECTION_BADGES.en;

  // Tela 12 não exibe preço — toda a persuasão monetária migra para a Tela 13.
  void price;
  void bump1; void bump2;

  return (
    <div ref={rootRef} data-arch={archetype} className="relative min-h-screen text-white/90 selection:bg-[var(--arch-primary)] selection:text-white">
      {/* Subtle archetype-tinted atmosphere pinned to the whole page */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-[1]">
        <Atmosphere fog="subtle" symbols="sparse" scan="off" pinned>
          <span />
        </Atmosphere>
      </div>
      {/* ─── Layout split: copy column + sculpture column ───── */}
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 lg:px-12 py-10">
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
            badge={badges.pain}
            title={tpl(v2.b2.title)}
          >
            <p className="sales-dropcap text-white/90">{tpl(v2.b2.body)}</p>
            <ul className="mt-8 space-y-1">
              {v2.b2.bullets.map((b, i) => (
                <PainScar key={i}>{tpl(b)}</PainScar>
              ))}
            </ul>
            <p className="mt-8 text-lg font-medium text-white/85">{tpl(v2.b2.conclusion)}</p>
          </SceneFrame>

          {/* II — Scientific Breakthrough */}
          <SceneFrame sceneId="science" index={2} badge={badges.science} title={v2.b3.title}>
            <p className="text-white/90 leading-[1.75] text-[17px]">{v2.b3.body}</p>
            <blockquote
              className="mt-8 border-s-2 ps-5 text-sm text-white/70"
              style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 50%, transparent)" }}
            >
              {v2.b3.references}
            </blockquote>
            <p
              className="mt-6 inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em]"
              style={{
                borderColor: "color-mix(in oklab, var(--arch-primary) 40%, transparent)",
                color: "var(--arch-primary)",
                background: "color-mix(in oklab, var(--arch-primary) 10%, transparent)",
              }}
            >
              {v2.b3.proofSeal}
            </p>
            <p className="mt-8 text-[17px] leading-relaxed text-white">
              <strong style={{ color: "var(--arch-primary)" }}>{v2.b3.pivot}</strong>{" "}
              {tpl(v2.b3.solution)}
            </p>
          </SceneFrame>

          {/* III — 4D Diagnosis */}
          <SceneFrame sceneId="4d" index={3} badge={badges.fourD} title={tpl(v2.b4.title)}>
            <p className="mb-8 text-white/70 text-base font-medium">{tpl(v2.b4.subtitle)}</p>
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

          {/* B5 — "O que vais receber" (sem preço — preço fica para Tela 13) */}
          <SceneFrame sceneId="deliver" badge={badges.deliver} title={tpl(v2.b5.title)}>
            <p className="mb-8 text-white/75 text-base font-medium">{tpl(v2.b5.subtitle)}</p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {v2.b5.deliverables.map((feat, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-3 rounded-[2.5rem] border border-white/10 bg-black/40 p-5 sm:p-6 transition-all duration-500 hover:border-arch-primary/40 hover:bg-black/60 md:hover:-translate-y-2 shadow-2xl md:backdrop-blur-3xl overflow-hidden"
                >
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-arch-primary group-hover:scale-110 transition-transform duration-300"
                  />
                  <div>
                    <p className="font-display font-extrabold uppercase tracking-tight text-white">
                      {feat.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/70 group-hover:text-white/85 transition-colors">
                      {tpl(feat.description)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-center text-xs text-white/60 font-semibold">
              {v2.b5.note}
            </p>
          </SceneFrame>

          {/* IV — Social Proof */}
          <SalesTestimonials
            counter={v2.b6.counter}
            rating={v2.b6.rating}
            testimonials={v2.b6.testimonials.slice(0, 6)}
            lang={lang}
          />

          {/* B7 — Bridge card (sem preço; envia para Tela 13 de decisão) */}
          <SceneFrame sceneId="bridge" badge={badges.decision} title={tpl(v2.b7.eyebrow)}>
            <div
              className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-9 text-center bg-black/55 backdrop-blur-2xl"
              style={{
                border: "1px solid color-mix(in oklab, var(--arch-primary) 38%, transparent)",
                boxShadow:
                  "0 50px 120px -40px color-mix(in oklab, var(--arch-primary) 55%, transparent), inset 0 1px 0 color-mix(in oklab, var(--arch-primary) 25%, transparent)",
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: "var(--arch-primary)" }}>
                {tpl(v2.b7.eyebrow)}
              </p>
              <h3 className="mt-3 font-display text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
                {tpl(v2.b4.title)}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">{tpl(v2.b4.subtitle)}</p>
              <ButtonPress>
                <button
                  type="button"
                  onClick={() => advance("b7")}
                  className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full px-8 py-5 text-base sm:text-lg font-extrabold uppercase tracking-wide text-white transition-all hover:brightness-110"
                  style={{ background: "#CC0000", boxShadow: "0 30px 80px -20px rgba(204,0,0,0.65)" }}
                >
                  {tpl(v2.b7.cta)}
                  <ArrowRight size={20} strokeWidth={2.5} />
                </button>
              </ButtonPress>
              <p className="mt-4 text-xs text-white/55">{v2.b7.trust}</p>
            </div>
          </SceneFrame>

          {/* V — FAQ */}
          <SceneFrame sceneId="faq" index={5} badge={badges.faq} title={v2.b8.title}>
            <div className="mx-auto max-w-3xl">
              {v2.b8.items.map((it, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className={`border-b border-white/[0.07] ${i === 0 ? "border-t" : ""} transition-colors hover:bg-white/[0.01]`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors group"
                    >
                      <span
                        className={`font-display text-lg font-extrabold uppercase tracking-tight transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${
                          isOpen ? "text-arch-primary" : "text-white"
                        } group-hover:text-arch-primary`}
                      >
                        {it.q}
                      </span>
                      <Plus
                        aria-hidden
                        className={`h-5 w-5 shrink-0 text-arch-primary transition-transform duration-300 ${
                          isOpen ? "rotate-45" : "rotate-0"
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-hidden={!isOpen}
                      className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-400 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <p className="min-h-0 text-[15px] font-medium leading-relaxed text-white/70 md:text-base drop-shadow-sm">
                        {tpl(it.a)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SceneFrame>

          {/* B9 — Final */}
          <section ref={finalRef} className="relative py-24 text-center">
            <Reveal>
              <h2
                className="font-display font-extrabold leading-[1.02] text-white drop-shadow-md"
                style={{ fontSize: "clamp(2.25rem, 5.5vw, 4rem)" }}
              >
                {tpl(v2.b9.title)}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-white/90 text-lg font-medium">
                {tpl(v2.b9.subtitle)}
              </p>
              <p className="mt-3 text-sm text-white/70 tracking-wide">{tpl(v2.b9.tagline)}</p>
              <ButtonPress
                type="button"
                onClick={() => advance("b9")}
                className="group mt-10 inline-flex min-h-20 sm:min-h-28 max-w-[min(92vw,34rem)] items-center justify-center gap-3 rounded-full bg-white px-6 py-4 sm:px-12 sm:py-5 font-sans text-sm sm:text-lg font-extrabold uppercase tracking-wide text-black text-center leading-tight transition-all hover:scale-[1.02] active:scale-[0.98] sales-final-pulse overflow-hidden relative"
                style={{ boxShadow: "0 30px 80px -20px rgba(204,0,0,0.8)" }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "var(--arch-primary)", borderRadius: "inherit" }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none"
                />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  {v2.b9.cta}
                </span>
                <ArrowRight size={20} strokeWidth={2.5} className="relative z-10 transition-colors duration-300 group-hover:text-white" />
              </ButtonPress>
              <p className="mt-4 text-xs text-white/60 font-semibold">{v2.b9.trust}</p>
            </Reveal>
          </section>

          {onBack && (
            <div className="pb-16 text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-white/50 underline-offset-4 hover:underline hover:text-white"
              >
                ← {t.common.back}
              </button>
            </div>
          )}
        </div>
      </div>

      <StickyOfferBar
        show={showSticky}
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
          track(EVENTS.EXIT_INTENT_RECOVERED, { stage: "vsl" });
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