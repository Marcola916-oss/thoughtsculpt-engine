import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Archetype } from "@/lib/quiz/scoring";
import type { AreaScores } from "@/lib/funnel/area-scores";
import { EVENTS, track } from "@/lib/analytics";
import { useExitIntent } from "@/hooks/use-exit-intent";
import { fillTpl } from "@/lib/sales/template";
import { AnimatedCounter } from "@/components/sales/AnimatedCounter";
import { ButtonPress } from "@/components/interaction/ButtonPress";

import { HeroScene } from "./v3/HeroScene";
import { SceneFrame } from "./v3/SceneFrame";
import { PainScar } from "./v3/PainScar";
import { AreaPoster, type Area } from "./v3/AreaPoster";
import { ScrollAnimationSequence } from "./v3/ScrollAnimationSequence";
import { ExitIntentModal } from "./v3/ExitIntentModal";
import { Testimonials } from "@/components/landing/Testimonials";

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

  const primaryLabel = ARCH_PRIMARY[archetype][lang as "pt" | "en" | "pl" | "ro" | "ar"] ?? ARCH_PRIMARY[archetype].en;
  const secondaryLabel = ARCH_PRIMARY[ARCH_SECONDARY[archetype]][lang as "pt" | "en" | "pl" | "ro" | "ar"] ?? ARCH_PRIMARY[ARCH_SECONDARY[archetype]].en;
  const tplVars = { name: displayName || "—", primary: primaryLabel, secondary: secondaryLabel };

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    track(EVENTS.VSL_VIEW, { arch: archetype, has_lead: Boolean(leadId), source: "reveal" });
  }, [archetype, leadId]);

  const exit = useExitIntent({
    enabled: true,
    onTrigger: () => track(EVENTS.EXIT_INTENT_SHOWN, { stage: "vsl", arch: archetype }),
  });

  const advance = (source: string) => {
    track(EVENTS.VSL_CTA_CLICK, { arch: archetype, bumps: [], source });
    onContinue({ bumps: [] }); // Os bumps agora vivem e são geridos totalmente no Checkout!
  };

  const v2 = t.salesV2;
  const tpl = (s: string) => fillTpl(s, tplVars);

  const unifiedTestimonials = [
    ...(v2.b6.testimonials || []).map((tst: any) => ({
      stars: 5,
      quote: tst.quote,
      name: tst.author,
      arch: tst.arch
    })),
    ...(t.landing.testimonials.items || [])
  ];

  return (
    <div ref={rootRef} data-arch={archetype} className="relative min-h-screen text-white/90 selection:bg-[var(--arch-primary)] selection:text-white bg-black">
      {/* ─── Layout split: copy column + sculpture column ───── */}
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-[1.5fr_1fr] lg:gap-16 lg:px-16 py-10">
        
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
                { value: "+12.000", label: v2.b6.counter.replace(/[+\\d.,\\s]+/g, " ").trim() || "Diagnoses" },
                { value: "4.9★", label: v2.b6.rating.replace(/[★⭐\\d.,/\\s]+/g, " ").trim() || "Rating" },
                { value: "60s", label: "PDF" },
                { value: "5", label: "Languages" },
              ]}
            />
          </div>

          {/* I — Pain Mirror (Glassmorphism Panel) */}
          <SceneFrame
            sceneId="pain"
            index={1}
            eyebrow={v2.b3.title.split(" ").slice(0, 2).join(" ")}
            title={tpl(v2.b2.title)}
          >
            <div className="rounded-3xl border border-white/10 bg-black/40 p-8 md:p-10 backdrop-blur-2xl shadow-xl">
              <p className="sales-dropcap text-white/90">{tpl(v2.b2.body)}</p>
              <ul className="mt-8 space-y-2">
                {v2.b2.bullets.map((b: string, i: number) => (
                  <PainScar key={i}>{tpl(b)}</PainScar>
                ))}
              </ul>
              <p className="mt-8 text-lg font-medium italic text-arch-primary">{tpl(v2.b2.conclusion)}</p>
            </div>
          </SceneFrame>

          {/* II — Scientific Breakthrough */}
          <SceneFrame sceneId="science" index={2} title={v2.b3.title}>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-8 md:p-10 backdrop-blur-2xl shadow-xl">
              <p className="text-white/90 leading-[1.8] text-base md:text-lg">{v2.b3.body}</p>
              <blockquote
                className="mt-8 border-s-2 ps-6 py-2 text-sm italic text-white/60 bg-gradient-to-r from-arch-primary/10 to-transparent"
                style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 80%, transparent)" }}
              >
                {v2.b3.references}
              </blockquote>
              <p className="mt-8 text-lg font-bold leading-relaxed text-white">
                <strong style={{ color: "var(--arch-primary)" }}>{v2.b3.pivot}</strong>{" "}
                {tpl(v2.b3.solution)}
              </p>
            </div>
          </SceneFrame>

          {/* III — 4D Diagnosis */}
          <SceneFrame sceneId="4d" index={3} title={tpl(v2.b4.title)}>
            <p className="mb-8 text-white/70 text-base md:text-lg font-medium text-center">{tpl(v2.b4.subtitle)}</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {AREA_ORDER.map((area, i) => {
                const feat = v2.b4.features[i];
                return (
                  <div key={area} className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-lg hover:border-arch-primary/40 transition-colors">
                    <AreaPoster
                      area={area}
                      title={feat?.title ?? area}
                      description={tpl(feat?.description ?? "")}
                      score={areaScores[area]}
                    />
                  </div>
                );
              })}
            </div>
          </SceneFrame>

          {/* IV — Avalanche Social (Unificada) */}
          <SceneFrame
            sceneId="proof"
            index={4}
            title={
              <span>
                <AnimatedCounter end={12000} prefix="+" />{" "}
                {v2.b6.counter.replace(/\\+\\s?12[.,]?000\\s?/, "").trim()}
              </span>
            }
          >
            <p className="mb-10 text-center text-sm uppercase tracking-widest text-white/60 font-bold">
              {v2.b6.rating}
            </p>
            {/* Oculta os estilos do Testimonials.tsx (padding excessivo) e aplica apenas o grid */}
            <div className="-mx-5 sm:mx-0">
               <Testimonials customItems={unifiedTestimonials} />
            </div>
          </SceneFrame>

          {/* ★ VALUE STACK (Sem Preços - A Ponte de Ouro) */}
          <SceneFrame sceneId="offer">
            <div className="rounded-[32px] p-8 sm:p-12 bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
               {/* Fundo glow */}
               <div className="absolute inset-0 bg-arch-primary/5 blur-[100px] pointer-events-none" />
               
               <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-arch-primary text-center mb-10 relative z-10">O Seu Diagnóstico Está Pronto</p>
               
               <div className="grid grid-cols-1 gap-10 relative z-10">
                 <div className="flex flex-col items-center justify-center text-center">
                    <h3 className="font-display text-2xl md:text-4xl font-black italic uppercase text-white mb-4 leading-tight">O Que Você Vai <br/>Receber Hoje:</h3>
                    
                    <ul className="mt-6 space-y-5 text-start w-full max-w-sm">
                      <li className="flex items-start gap-4">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-arch-primary text-white"><Check className="h-4 w-4"/></div>
                        <span className="text-white font-medium text-lg">Dossiê Completo (+30 págs)</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-arch-primary text-white"><Check className="h-4 w-4"/></div>
                        <span className="text-white font-medium text-lg">Mapeamento Financeiro</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-arch-primary text-white"><Check className="h-4 w-4"/></div>
                        <span className="text-white font-medium text-lg">Análise Amorosa e Profissional</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-arch-primary text-white"><Check className="h-4 w-4"/></div>
                        <span className="text-white font-medium text-lg">Acesso Imediato no E-mail</span>
                      </li>
                    </ul>
                 </div>
                 
                 <div className="flex flex-col items-center justify-center mt-4">
                   <ButtonPress className="w-full sm:w-auto">
                     <button
                       onClick={() => advance("b7")}
                       className="group relative flex w-full sm:w-auto min-w-[280px] items-center justify-center gap-3 rounded-2xl bg-arch-primary px-8 py-6 text-lg font-black uppercase tracking-wide text-primary-foreground shadow-[0_20px_50px_-10px_var(--arch-glow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-5px_var(--arch-glow)] active:scale-[0.98]"
                     >
                       <Lock className="h-5 w-5" />
                       Revelar Meu Plano de Ação
                       <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                     </button>
                   </ButtonPress>
                   <p className="mt-5 text-xs text-white/50 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-arch-primary" /> Garantia Incondicional de 7 Dias</p>
                 </div>
               </div>
            </div>
          </SceneFrame>

          {/* V — FAQ */}
          <SceneFrame sceneId="faq" index={5} title={v2.b8.title}>
            <ul
              className="divide-y rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden"
              style={{
                borderColor: "color-mix(in oklab, var(--arch-primary) 22%, transparent)",
              }}
            >
              {v2.b8.items.map((it: any, i: number) => (
                <li key={i} style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 18%, transparent)" }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="flex w-full items-center justify-between gap-4 p-6 text-start hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-white text-[15px]">{it.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                      style={{ color: "var(--arch-primary)" }}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-[15px] leading-relaxed text-white/70">
                      {tpl(it.a)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </SceneFrame>

          {onBack && (
            <div className="pb-16 pt-10 text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-white/40 uppercase tracking-widest font-bold underline-offset-4 hover:underline hover:text-white transition-colors"
              >
                ← {t.common.back}
              </button>
            </div>
          )}
        </div>

        {/* SCULPTURE COLUMN — desktop sticky / mobile fixed ambient */}
        <aside className="pointer-events-none relative hidden lg:block h-full">
          <div className="sticky top-0 h-screen w-full">
            <ScrollAnimationSequence archetype={archetype} targetRef={rootRef} />
          </div>
        </aside>
      </div>

      {/* Mobile/tablet sculpture — fixed ambient behind copy */}
      <div
        className="pointer-events-none fixed inset-0 -z-0 lg:hidden"
        style={{ opacity: 0.25, mixBlendMode: "screen" }}
      >
        <ScrollAnimationSequence archetype={archetype} targetRef={rootRef} />
      </div>

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