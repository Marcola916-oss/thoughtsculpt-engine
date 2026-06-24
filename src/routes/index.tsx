import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  Brain,
  Calendar as CalendarIcon,
  Compass as CompassIcon,
  LineChart,
  Star,
  ShieldCheck,
  ChevronDown,
  Shield,
  Crown,
  EyeOff,
  Flame,
} from "lucide-react";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Magnetic } from "../components/PageTransition";
import { scoreAnswers, type Answers, type Archetype } from "../lib/quiz/scoring";
import { saveQuizLead } from "../lib/quiz.functions";
import { startBrainFramesPreload } from "@/lib/brainFramesCache";
import { computeAreaScores, AREA_ORDER, type LifeArea } from "@/lib/funnel/area-scores";
import { AreaScoreCard } from "@/components/reveal/AreaScoreCard";
import { BrainOrbit } from "@/components/reveal/BrainOrbit";
import { VSL } from "@/components/sales/VSL";
import { CheckoutStub } from "@/components/funnel/CheckoutStub";
import { track, EVENTS } from "@/lib/analytics";

// ── Phase A placeholders (will be replaced in Phase B/D when checkout is rebuilt) ──
type PlanKey = "30d" | "6m" | "1y";
const PRICES: Record<string, Record<PlanKey, number>> = {
  PLN: { "30d": 79, "6m": 199, "1y": 319 },
  RON: { "30d": 89, "6m": 229, "1y": 369 },
  SAR: { "30d": 89, "6m": 229, "1y": 369 },
  USD: { "30d": 22, "6m": 55, "1y": 89 },
  EUR: { "30d": 20, "6m": 50, "1y": 82 },
};
const formatPrice = (currency: string, amount: number) => `${amount} ${currency}`;
const pricePerDay = (currency: string, plan: PlanKey) => {
  const days = plan === "30d" ? 30 : plan === "6m" ? 180 : 365;
  return formatPrice(currency, +(PRICES[currency][plan] / days).toFixed(2));
};
/** Phase A stub — Phase D wires Stripe Elements with new $9.90 one-shot offer. */
const useStubCheckout = () => async (_args: unknown) => {
  console.warn("[Phase A] Checkout will be rebuilt in Phase D.");
  alert("Checkout em reformulação. Em breve!");
  return { url: null as string | null };
};

import { QuizScreenWrapper } from "../components/quiz/QuizScreenWrapper";
import { QuizOption } from "../components/quiz/QuizOption";
import { NeuralLoader } from "../components/quiz/NeuralLoader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CircuitBrain } from "@/components/identity/CircuitBrain";
import { ArchetypeRevealStage } from "@/components/identity/ArchetypeRevealStage";
import { ArchetypeCanvasBrain } from "@/components/identity/ArchetypeCanvasBrain";
import { ArchetypePedestal } from "@/components/identity/ArchetypePedestal";
import { ArchetypeSymbol } from "@/components/identity/symbols";
import {
  ProofBar,
  BeliefBreak,
  ArchetypeShowcase,
  Testimonials,
  FAQ,
  FinalCTA,
  TopBar,
} from "@/components/landing";

// (Phase F) framer-motion removed — all animations are CSS-only.

/** Scroll-reveal section — CSS-only, GPU-composited. Observer in __root adds .is-visible. */
const MSection = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`reveal ${className || ""}`} {...props}>
    {children}
  </div>
);

/** Mount fade — CSS hero-fade with delay bucket. */
const MFade = ({
  children,
  className,
  delay = 0,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { delay?: number; y?: number }) => {
  const delayClass =
    delay <= 0 ? "" :
    delay <= 0.2 ? "hero-fade-delay-1" :
    delay <= 0.4 ? "hero-fade-delay-2" :
    delay <= 0.6 ? "hero-fade-delay-3" :
    delay <= 1 ? "hero-fade-delay-4" :
    delay <= 1.5 ? "hero-fade-delay-5" :
    delay <= 2 ? "hero-fade-delay-6" : "hero-fade-delay-7";
  return (
    <div className={`hero-fade ${delayClass} ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindReset — Discover your financial archetype" },
      {
        name: "description",
        content:
          "A 3-minute behavioral diagnosis. No budgets. No bank linking. Just psychology that changes behavior.",
      },
      { property: "og:title", content: "MindReset — Discover your financial archetype" },
      {
        property: "og:description",
        content:
          "A 3-minute behavioral diagnosis. No budgets. No bank linking. Just psychology that changes behavior.",
      },
    ],
  }),
  component: LandingAndQuiz,
});

type Stage =
  | { kind: "hero" }
  | { kind: "identity" }
  | { kind: "q"; index: number }
  | { kind: "email" }
  | { kind: "loader" }
  | { kind: "reveal" }
  | { kind: "sales" }
  | { kind: "vsl" }
  | { kind: "checkout" }
  | { kind: "plans" };

function LandingAndQuiz() {
  const { t, lang, currency, country } = useI18n();
  const [stage, setStage] = useState<Stage>({ kind: "hero" });
  const isQuizCaptureStage = stage.kind === "identity" || stage.kind === "q" || stage.kind === "email";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = t.meta.title;
    }
  }, [t.meta.title]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f" | "n" | "">("");
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [answers, setAnswers] = useState<Answers>(() => Array(8).fill(null));
  const [leadId, setLeadId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [timerLeft, setTimerLeft] = useState(900); // 15 minutes shared across Sales + Plans
  // Fase 1 — Recovery banner para usuários que cancelaram no Stripe Checkout.
  // Stripe redireciona para `/?canceled=1&recover=<orderId>` quando o user fecha
  // o checkout hosted. Mostramos um banner não-intrusivo no topo do hero.
  const [recoverOrderId, setRecoverOrderId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("canceled") === "1") {
      const order = params.get("recover");
      if (order) setRecoverOrderId(order);
      // Limpa query string sem recarregar — evita re-trigger no refresh.
      const url = new URL(window.location.href);
      url.searchParams.delete("canceled");
      url.searchParams.delete("recover");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  }, []);

  // Fase 3 — Quiz draft persistence (sessionStorage, TTL 30min).
  // Restaura name/gender/answers se o utilizador refrescar acidentalmente durante o quiz.
  const DRAFT_KEY = "mr_quiz_draft";
  const DRAFT_TTL_MS = 30 * 60 * 1000;
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        savedAt: number;
        name?: string;
        gender?: "m" | "f" | "n" | "";
        answers?: Answers;
      };
      if (Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        window.sessionStorage.removeItem(DRAFT_KEY);
        return;
      }
      if (draft.name) setName(draft.name);
      if (draft.gender) setGender(draft.gender);
      if (Array.isArray(draft.answers) && draft.answers.length === 8) setAnswers(draft.answers);
    } catch {
      /* ignore corrupted draft */
    }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only persist once the user actually engaged the quiz (entered identity).
    const hasContent = name.length > 0 || answers.some((a) => a != null);
    if (!hasContent) return;
    try {
      window.sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ savedAt: Date.now(), name, gender, answers }),
      );
    } catch {
      /* quota / privacy mode — silently ignore */
    }
  }, [name, gender, answers]);

  useEffect(() => {
    if (timerLeft <= 0) return;
    const interval = setInterval(() => setTimerLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timerLeft]);

  const persistLead = useServerFn(saveQuizLead);

  const result = useMemo(() => scoreAnswers(answers), [answers]);
  const archCode: Archetype | null = answers.every((a) => a != null) ? result.winner : null;

  useEffect(() => {
    if (stage.kind !== "loader") return;
    let cancelled = false;
    const minDelay = new Promise((r) => setTimeout(r, 2400));
    // Start downloading + processing the 120 brain frames in parallel with
    // the lead persistence. The reveal can only mount once all three resolve:
    // network write, min visual delay, and frames fully in memory.
    const framesReady = startBrainFramesPreload();
    (async () => {
      try {
        const [row] = await Promise.all([
          persistLead({
            data: {
              display_name: name,
              gender: (gender || undefined) as "m" | "f" | "n" | undefined,
              email,
              lang,
              country: country ?? null,
              currency,
              answers,
              user_agent:
                typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
            },
          }),
          minDelay,
          framesReady,
        ]);
        if (cancelled) return;
        if (row) {
          setLeadId(row.id);
          setShareToken(row.share_token);
        }
        track(EVENTS.LOADER_COMPLETE);
        setStage({ kind: "reveal" });
      } catch (e) {
        if (cancelled) return;
        setLeadError((e as Error).message);
        track(EVENTS.LOADER_COMPLETE, { error: true });
        setStage({ kind: "reveal" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stage.kind, persistLead, name, gender, email, lang, country, currency, answers]);

  function answerQuestion(optionIdx: number) {
    if (stage.kind !== "q") return;
    const next = [...answers];
    next[stage.index] = optionIdx;
    setAnswers(next);

    track(EVENTS.QUIZ_QUESTION_ANSWERED, {
      step: stage.index + 1,
      option: optionIdx,
    });

    // Smooth transition with staggered feel
    const isLast = stage.index === 7;
    if (isLast) {
      track(EVENTS.QUIZ_COMPLETED, { total_steps: 8 });
    }
    setTimeout(() => {
      setStage(isLast ? { kind: "email" } : { kind: "q", index: stage.index + 1 });
    }, 250);
  }

  useEffect(() => {
    // Scroll with instant behavior to avoid lag on any device
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage.kind]);

  // Preload the 3D brain (Spline runtime + scene file) only after the user
  // commits to finishing the quiz (reaches the email stage). This saves
  // ~860KB of download for visitors who never reach the reveal screen,
  // while still giving the asset 5-10s to land in cache before reveal.
  useEffect(() => {
    if (stage.kind !== "email") return;
    import("@splinetool/react-spline").catch(() => {});
    try {
      fetch("/brain.splinecode", { credentials: "omit" }).catch(() => {});
    } catch {
      /* noop */
    }
  }, [stage.kind]);

  return (
    <div
      className="min-h-screen w-full bg-transparent text-foreground selection:bg-primary/30 overflow-x-hidden relative flex flex-col"
      data-arch={archCode || undefined}
    >
      <div className="noise-overlay pointer-events-none z-0" />
      
      {/* Persistent atmosphere is mounted globally in __root so it stays visible across the whole product. */}
      
      {stage.kind === "hero" && <TopBar />}
      {stage.kind === "hero" && recoverOrderId && (
        <div className="relative z-20 mx-auto mt-2 max-w-3xl px-4">
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-arch-primary/40 bg-arch-primary/10 px-4 py-3 text-sm text-foreground/90 shadow-[0_0_24px_-8px_rgba(204,0,0,0.6)] backdrop-blur-md"
          >
            <Clock className="h-5 w-5 shrink-0 text-arch-primary" aria-hidden />
            <div className="flex-1">
              <p className="font-medium">
                {lang === "pt"
                  ? "Tu paraste mesmo antes do final."
                  : lang === "pl"
                  ? "Zatrzymałeś się tuż przed końcem."
                  : lang === "ro"
                  ? "Te-ai oprit chiar înainte de final."
                  : lang === "ar"
                  ? "توقفت قبل النهاية مباشرة."
                  : "You stopped right before the finish."}
              </p>
              <p className="text-foreground/70">
                {lang === "pt"
                  ? "O teu diagnóstico ainda está reservado por 30 min. Retoma agora — sem perder progresso."
                  : lang === "pl"
                  ? "Twoja diagnoza jest zarezerwowana jeszcze przez 30 min. Dokończ teraz — bez utraty postępu."
                  : lang === "ro"
                  ? "Diagnoza ta este rezervată încă 30 min. Reia acum — fără să pierzi progresul."
                  : lang === "ar"
                  ? "تشخيصك محجوز لمدة 30 دقيقة. أكمل الآن — دون فقدان تقدمك."
                  : "Your diagnosis is still reserved for 30 min. Resume now — no progress lost."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRecoverOrderId(null)}
              className="text-foreground/60 hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main
        className={`w-full px-0 sm:px-4 pb-24 ${isQuizCaptureStage ? "pt-5 md:pt-12" : "pt-16 md:pt-12"} relative z-10 flex-1`}
      >
        
          {stage.kind === "hero" && (
            <div
              key="hero"
            >
              <div className="relative z-10 min-h-screen">
                <Hero onStart={() => setStage({ kind: "identity" })} />
              </div>
              <div className="relative z-10 bg-transparent shadow-[0_-50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                <ProofBar />
                <BeliefBreak />
                <ArchetypeShowcase />
                <Testimonials />
                <FAQ
                  onCta={() => {
                    track(EVENTS.QUIZ_START, { source: "faq" });
                    setStage({ kind: "identity" });
                  }}
                />
                <FinalCTA
                  onCta={() => {
                    track(EVENTS.QUIZ_START, { source: "final_cta" });
                    setStage({ kind: "identity" });
                  }}
                />
              </div>
            </div>
          )}

          {stage.kind === "identity" && (
            <div className="relative z-10">
              <QuizScreenWrapper
                stepKey="identity"
                progress={0}
                onBack={undefined}
                progressTitle={t.quizProgress.identity}
              >
                <Identity
                  name={name}
                  setName={setName}
                  gender={gender}
                  setGender={setGender}
                  onContinue={() => setStage({ kind: "q", index: 0 })}
                />
              </QuizScreenWrapper>
            </div>
          )}

          {stage.kind === "q" && (
            <div className="relative z-10">
              <QuizScreenWrapper
                stepKey={`q-${stage.index}`}
                progress={((stage.index + 1) / 8) * 85}
                onBack={() =>
                  {
                    track(EVENTS.QUIZ_BACK, { from_step: stage.index + 1 });
                    if (stage.index === 0) setStage({ kind: "identity" });
                    else setStage({ kind: "q", index: stage.index - 1 });
                  }
                }
                progressTitle={t.questions.title(stage.index + 1, 8)}
              >
                <QuestionScreen
                  index={stage.index}
                  total={8}
                  name={name}
                  selected={answers[stage.index]}
                  onSelect={answerQuestion}
                />
              </QuizScreenWrapper>
            </div>
          )}

          {stage.kind === "email" && (
            <div className="relative z-10">
              <QuizScreenWrapper
                stepKey="email"
                progress={90}
                onBack={() => {
                  track(EVENTS.QUIZ_BACK, { from_step: "email" });
                  setStage({ kind: "q", index: 7 });
                }}
                progressTitle={t.quizProgress.email}
              >
                <EmailCapture
                  name={name}
                  email={email}
                  setEmail={setEmail}
                  gdpr={gdpr}
                  setGdpr={setGdpr}
                  onSubmit={() => {
                    track(EVENTS.EMAIL_SUBMITTED);
                    setStage({ kind: "loader" });
                  }}
                />
              </QuizScreenWrapper>
            </div>
          )}

          {stage.kind === "loader" && (
            <div className="relative z-10">
              <NeuralLoader
                key="loader"
                /* Advance is gated by the useEffect above (persistLead +
                 * minDelay + brain frames preload). onComplete is a no-op
                 * to avoid racing past the frame-readiness gate. */
                onComplete={() => {}}
                durationMs={3000}
              />
            </div>
          )}

          {stage.kind === "reveal" && archCode && (
            <div className="relative z-10">
              <Reveal
                name={name}
                arch={archCode}
                answers={answers}
                timeLeft={timerLeft}
                onContinue={() => setStage({ kind: "vsl" })}
                leadError={leadError}
                onRetry={() => {
                  setLeadError(null);
                  setStage({ kind: "loader" });
                }}
              />
            </div>
          )}

          {stage.kind === "vsl" && archCode && (
            <div key="vsl">
              <VSL
                name={name}
                arch={archCode}
                onCheckout={() => setStage({ kind: "checkout" })}
              />
            </div>
          )}

          {stage.kind === "checkout" && (
            <div key="checkout">
              <CheckoutStub email={email} name={name} leadId={leadId} />
            </div>
          )}

          {stage.kind === "sales" && archCode && (
            <div
              key="sales"
            >
              <Sales
                name={name}
                arch={archCode}
                timeLeft={timerLeft}
                onContinue={() => setStage({ kind: "plans" })}
              />
            </div>
          )}

          {stage.kind === "plans" && (
            <div
              key="plans"
            >
              <Plans email={email} displayName={name} leadId={leadId} timeLeft={timerLeft} />
            </div>
          )}
        
      </main>

      {stage.kind === "sales" && <StickyCTA onClick={() => setStage({ kind: "plans" })} />}
      <Footer />
    </div>
  );
}

function StickyCTA({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show earlier on mobile
      const threshold = window.innerWidth < 768 ? 800 : 1200;
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {visible && (
        <div
          className="anim-slide-up fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black p-4 pb-8 md:pb-4 md:backdrop-blur-xl"
        >
          <button
            onClick={onClick}
            className="w-full rounded-2xl bg-primary py-4 text-base md:text-lg font-black uppercase italic tracking-widest text-primary-foreground shadow-[0_10px_30px_rgba(204,0,0,0.4)] active:scale-[0.98] transition-transform"
          >
            {t.sales.cta}
          </button>
        </div>
      )}
    </>
  );
}


/* --- Hero ------------------------------------------------------------------------------------------- */

function Hero({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  // Fase 2 — fire LANDING_VIEW once when hero mounts (browser-only via track()).
  useEffect(() => {
    track(EVENTS.LANDING_VIEW);
  }, []);
  const handleStart = () => {
    track(EVENTS.QUIZ_START, { source: "hero" });
    onStart();
  };
  // Gate the 3 desktop-only floating badges by an actual media query so the
  // framer-motion subscriptions don't run idle on mobile (display:none alone
  // does NOT stop framer's rAF loop).
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLg(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return (
    <section className="relative pt-20 pb-16 md:pt-[15vh] md:pb-[10vh] min-h-[90vh] flex flex-col justify-center items-center text-center overflow-x-hidden px-4 md:px-6" style={{ marginLeft: "-12px", marginRight: "-12px", marginTop: "-50px", marginBottom: "-50px" }}>
      {/* Dynamic Aura Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_0%,_var(--arch-glow),transparent_60%)] opacity-30 blur-[8px] lg:blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-arch-primary/5 blur-[8px] lg:blur-[140px] rounded-full lg:animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-arch-primary/5 blur-[8px] lg:blur-[140px] rounded-full lg:animate-pulse [animation-delay:2s]" />
      </div>

      {/* Floating Archetype Badges */}
      <MFade
        delay={0}
        className="mb-8 md:mb-12 flex flex-wrap justify-center gap-3 md:gap-4 px-4"
      >
        <span className="flex items-center gap-2 rounded-full border border-arch-primary/20 bg-arch-primary/5 px-4 py-2 text-xs font-bold text-arch-primary md:backdrop-blur-md mt-[30px]">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t.archetypes?.AO?.name || "O Guardador"}
        </span>
      </MFade>

      {isLg && (
        <>
          <div
            className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-950/20 px-4 py-2 text-xs font-bold text-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.15)] backdrop-blur-md absolute right-[8%] top-[30%] pointer-events-none select-none"
          >
            <Star className="h-3.5 w-3.5" />
            {t.archetypes?.SS?.name || "O Pav├úo"}
          </div>

          <div
            className="flex items-center gap-2 rounded-full border border-slate-500/20 bg-slate-950/20 px-4 py-2 text-xs font-bold text-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.15)] backdrop-blur-md absolute left-[12%] bottom-[20%] pointer-events-none select-none"
          >
            <CompassIcon className="h-3.5 w-3.5" />
            {t.archetypes?.EA?.name || "O Fantasma"}
          </div>

          <div
            className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-950/20 px-4 py-2 text-xs font-bold text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] backdrop-blur-md absolute right-[10%] bottom-[18%] pointer-events-none select-none whitespace-pre-line"
          >
            <LineChart className="h-3.5 w-3.5" />
            {t.archetypes?.HI?.name || "O Foguinho"}
          </div>
        </>
      )}



      <MFade
        delay={0}
        y={-20}
        className="mb-[50px] inline-flex items-center gap-2 rounded-full bg-black/40 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/90 shadow-2xl md:backdrop-blur-2xl border-white/10 border-2"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arch-primary opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-arch-primary"></span>
        </span>
        {t.hero.kicker}
      </MFade>

      {(() => {
        const headline = t.hero.headline;
        // Bible V2 highlight tokens — the "sabotar" verb in each language.
        // Old tokens kept as fallback for backward compat if copy diverges mid-deploy.
        const keywords = [
          "SABOTAR", "SABOTANDO", "SABOTAGING", "SABOTUJE", "SABOTEAZĂ", "يُخرّب",
          "CONHECER", "know", "poznać", "cunoști", "تعرف",
        ];
        let keyword = "";
        let idx = -1;
        
        for (const kw of keywords) {
          const foundIdx = headline.indexOf(kw);
          if (foundIdx !== -1) {
            keyword = kw;
            idx = foundIdx;
            break;
          }
        }

        const hasKeyword = idx !== -1;
        const before = hasKeyword ? headline.slice(0, idx) : headline;
        const after = hasKeyword ? headline.slice(idx + keyword.length) : "";

        const headlineClass = "relative mx-auto w-full max-w-5xl font-display md:!text-[45px] font-black leading-[1.15] tracking-[0em] uppercase italic px-4 md:px-8 text-center text-balance break-words";
        const headlineStyle = { fontSize: "clamp(1.75rem, 6.5vw, 2.75rem)" };

        const highlightSpan = hasKeyword ? (
          <span className="relative inline-block mx-1 md:mx-4 z-10">
            <span className="relative z-10 text-arch-primary drop-shadow-[0_0_20px_var(--arch-glow)] md:drop-shadow-[0_0_35px_var(--arch-glow)]">{keyword}</span>
            <span className="anim-underline absolute bottom-[10%] left-0 h-[12%] w-full bg-arch-primary/40 -z-10 origin-left blur-[3px]" />
          </span>
        ) : null;

        const textSpan = (content: string) => (
          <span className="relative z-10 bg-gradient-to-b from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-pre-wrap">
            {content}
          </span>
        );

        const content = (
          <>
            {textSpan(before)}
            {highlightSpan}
            {textSpan(after)}
          </>
        );

        return (
          <h1
            className={`anim-fade-in-up delay-300 ${headlineClass}`}
            style={headlineStyle}
          >
            {content}
          </h1>
        );
      })()}

      <MFade
        delay={0.4}
        className="relative mx-auto mt-16 max-w-2xl px-6"
      >
        <div className="absolute inset-0 bg-black/60 blur-[8px] md:blur-[40px] -z-10 scale-150" />
        <p className="relative z-10 text-lg text-white/85 md:text-2xl leading-relaxed font-semibold tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
          {t.hero.sub}
        </p>
      </MFade>

      <MFade
        delay={0.6}
        className="mt-12 md:mt-24 flex flex-col items-center gap-12"
      >
        <Magnetic>
          <button
            onClick={handleStart}
            data-cursor="hover"
            className="group relative h-20 md:h-28 w-full max-w-2xl overflow-hidden rounded-full bg-white text-black transition-all hover:scale-[1.03] active:scale-95 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-full bg-arch-primary opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center justify-center gap-6 text-[21px] md:text-[21px] font-black italic tracking-tighter group-hover:text-white transition-colors mx-[5px] pr-[5px]">
              {t.hero.cta.toUpperCase()}
            </span>
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
          </button>
        </Magnetic>

        <div className="flex flex-col items-center gap-4" style={{ lineHeight: "25px" }}>
          {/* Bible V2 microcopy — replaces SSL/Data trust badges above the fold. */}
          <p className="text-[12px] md:text-sm font-semibold tracking-wide text-foreground/75 whitespace-nowrap">
            {t.hero.microcopy}
          </p>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/75">
            <div className="flex text-arch-primary gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <span>4.9 / 5</span>
          </div>
        </div>
      </MFade>

      {/* Removed: duplicate archetype grid (now lives only in ArchetypeShowcase below). */}

      <MFade
        delay={2}
        className="mt-32 opacity-20"
      >
        <ChevronDown className="mx-auto h-6 w-6 animate-bounce text-arch-primary" />
      </MFade>
    </section>
  );
}

/* ─── Identity ────────────────────────────────────────────── */

function Identity(props: {
  name: string;
  setName: (v: string) => void;
  gender: "m" | "f" | "n" | "";
  setGender: (v: "m" | "f" | "n") => void;
  onContinue: () => void;
}) {
  const { t } = useI18n();
  const ok = props.name.trim().length >= 2 && props.gender !== "";
  return (
    <div className="w-full">
      <h2
        className="font-display italic uppercase text-balance text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        style={{ fontSize: "26px", lineHeight: "26px", letterSpacing: "-1.35px", fontWeight: 700 }}
      >
        {t.identity.title}
      </h2>
      <p className="mt-4 max-w-xl text-base md:text-lg text-foreground/70 leading-relaxed">
        {t.identity.sub}
      </p>

      <div className="mt-10 space-y-8">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-primary">
            {t.common.yourName}
          </label>
          <input
            autoFocus
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            placeholder={t.common.yourNamePlaceholder}
            className="w-full rounded-2xl border border-border bg-card/50 px-5 py-4 text-xl outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-lg font-bold tracking-tight"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-primary">
            {t.common.selectGender}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["m", "f", "n"] as const).map((g) => (
              <button
                key={g}
                data-cursor="hover"
                onClick={() => props.setGender(g)}
                className={`rounded-2xl border px-2 py-4 text-[13px] sm:text-base font-black uppercase tracking-tight italic transition-all ${
                  props.gender === g
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_15px_30px_-10px_var(--accent-glow)] scale-105 z-10"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-secondary/40"
                }`}
              >
                {g === "m" ? t.common.male : g === "f" ? t.common.female : t.common.neutral}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        disabled={!ok}
        data-cursor="hover"
        onClick={props.onContinue}
        className="group relative mt-12 w-full overflow-hidden rounded-2xl bg-foreground py-5 text-xl font-black italic tracking-tighter text-background transition-all disabled:opacity-20 disabled:scale-100 disabled:shadow-none shadow-[0_20px_60px_-10px_rgba(255,255,255,0.1)]"
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-primary-foreground">
          {t.common.continue.toUpperCase()}
          <ArrowRight
            size={22}
            className="transition-transform duration-500 group-hover:translate-x-2"
          />
        </span>
      </button>
    </div>
  );
}

/* --- QuestionScreen ---------------------------------------------------------------------------------- */

function QuestionScreen(props: {
  index: number;
  total: number;
  name: string;
  selected: number | null;
  onSelect: (idx: number) => void;
}) {
  const { t } = useI18n();
  const q = t.q[props.index];

  return (
    <div className="w-full">
      <h2 className="quiz-question-title font-display italic uppercase text-balance mb-4">
        {q.q.replace("[NOME]", props.name)}
      </h2>
      <p className="mb-8 text-base md:text-lg text-foreground/70 leading-relaxed">
        {t.questions.intro(props.name)}
      </p>

      <div className="grid gap-3.5">
        {q.options.map((opt, i) => (
          <QuizOption
            key={i}
            letter={["A", "B", "C", "D"][i]}
            label={opt}
            selected={props.selected === i}
            onClick={() => props.onSelect(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* --- EmailCapture ------------------------------------------------------------------------------------- */

function EmailCapture(props: {
  name: string;
  email: string;
  setEmail: (v: string) => void;
  gdpr: boolean;
  setGdpr: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const { t } = useI18n();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email) && props.gdpr;
  return (
    <div className="w-full text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_20px_var(--accent-glow)] mx-auto">
        <Lock className="h-7 w-7 text-primary animate-pulse" />
      </div>
      <h2 className="quiz-question-title font-display italic uppercase text-balance">
        {t.emailCapture.title(props.name)}
      </h2>
      <p className="mt-4 text-base md:text-lg text-foreground/70 leading-relaxed">
        {t.emailCapture.sub}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) props.onSubmit();
        }}
        className="mt-8 space-y-5 text-left"
      >
        <div>
          <input
            type="email"
            required
            autoFocus
            value={props.email}
            onChange={(e) => props.setEmail(e.target.value)}
            placeholder={t.common.emailPlaceholder}
            className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-lg outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-md font-medium"
          />
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-4 text-xs text-muted-foreground transition hover:bg-card/60 cursor-pointer">
          <input
            type="checkbox"
            checked={props.gdpr}
            onChange={(e) => props.setGdpr(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span className="leading-relaxed">{t.common.gdpr}</span>
        </label>

        <PrimaryButton type="submit" disabled={!valid} fullWidth size="lg" className="mt-4">
          {t.emailCapture.cta} →
        </PrimaryButton>
      </form>
    </div>
  );
}

function ArchetypeIcon({ arch, className }: { arch: Archetype; className?: string }) {
  const icons = {
    AO: Shield,
    SS: Crown,
    EA: EyeOff,
    HI: Flame,
  };
  const Icon = icons[arch];
  return <Icon className={className} />;
}

/* --- Reveal ------------------------------------------------------------------------------------------- */

function Reveal({
  name,
  arch,
  answers,
  timeLeft,
  onContinue,
  leadError,
  onRetry,
}: {
  name: string;
  arch: Archetype;
  answers: Answers;
  timeLeft: number;
  onContinue: () => void;
  leadError: string | null;
  onRetry: () => void;
}) {
  const { t } = useI18n();
  const a = t.archetypes[arch];
  const [text, setText] = useState("");
  const areaScores = useMemo(() => computeAreaScores(answers).areas, [answers]);

  useEffect(() => {
    track(EVENTS.REVEAL_VIEW, { arch });
  }, [arch]);

  const handleCta = (source: "hero" | "areas" | "final") => {
    track(EVENTS.REVEAL_CTA_CLICK, { arch, source });
    onContinue();
  };

  const fmtTimer = (s: number) => {
    const m = Math.max(0, Math.floor(s / 60));
    const r = Math.max(0, s % 60);
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  };

  useEffect(() => {
    let i = 0;
    setText("");
    const id = setInterval(() => {
      i++;
      setText(a.name.slice(0, i));
      if (i >= a.name.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [a.name]);

  return (
    <section className="pt-0 pb-16 md:pb-32 overflow-hidden relative bg-transparent -mt-20 md:-mt-24">
      <ArchetypeRevealStage arch={arch as "AO" | "SS" | "EA" | "HI"}>
      {/* HERO limpo: cérebro animado + título + tagline + CTA. Sem sobreposições. */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Cérebro pousado sobre o pedestal holográfico */}
        <div className="relative w-[300px] h-[300px] md:w-[520px] md:h-[520px]">
          {/* Aura radiante atrás do cérebro — cor do arquétipo (intensificada) */}
          <div
            aria-hidden
            className="absolute left-1/2 top-[46%] w-[148%] h-[148%] rounded-full pointer-events-none"
            style={{
              background:
                  "radial-gradient(circle at center, color-mix(in oklab, var(--arch-primary) 24%, transparent) 0%, color-mix(in oklab, var(--arch-primary) 18%, transparent) 36%, color-mix(in oklab, var(--arch-primary) 10%, transparent) 56%, transparent 74%)",
              filter: "blur(28px)",
              mixBlendMode: "screen",
              animation: "arch-aura-pulse 5s ease-in-out infinite",
              opacity: 0.72,
              zIndex: 0,
            }}
          />
          {/* Sombra de contato — faz o cérebro "pesar" no cenário sem escurecer o canvas */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bottom-[18%] w-[54%] h-[11%] rounded-[50%] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.58) 0%, rgba(0, 0, 0, 0.32) 42%, transparent 76%)",
              filter: "blur(10px)",
              opacity: 0.72,
              zIndex: 1,
            }}
          />
          {/* Condutores sutis — conectam visualmente a base ao cérebro, sempre atrás do canvas */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bottom-[23%] h-[34%] w-[22%] pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {[-1, 1].map((side) => (
              <span
                key={side}
                className="absolute bottom-0 top-0 w-px origin-bottom rounded-full"
                style={{
                  left: side < 0 ? "31%" : "69%",
                  transform: `rotate(${side * 7}deg)`,
                  background:
                    "linear-gradient(to top, color-mix(in oklab, var(--arch-primary) 72%, transparent) 0%, color-mix(in oklab, var(--arch-primary) 38%, transparent) 52%, transparent 100%)",
                  boxShadow:
                    "0 0 16px color-mix(in oklab, var(--arch-primary) 55%, transparent)",
                  opacity: 0.72,
                  animation: "arch-connector-pulse 3.8s ease-in-out infinite",
                }}
              />
            ))}
          </div>
          {/* Feixe holográfico — nasce da BASE e para antes de lavar o cérebro */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bottom-[13%] w-[62%] h-[34%] pointer-events-none"
            style={{
              background:
                  "linear-gradient(to top, color-mix(in oklab, var(--arch-primary) 82%, transparent) 0%, color-mix(in oklab, var(--arch-primary) 46%, transparent) 48%, transparent 100%)",
              clipPath: "polygon(30% 100%, 70% 100%, 57% 0%, 43% 0%)",
              mixBlendMode: "screen",
              animation: "arch-beam-pulse 3.6s ease-in-out infinite",
                filter: "blur(2px) brightness(1.35)",
                opacity: 1,
              zIndex: 1,
            }}
          />
          {/* Scanlines holográficas dentro do feixe — sobem em direção ao cérebro */}
          <div
            aria-hidden
              className="absolute left-1/2 -translate-x-1/2 bottom-[13%] w-[62%] h-[34%] pointer-events-none opacity-80"
            style={{
              background:
                  "repeating-linear-gradient(to top, transparent 0px, transparent 8px, color-mix(in oklab, var(--arch-primary) 62%, transparent) 9px, transparent 10px)",
              clipPath: "polygon(30% 100%, 70% 100%, 57% 0%, 43% 0%)",
              mixBlendMode: "screen",
              backgroundSize: "100% 200%",
              animation: "arch-beam-scan 4s linear infinite",
              zIndex: 1,
            }}
          />
          {/* Disco de emissão sobre a base — ancora o feixe ao pedestal */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bottom-[12%] w-[58%] h-[6%] rounded-[50%] pointer-events-none"
            style={{
              background:
                  "radial-gradient(ellipse at center, var(--arch-glow) 0%, color-mix(in oklab, var(--arch-primary) 80%, transparent) 44%, transparent 74%)",
              filter: "blur(7px)",
              mixBlendMode: "screen",
              animation: "arch-beam-pulse 3.6s ease-in-out infinite",
                opacity: 1,
              zIndex: 2,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-[110%] -left-[5%]">
            <ArchetypePedestal arch={arch as "AO" | "SS" | "EA" | "HI"} />
          </div>
          <div
            className="absolute inset-0 z-20 translate-y-1 md:translate-y-2"
            style={{ isolation: "isolate" }}
          >
            {/* Aura presa à camada do cérebro: atrás do canvas, à frente da base/holograma. */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 z-0 h-[58%] w-[92%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  background:
                    "radial-gradient(ellipse at center, color-mix(in oklab, var(--arch-primary) 34%, transparent) 0%, color-mix(in oklab, var(--arch-primary) 24%, transparent) 42%, color-mix(in oklab, var(--arch-primary) 10%, transparent) 62%, transparent 82%)",
                  filter: "blur(22px)",
                  mixBlendMode: "screen",
                  animation: "arch-breathe 5s ease-in-out infinite",
                  opacity: 0.9,
                }}
              />
            </div>
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 z-0 h-[76%] w-[118%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  background:
                    "radial-gradient(ellipse at center, color-mix(in oklab, var(--arch-primary) 20%, transparent) 0%, color-mix(in oklab, var(--arch-primary) 12%, transparent) 48%, transparent 76%)",
                  filter: "blur(46px)",
                  mixBlendMode: "screen",
                  animation: "arch-breathe 6.5s ease-in-out infinite",
                  opacity: 0.8,
                }}
              />
            </div>
            <ArchetypeCanvasBrain
              archetype={arch as "AO" | "SS" | "EA" | "HI"}
              className="relative z-10"
            />
            <BrainOrbit />
          </div>
        </div>

        <div className="relative z-30 -mt-10 md:-mt-16 text-[10px] md:text-xs font-bold uppercase tracking-[0.45em] text-foreground/60">
          {t.reveal.kicker(name)}
        </div>

        <h1 className="relative z-30 mt-6 font-display text-5xl sm:text-7xl md:text-[8rem] font-black leading-[1.05] md:leading-[1.02] pt-2 pb-1 tracking-tighter uppercase italic text-balance drop-shadow-[0_8px_30px_rgba(0,0,0,0.65)] flex items-stretch">
          <span
            className="bg-clip-text text-transparent whitespace-pre-line"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--arch-primary) 0%, #FFFFFF 70%)",
            }}
          >
            {text}
          </span>
          <span className="text-arch-primary"></span>
        </h1>

        <p className="mt-8 max-w-2xl text-xl md:text-2xl text-foreground/80 font-medium leading-relaxed">
          {a.tagline}
        </p>

        <button
          onClick={() => handleCta("hero")}
          className="group mt-12 inline-flex items-center gap-4 rounded-full px-10 py-5 text-base md:text-lg font-black uppercase tracking-wider text-background transition-all"
          style={{
            backgroundColor: "var(--arch-primary)",
            boxShadow: "0 20px 60px -10px var(--arch-glow)",
          }}
        >
          {t.reveal.cta}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {leadError && (
        <div
          className="relative z-10 mx-auto mt-12 max-w-2xl rounded-2xl border border-primary/40 bg-primary/5 p-6 md:backdrop-blur-md"
        >
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              !
            </div>
            <div>
              <p className="font-black uppercase tracking-wider text-primary">
                {t.reveal.errorTitle}
              </p>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                {leadError}. {t.reveal.errorBody}
              </p>
              <button
                onClick={onRetry}
                className="mt-4 flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-xs font-bold text-primary transition hover:bg-primary/20"
              >
                <ArrowRight className="h-4 w-4 rotate-180" /> {t.reveal.errorRetry}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes (hooks) abaixo do hero — separados, sem competir com a revelação */}
      <div className="relative z-10 mx-auto mt-28 md:mt-40 max-w-3xl px-4">
        <div className="mb-10 flex items-center gap-4">
          <ArchetypeSymbol
            arch={arch as "AO" | "SS" | "EA" | "HI"}
            className="h-8 w-8 text-arch-primary"
          />
          <p className="font-display text-2xl md:text-3xl font-black tracking-tight uppercase italic">
            {t.reveal.sub}
          </p>
        </div>
        <div className="grid gap-4 reveal-group">
          {a.hooks.map((h, i) => (
            <div
              key={i}
              className="reveal flex gap-5 rounded-2xl border border-white/5 bg-card/40 p-6 transition-all hover:border-arch-primary/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-arch-primary/10 text-arch-primary font-black border border-arch-primary/30">
                {i + 1}
              </div>
              <p className="text-base md:text-lg text-foreground/85 leading-relaxed self-center">
                {h}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnóstico multi-área — 4 cards (Money / Career / Love / Personal) */}
      <div className="relative z-10 mx-auto mt-24 md:mt-32 max-w-5xl px-4">
        <header className="mb-10 text-center">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.45em] text-arch-primary/80">
            {t.reveal.areasTitle}
          </div>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-foreground/70 leading-relaxed">
            {t.reveal.areasIntro(name)}
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {AREA_ORDER.map((area: LifeArea, i) => (
            <AreaScoreCard
              key={area}
              area={area}
              label={t.reveal.areas[area].label}
              description={t.reveal.areas[area].byArch[arch as "AO" | "SS" | "EA" | "HI"]}
              score={areaScores[area]}
              delayMs={i * 120}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => handleCta("areas")}
            className="group inline-flex items-center gap-3 rounded-full border border-arch-primary/40 bg-arch-primary/10 px-8 py-4 text-sm font-black uppercase tracking-widest text-arch-primary transition-all hover:bg-arch-primary hover:text-background hover:-translate-y-0.5"
          >
            {t.reveal.areasCta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Fold 4 — Comparação ancorada (prova social derivada do arquétipo) */}
      <div className="relative z-10 mx-auto mt-24 md:mt-32 max-w-3xl px-4">
        <div
          className="relative overflow-hidden rounded-3xl border border-arch-primary/30 bg-arch-primary/[0.06] p-8 md:p-12 backdrop-blur-sm"
          style={{ boxShadow: "0 30px 80px -40px var(--arch-glow)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle, var(--arch-glow) 0%, transparent 70%)",
              opacity: 0.4,
            }}
          />
          <div className="relative flex flex-col items-center text-center">
            <div className="font-display text-6xl md:text-8xl font-black leading-none text-arch-primary tabular-nums">
              73<span className="text-3xl md:text-5xl align-top">%</span>
            </div>
            <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/80 leading-relaxed">
              {t.reveal.anchor(a.name)}
            </p>
          </div>
        </div>
      </div>

      {/* Fold 5 — CTA final com timer + garantia */}
      <div className="relative z-10 mx-auto mt-24 md:mt-32 max-w-3xl px-4 text-center">
        {timeLeft > 0 && (
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-arch-primary/40 bg-arch-primary/10 px-5 py-2 text-xs md:text-sm font-bold uppercase tracking-widest text-arch-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arch-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-arch-primary" />
            </span>
            {t.reveal.urgency}
            <span className="font-mono text-base ms-1 tabular-nums">{fmtTimer(timeLeft)}</span>
          </div>
        )}
        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase italic leading-[1.05] tracking-tighter text-foreground">
          {t.reveal.finalTitle(name)}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-foreground/75 leading-relaxed">
          {t.reveal.finalSub}
        </p>
        <button
          onClick={() => handleCta("final")}
          className="group mt-10 inline-flex items-center gap-4 rounded-full px-10 py-5 text-base md:text-lg font-black uppercase tracking-wider text-background transition-all hover:-translate-y-0.5"
          style={{
            backgroundColor: "var(--arch-primary)",
            boxShadow: "0 20px 60px -10px var(--arch-glow)",
          }}
        >
          {t.reveal.finalCta}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="mt-6 text-xs md:text-sm text-foreground/55">{t.reveal.guarantee}</p>
      </div>
      </ArchetypeRevealStage>
    </section>
  );
}

/* --- Sales (9-Block VSL) ----------------------------------------------------------------------------- */

function Sales({
  name,
  arch,
  timeLeft,
  onContinue,
}: {
  name: string;
  arch: Archetype;
  timeLeft: number;
  onContinue: () => void;
}) {
  const { t } = useI18n();
  const a = t.archetypes[arch];
  const s = t.sales;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const featureIcons = [
    <Brain className="h-8 w-8 text-arch-primary" />,
    <CalendarIcon className="h-8 w-8 text-arch-primary" />,
    <CompassIcon className="h-8 w-8 text-arch-primary" />,
    <LineChart className="h-8 w-8 text-arch-primary" />,
  ];

  return (
    <section className="py-12 md:py-24 animate-in fade-in duration-1000">
      <div className="space-y-40">
        {/* --- Block 1: H1 + Promise + Video Placeholder ---------------------- */}
        <div className="text-center max-w-5xl mx-auto px-4">
          <MSection
            className="mb-8 inline-flex items-center gap-3 rounded-xl bg-arch-primary/10 px-4 py-2 border border-arch-primary/20"
          >
            <span className="text-sm font-black uppercase tracking-widest text-arch-primary">
              {s.timer} <span className="font-mono text-xl ml-2">{formatTime(timeLeft)}</span>
            </span>
          </MSection>

          <h1 className="reveal font-display text-[25px] md:text-[50px] font-black uppercase italic leading-[1.1] tracking-tighter">
            {s.h1(
              name,
              (
                <span className="text-arch-primary underline decoration-arch-primary/30 underline-offset-8 italic">
                  {a.name}
                </span>
              ) as any,
            )}
          </h1>

          <p className="reveal mt-12 text-base md:text-xl lg:text-2xl font-medium text-foreground/70 leading-relaxed max-w-3xl mx-auto">
            {s.promise}
          </p>

          {/* Video Placeholder Section */}
          <MSection
            className="mt-20 relative aspect-video w-full rounded-[2.5rem] bg-card border border-border shadow-2xl overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-arch-primary/10 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              <div className="h-24 w-24 rounded-full bg-arch-primary flex items-center justify-center shadow-[0_0_50px_var(--arch-glow)] transition-transform group-hover:scale-110">
                <div className="ml-2 h-0 w-0 border-y-[15px] border-y-transparent border-l-[25px] border-l-primary-foreground" />
              </div>
              <span className="text-xl font-black uppercase tracking-[0.2em] text-foreground/80">
                {s.videoPlaceholder}
              </span>
            </div>
            {/* Visual sound waves decor */}
            <div className="absolute bottom-10 left-10 flex items-end gap-1 opacity-20">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-arch-primary rounded-full animate-pulse"
                  style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </MSection>
        </div>

        {/* --- Block 2: Pain Mirror ------------------------------------------- */}
        <MSection
          className="rounded-[4rem] border border-white/5 bg-white/[0.02] md:backdrop-blur-2xl p-8 md:p-24 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden max-w-6xl mx-auto"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] -rotate-12 translate-x-24 -translate-y-24">
            <Brain size={600} className="text-white" />
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-display text-[26px] md:text-[50px] font-black uppercase italic text-foreground mb-8 leading-[35px] md:leading-[60px] tracking-[-2.5px] md:tracking-[-3.9px]">
                {s.painBlock.title}
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-foreground/70 leading-relaxed mb-10">
                {s.painBlock.body}
              </p>
              <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-arch-primary">
                <div className="h-px flex-1 bg-arch-primary/30" />
                <span>{s.painBlock.conclusion}</span>
                <div className="h-px flex-1 bg-arch-primary/30" />
              </div>
            </div>
            <div className="grid gap-4">
              {s.painBlock.bullets.map((b, i) => (
                <MSection
                  key={i}
                  className="flex gap-4 items-start p-6 rounded-2xl bg-background/50 border border-border/50"
                >
                  <div className="h-6 w-6 rounded-full bg-arch-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={14} className="text-arch-primary" />
                  </div>
                  <span className="text-lg font-medium leading-tight">{b}</span>
                </MSection>
              ))}
            </div>
          </div>
        </MSection>

        {/* Mid-CTA after Pain Mirror */}
        <div className="text-center">
          <PrimaryButton onClick={onContinue} size="lg" icon={<ArrowRight size={20} />}>
            {t.plans.chooseCta}
          </PrimaryButton>
        </div>

        {/* --- Block 3: Scientific Proof -------------------------------------- */}
        <div className="text-center max-w-5xl mx-auto relative px-6">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-full h-[600px] bg-arch-glow blur-[12px] lg:blur-[140px] opacity-10 -z-10" />
          <div className="inline-flex items-center justify-center h-32 w-32 rounded-[2.5rem] bg-white/5 border border-white/10 mb-12 shadow-2xl md:backdrop-blur-xl">
            <ShieldCheck className="h-16 w-16 text-arch-primary animate-pulse" />
          </div>
          <h3 className="font-display text-4xl md:text-8xl font-black mb-12 leading-[0.95] tracking-tighter uppercase italic">
            {s.science.title}
          </h3>
          <div className="space-y-12 text-lg md:text-xl lg:text-2xl text-foreground/70 leading-relaxed font-medium tracking-tight">
            <p>{s.science.body}</p>
            <p className="text-sm font-black uppercase tracking-[0.5em] text-arch-primary/40">
              {s.science.references}
            </p>
            <div className="pt-16 border-t border-white/5">
              <p className="text-foreground font-black text-4xl md:text-6xl mb-10 tracking-tighter italic uppercase">
                {s.science.pivot}
              </p>
              <div className="relative inline-block">
                <p
                  className="text-arch-primary font-black text-5xl md:text-9xl tracking-[-0.05em] uppercase italic"
                >
                  {s.science.solution}
                </p>
                <div className="absolute -inset-4 bg-arch-primary/10 blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Block 4: Product Grid (4D Features) ----------------------------- */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {s.features.map((f, i) => (
            <MSection
              key={i}
              className="group rounded-[3rem] border border-white/5 bg-card/40 p-12 transition-all md:backdrop-blur-xl hover:border-arch-primary/30 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">
                {featureIcons[i]}
              </div>
              <div className="mb-10 h-20 w-20 rounded-2xl bg-background border border-border flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-arch-primary group-hover:text-primary-foreground group-hover:border-arch-primary shadow-xl">
                {featureIcons[i]}
              </div>
              <h4 className="font-display text-3xl font-black mb-6 tracking-tight uppercase italic">
                {f.title}
              </h4>
              <p className="text-foreground/70 text-base md:text-lg leading-relaxed font-medium">
                {f.description}
              </p>
            </MSection>
          ))}
        </div>

        {/* --- Block 4.5: Social Proof / Testimonials ------------------------- */}
        <Testimonials />

        {/* ── Block 8: Final CTA + Guarantee ───────────────────────── */}
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Guarantee Section */}
          <MSection
            className="flex flex-col md:flex-row items-center gap-10 p-10 md:p-16 rounded-[3rem] border border-border bg-background shadow-xl"
          >
            <div className="h-32 w-32 shrink-0 bg-arch-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck size={64} className="text-arch-primary" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-display text-2xl md:text-3xl font-black italic uppercase mb-4 tracking-tight">{s.guarantee.title}</h4>
              <p className="text-base md:text-lg text-foreground/70 leading-relaxed font-medium">
                {s.guarantee.body}
              </p>
            </div>
          </MSection>

          <MSection
            className="text-center rounded-[5rem] border border-white/10 bg-white/5 p-12 md:p-32 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden md:backdrop-blur-3xl group"
          >
            {/* Animated Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-arch-primary/20 via-transparent to-arch-primary/5 opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-arch-primary/10 blur-[10px] lg:blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-arch-primary/10 blur-[10px] lg:blur-[100px] animate-pulse [animation-delay:2s]" />

            <div className="relative z-10">
              <h3 className="font-display text-4xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[1.02] pt-2 uppercase italic">
                {s.ctaFinal.title}
              </h3>
              <p className="text-base md:text-xl lg:text-2xl text-foreground/70 mb-16 max-w-3xl mx-auto font-medium tracking-tight leading-relaxed">
                {s.ctaFinal.subtitle}
              </p>

              <PrimaryButton
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="xl"
                className="italic h-28 md:h-32 px-12 md:px-20 text-3xl md:text-4xl"
                icon={<ArrowRight size={40} className="text-arch-primary ml-4" />}
              >
                 {t.salesCta.discoverArchetype}
              </PrimaryButton>

              <div className="mt-16 flex items-center justify-center gap-8">
                <div className="flex items-center gap-3 text-background/40 font-black uppercase tracking-[0.3em] text-xs">
                  <Lock size={14} />
                  <span>{s.ctaFinal.trust}</span>
                </div>
              </div>
            </div>
          </MSection>
        </div>
      </div>
    </section>
  );
}

/* ── Plans ─────────────────────────────── */

function Plans({
  email,
  displayName,
  leadId,
  timeLeft,
}: {
  email: string;
  displayName: string;
  leadId: string | null;
  timeLeft: number;
}) {
  const { t, currency, lang } = useI18n();
  const startCheckout = useStubCheckout();
  const [busy, setBusy] = useState<PlanKey | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const plans: PlanKey[] = ["30d", "6m", "1y"];
  const f = t.plans.features;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  async function choose(p: PlanKey) {
    setErr(null);
    setBusy(p);
    try {
      const res = await startCheckout({
        data: {
          plan: p,
          currency,
          lead_id: leadId ?? undefined,
          email,
          display_name: displayName || undefined,
          lang,
          origin: window.location.origin,
        },
      });
      if (res?.url) window.location.href = res.url;
      else throw new Error("Stripe session creation failed");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(null);
    }
  }

  const baseMonthlyPrice = PRICES[currency]["30d"];

  return (
    <section className="py-12 md:py-32 max-w-7xl mx-auto px-4">
      <div className="text-center mb-20">
        {timeLeft > 0 && (
          <div
            className="mb-8 inline-flex items-center gap-3 rounded-xl bg-arch-primary/10 px-5 py-2.5 border border-arch-primary/20"
          >
            <span className="text-sm font-black uppercase tracking-widest text-arch-primary">
              {t.sales.timer} <span className="font-mono text-xl ml-2">{formatTime(timeLeft)}</span>
            </span>
          </div>
        )}
        <h2 className="reveal font-display text-4xl font-extrabold md:text-7xl mb-6">
          {t.plans.title}
        </h2>
        <p className="reveal mt-4 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t.plans.sub}
        </p>
      </div>

      {err && (
        <div
          className="mb-10 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-center font-bold"
        >
          {err}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((p, i) => {
          const total = PRICES[currency][p];
          const popular = p === "6m";

          let discountStr = null;
          if (p === "6m") {
            const savings = Math.round((1 - total / (baseMonthlyPrice * 6)) * 100);
            discountStr = `${t.plans.mostPopular} — ↓${savings}%`;
          } else if (p === "1y") {
            const savings = Math.round((1 - total / (baseMonthlyPrice * 12)) * 100);
            discountStr = `↓${savings}%`;
          }

          return (
            <MSection
              key={p}
              className={`relative flex flex-col rounded-[3.5rem] border bg-card/50 p-12 transition-all md:backdrop-blur-3xl ${
                popular
                  ? "border-arch-primary shadow-[0_40px_100px_-20px_var(--arch-glow)] md:scale-110 z-10"
                  : "border-white/5 hover:border-arch-primary/30"
              }`}
            >
              {popular && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-arch-primary px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground shadow-2xl">
                  {t.plans.mostPopular}
                </div>
              )}

              <div className="mb-12 flex-1 text-center">
                <h3 className="font-display text-4xl font-black mb-6 uppercase italic tracking-tighter">
                  {p === "30d" ? t.plans.p30 : p === "6m" ? t.plans.p6m : t.plans.p1y}
                </h3>

                {discountStr && (
                  <div className="inline-block rounded-xl border border-success/30 bg-success/10 px-4 py-1.5 text-xs font-black text-success uppercase tracking-[0.2em] mb-8">
                    {discountStr}
                  </div>
                )}

                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-7xl font-black tracking-tighter text-gradient leading-none">
                    {formatPrice(currency, total)}
                  </span>
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-arch-primary">
                  {t.plans.perDay(pricePerDay(currency, p))}
                </p>
              </div>

              <div className="mb-12 space-y-5 border-t border-white/5 pt-12">
                {[
                  { label: f.diagnosis, check: true },
                  { label: f.matrix, check: true },
                  { label: f.compass, check: true },
                  { label: f.gamification, check: p !== "30d" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 text-lg ${item.check ? "text-foreground font-medium" : "text-muted-foreground line-through opacity-20"}`}
                  >
                    <CheckCircle2
                      className={`h-6 w-6 shrink-0 ${item.check ? "text-arch-primary" : "text-muted-foreground"}`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={busy !== null || !email}
                onClick={() => choose(p)}
                className={`group relative w-full overflow-hidden rounded-3xl py-8 text-2xl font-black italic tracking-tighter transition-all shadow-2xl ${
                  popular
                    ? "bg-foreground text-background"
                    : "border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                } disabled:opacity-20 disabled:scale-100 uppercase`}
              >
                <div className="absolute inset-0 bg-arch-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative z-10">
                  {busy === p ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="h-6 w-6 animate-spin rounded-full border-3 border-current border-t-transparent" />
                      {t.common.processing}
                    </span>
                  ) : (
                    t.plans.chooseCta.toUpperCase()
                  )}
                </span>
              </button>
            </MSection>
          );
        })}
      </div>

      <div className="mt-24 text-center">
        {/* Guarantee Card */}
        <MSection
          className="mb-10 inline-flex flex-col items-center gap-4 rounded-3xl border border-arch-primary/20 bg-arch-primary/5 px-10 py-8"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-arch-primary/10">
            <ShieldCheck className="h-8 w-8 text-arch-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">{t.plansExtra.guarantee7Days}</p>
          <p className="text-sm text-muted-foreground max-w-md">{t.plans.guarantee}</p>
        </MSection>

        {/* Secure Badge */}
        <div className="flex items-center justify-center gap-4 text-sm font-bold text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="uppercase tracking-[0.1em]">{t.plans.secureBadge}</span>
        </div>

        {/* Payment Logos */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-2">
            <span className="text-xs font-bold text-muted-foreground">Visa</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-2">
            <span className="text-xs font-bold text-muted-foreground">Mastercard</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-2">
            <span className="text-xs font-bold text-muted-foreground">Stripe</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Footer ----------------------------------------------------------------------------------------- */

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">© {new Date().getFullYear()} MindReset Inc.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-primary transition">
            {t.common.privacy}
          </Link>
          <Link to="/terms" className="hover:text-primary transition">
            {t.common.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}
