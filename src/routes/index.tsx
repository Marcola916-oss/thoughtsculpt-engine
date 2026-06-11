import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence, useScroll } from "framer-motion";
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
import { PRICES, pricePerDay, formatPrice, type PlanKey } from "../lib/pricing";
import { saveQuizLead } from "../lib/quiz.functions";
import { createCheckoutSession } from "../lib/checkout.functions";
import { useDeviceTier } from "../hooks/use-device-tier";

import { QuizScreenWrapper } from "../components/quiz/QuizScreenWrapper";
import { QuizOption } from "../components/quiz/QuizOption";
import { NeuralLoader } from "../components/quiz/NeuralLoader";
import { staggerContainer, staggerItem } from "../lib/animations";
import { Atmosphere, GlobalAmbient, type AtmosphereFog } from "@/components/atmosphere";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CircuitBrain, ArchetypeRevealArt, CelebrationBrain } from "@/components/identity";
import {
  ProofBar,
  ArchetypeShowcase,
  HowItWorks,
  FeaturesGrid,
  Testimonials,
  FAQ,
  FinalCTA,
  TopBar,
} from "@/components/landing";

const useReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (max-width: 1023px)").matches;
};

let isMobileMotion = false;

const MSection = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  if (isMobileMotion) return <div className={className} {...props}>{children}</div>;
  const { onAnimationStart: _oas, onAnimationEnd: _oae, onDragStart: _ods, onDragEnd: _ode, onDrag: _od, ...rest } = props;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/** Mount animation wrapper — CSS on low tier, Framer Motion on high */
const MFade = ({
  children,
  className,
  delay = 0,
  y = 20,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { delay?: number; y?: number }) => {
  if (isMobileMotion) {
    const delayClass = delay <= 0 ? '' : delay <= 0.2 ? 'hero-fade-delay-1' : delay <= 0.4 ? 'hero-fade-delay-2' : delay <= 0.6 ? 'hero-fade-delay-3' : delay <= 1 ? 'hero-fade-delay-4' : delay <= 1.5 ? 'hero-fade-delay-5' : delay <= 2 ? 'hero-fade-delay-6' : 'hero-fade-delay-7';
    return (
      <div className={`hero-fade ${delayClass} ${className || ''}`} {...props}>
        {children}
      </div>
    );
  }
  const { onAnimationStart: _oas, onAnimationEnd: _oae, onDragStart: _ods, onDragEnd: _ode, onDrag: _od, ...rest } = props;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
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
  | { kind: "plans" };

function LandingAndQuiz() {
  isMobileMotion = useReducedMotion();
  const { t, lang, currency, country } = useI18n();
  const [stage, setStage] = useState<Stage>({ kind: "hero" });

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
        ]);
        if (cancelled) return;
        if (row) {
          setLeadId(row.id);
          setShareToken(row.share_token);
        }
        setStage({ kind: "reveal" });
      } catch (e) {
        if (cancelled) return;
        setLeadError((e as Error).message);
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

    // Smooth transition with staggered feel
    const isLast = stage.index === 7;
    setTimeout(() => {
      setStage(isLast ? { kind: "email" } : { kind: "q", index: stage.index + 1 });
    }, 250);
  }

  useEffect(() => {
    // Scroll with instant behavior to avoid lag on any device
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage.kind]);

  const atmosphereProps = useMemo(() => {
    switch (stage.kind) {
      case "hero":
        return { fog: "dramatic" as const, symbols: "sparse" as const, scan: "subtle" as const };
      case "identity":
      case "q":
      case "email":
        return { fog: "normal" as const, symbols: "off" as const, scan: "subtle" as const };
      case "loader":
      case "reveal":
        return { fog: "dramatic" as const, symbols: "off" as const, scan: "subtle" as const };
      default:
        return { fog: "normal" as const, symbols: "off" as const, scan: "subtle" as const };
    }
  }, [stage.kind]);

  return (
    <div
      className="min-h-screen w-full bg-black text-foreground selection:bg-primary/30 overflow-x-hidden relative"
      data-arch={archCode || undefined}
    >
      <div className="noise-overlay pointer-events-none z-0" />
      
      {/* Persistent Atmosphere - stays mounted across stage changes for performance */}
      {stage.kind === "hero" ? (
        <GlobalAmbient />
      ) : (
        <Atmosphere {...atmosphereProps} pinned withAmbient={true} className="fixed inset-0 z-[-1] pointer-events-none" />
      )}
      
      <TopBar />

      <main className="w-full px-0 sm:px-4 pb-24 pt-16 md:pt-12 relative z-10">
        <AnimatePresence mode="wait">
          {stage.kind === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative z-10">
                <Hero onStart={() => setStage({ kind: "identity" })} />
              </div>
              <div className="relative z-10 bg-black shadow-[0_-50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                <ProofBar />
                <div className="bg-black">
                  <ArchetypeShowcase />
                  <HowItWorks />
                </div>
                <div className="bg-black">
                  <FeaturesGrid />
                  <Testimonials />
                </div>
                <FAQ onCta={() => setStage({ kind: "identity" })} />
                <FinalCTA onCta={() => setStage({ kind: "identity" })} />
          </div>
        </motion.div>
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
                  stage.index === 0
                    ? setStage({ kind: "identity" })
                    : setStage({ kind: "q", index: stage.index - 1 })
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
                onBack={() => setStage({ kind: "q", index: 7 })}
                progressTitle={t.quizProgress.email}
              >
                <EmailCapture
                  name={name}
                  email={email}
                  setEmail={setEmail}
                  gdpr={gdpr}
                  setGdpr={setGdpr}
                  onSubmit={() => setStage({ kind: "loader" })}
                />
              </QuizScreenWrapper>
            </div>
          )}

          {stage.kind === "loader" && (
            <div className="relative z-10">
              <NeuralLoader
                key="loader"
                onComplete={() => setStage({ kind: "reveal" })}
                durationMs={3000}
              />
            </div>
          )}

          {stage.kind === "reveal" && archCode && (
            <div className="relative z-10">
              <Reveal
                name={name}
                arch={archCode}
                onContinue={() => setStage({ kind: "sales" })}
                leadError={leadError}
                onRetry={() => {
                  setLeadError(null);
                  setStage({ kind: "loader" });
                }}
              />
            </div>
          )}

          {stage.kind === "sales" && archCode && (
            <motion.div
              key="sales"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Sales
                name={name}
                arch={archCode}
                timeLeft={timerLeft}
                onContinue={() => setStage({ kind: "plans" })}
              />
            </motion.div>
          )}

          {stage.kind === "plans" && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Plans email={email} displayName={name} leadId={leadId} timeLeft={timerLeft} />
            </motion.div>
          )}
        </AnimatePresence>
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black p-4 pb-8 md:pb-4 md:backdrop-blur-xl"
        >
          <button
            onClick={onClick}
            className="w-full rounded-2xl bg-primary py-4 text-base md:text-lg font-black uppercase italic tracking-widest text-primary-foreground shadow-[0_10px_30px_rgba(204,0,0,0.4)] active:scale-[0.98] transition-transform"
          >
            {t.sales.cta}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* --- Hero ------------------------------------------------------------------------------------------- */

function Hero({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <section className="relative pt-20 pb-16 md:pt-[15vh] md:pb-[10vh] min-h-[90vh] flex flex-col justify-center items-center text-center overflow-x-hidden px-4 md:px-6">
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
        <span className="flex items-center gap-2 rounded-full border border-arch-primary/20 bg-arch-primary/5 px-4 py-2 text-xs font-bold text-arch-primary md:backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t.archetypes?.AO?.name || "O Guardador"}
        </span>
      </MFade>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.8, x: 0, y: [0, -18, 0] }}
        transition={{ 
          opacity: { duration: 1 },
          x: { duration: 1 },
          y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 } 
        }}
        className="hidden lg:flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-950/20 px-4 py-2 text-xs font-bold text-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.15)] backdrop-blur-md absolute right-[8%] top-[30%] pointer-events-none select-none"
      >
        <Star className="h-3.5 w-3.5" />
        {t.archetypes?.SS?.name || "O Pav├úo"}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.8, x: 0, y: [0, -15, 0] }}
        transition={{ 
          opacity: { duration: 1 },
          x: { duration: 1 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } 
        }}
        className="hidden lg:flex items-center gap-2 rounded-full border border-slate-500/20 bg-slate-950/20 px-4 py-2 text-xs font-bold text-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.15)] backdrop-blur-md absolute left-[12%] bottom-[20%] pointer-events-none select-none"
      >
        <CompassIcon className="h-3.5 w-3.5" />
        {t.archetypes?.EA?.name || "O Fantasma"}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 0.8, y: [0, -20, 0] }}
        transition={{ 
          opacity: { duration: 1 },
          y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 } 
        }}
        className="hidden lg:flex items-center gap-2 rounded-full border border-red-500/20 bg-red-950/20 px-4 py-2 text-xs font-bold text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] backdrop-blur-md absolute right-[10%] bottom-[18%] pointer-events-none select-none"
      >
        <LineChart className="h-3.5 w-3.5" />
        {t.archetypes?.HI?.name || "O Foguinho"}
      </motion.div>



      <MFade
        delay={0}
        y={-20}
        className="mb-10 inline-flex items-center gap-2 rounded-full bg-black/40 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/90 shadow-2xl md:backdrop-blur-2xl border-white/10 border-2"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arch-primary opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-arch-primary"></span>
        </span>
        {t.hero.kicker}
      </MFade>

      {(() => {
        const headline = t.hero.headline;
        // Fix for i18n issue: find the best word to highlight or use a standard one
        const keywords = ["conhecer", "know", "poznać", "cunoști", "تعرف"];
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

        const headlineClass = "relative mx-auto max-w-6xl font-display text-[7.5vw] sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl font-black leading-[0.95] md:leading-[0.85] tracking-[-0.05em] uppercase italic px-4";

        const highlightSpan = hasKeyword ? (
          <span className="relative inline-block mx-1 md:mx-4 z-10">
            <span className="relative z-10 text-arch-primary drop-shadow-[0_0_20px_var(--arch-glow)] md:drop-shadow-[0_0_35px_var(--arch-glow)]">{keyword}</span>
            {isMobileMotion ? (
              <span className="hero-underline absolute bottom-[10%] left-0 h-[12%] w-full bg-arch-primary/40 -z-10 origin-left blur-[3px]" />
            ) : (
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8, ease: "circOut" }}
                className="absolute bottom-[10%] left-0 h-[12%] w-full bg-arch-primary/40 -z-10 origin-left blur-[3px]"
              />
            )}
          </span>
        ) : null;

        const textSpan = (content: string) => (
          <span className="relative z-10 bg-gradient-to-b from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            {content}
          </span>
        );

        const bgBlur = <div className="absolute inset-x-[-10%] top-1/2 -translate-y-1/2 h-[120%] bg-black/40 blur-[8px] md:blur-[100px] -z-0 pointer-events-none" />;

        const content = (
          <>
            {textSpan(before)}
            {highlightSpan}
            {textSpan(after)}
            {bgBlur}
          </>
        );

        if (isMobileMotion) {
          return (
            <h1 className={`hero-fade hero-fade-delay-2 ${headlineClass}`}>
              {content}
            </h1>
          );
        }
        return (
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className={headlineClass}
          >
            {content}
          </motion.h1>
        );
      })()}

      <MFade
        delay={0.4}
        className="relative mx-auto mt-16 max-w-2xl px-6"
      >
        <div className="absolute inset-0 bg-black/60 blur-[8px] md:blur-[40px] -z-10 scale-150" />
        <p className="relative z-10 text-lg text-white md:text-2xl leading-relaxed font-semibold tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
          {t.hero.sub}
        </p>
      </MFade>

      <MFade
        delay={0.6}
        className="mt-12 md:mt-24 flex flex-col items-center gap-12"
      >
        <Magnetic>
          <button
            onClick={onStart}
            data-cursor="hover"
            className="group relative h-20 md:h-28 w-full max-w-2xl overflow-hidden rounded-full bg-white text-black transition-all hover:scale-[1.03] active:scale-95 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-full bg-arch-primary opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center justify-center gap-6 text-3xl md:text-4xl font-black italic tracking-tighter group-hover:text-white transition-colors">
              {t.hero.cta.toUpperCase()}
              <ArrowRight className="h-10 w-10 transition-transform duration-700 group-hover:translate-x-4" />
            </span>
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
          </button>
        </Magnetic>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-muted-foreground/60">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              <span>{t.hero.trustSsl}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Lock className="h-4 w-4 text-blue-500/50" />
              <span>{t.hero.trustData}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Clock className="h-4 w-4 text-arch-primary/50" />
              <span>{t.hero.trustGuarantee}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            <div className="flex text-arch-primary gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <span>4.9 / 5</span>
          </div>
        </div>
      </MFade>

      {/* Floating Archetype Display */}
      <div className="mt-20 md:mt-40 relative px-4 max-w-7xl mx-auto overflow-visible">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="pt-12 md:pt-20 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 opacity-60 lg:opacity-40 hover:opacity-100 transition-opacity duration-1000">
           {['AO', 'SS', 'EA', 'HI'].map((arch) => (
             <motion.div 
               key={arch}
               whileHover={{ y: -10, scale: 1.05 }}
                className="glass-morphism rounded-3xl lg:rounded-[2.5rem] p-5 md:p-8 border border-white/10 bg-black/40 md:backdrop-blur-xl flex flex-col items-center text-center gap-3 md:gap-4 transition-all hover:border-arch-primary/50 hover:bg-black/60 group shadow-2xl"
             >
               <span className="text-3xl md:text-4xl filter grayscale group-hover:grayscale-0 transition-all">
                 {arch === 'AO' ? '🛡️' : arch === 'SS' ? '👑' : arch === 'EA' ? '👻' : '🔥'}
               </span>
               <div className="space-y-1">
                 <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-arch-primary">{arch}</span>
                 <span className="block text-sm md:text-lg font-bold tracking-tighter text-foreground/80">{t.archetypes?.[arch as 'AO']?.name || arch}</span>
               </div>
             </motion.div>
           ))}
        </div>
      </div>

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
      <h2 className="font-display text-5xl font-black md:text-7xl tracking-tighter uppercase italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
        {t.identity.title}
      </h2>
      <p className="mt-6 text-xl text-muted-foreground leading-relaxed font-medium tracking-tight max-w-xl">
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
              <motion.button
                key={g}
                data-cursor="hover"
                onClick={() => props.setGender(g)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-2xl border px-2 py-4 text-[13px] sm:text-base font-black uppercase tracking-tight italic transition-all ${
                  props.gender === g
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_15px_30px_-10px_var(--accent-glow)] scale-105 z-10"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-secondary/40"
                }`}
              >
                {g === "m" ? t.common.male : g === "f" ? t.common.female : t.common.neutral}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        disabled={!ok}
        data-cursor="hover"
        onClick={props.onContinue}
        whileHover={ok ? { scale: 1.02, boxShadow: "0 20px 40px -10px var(--accent-glow)" } : {}}
        whileTap={ok ? { scale: 0.98 } : {}}
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
      </motion.button>
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
      <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl mb-3">
        {q.q.replace("[NOME]", props.name)}
      </h2>
      <p className="text-muted-foreground mb-8 text-base">{t.questions.intro(props.name)}</p>

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
      <h2 className="font-display text-2xl font-extrabold md:text-4xl">
        {t.emailCapture.title(props.name)}
      </h2>
      <p className="mt-3 text-base text-muted-foreground leading-relaxed">{t.emailCapture.sub}</p>

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
  onContinue,
  leadError,
  onRetry,
}: {
  name: string;
  arch: Archetype;
  onContinue: () => void;
  leadError: string | null;
  onRetry: () => void;
}) {
  const { t } = useI18n();
  const a = t.archetypes[arch];
  const [text, setText] = useState("");

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
    <section className="py-12 md:py-40 overflow-hidden relative bg-black">
      <div className="absolute inset-0 bg-arch-glow blur-[12px] lg:blur-[160px] opacity-20 -z-10" />
      <div className="absolute inset-0 bg-black/80 -z-[5]" />
      <div className="text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
          className="mb-10 inline-block rounded-full bg-white/5 border border-white/10 px-8 py-3 text-xs font-black uppercase tracking-[0.5em] text-arch-primary shadow-2xl md:backdrop-blur-xl"
        >
          {t.reveal.kicker(name)}
        </motion.div>

        {/* CircuitBrain — archetype-colored, maximum impact moment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.3 }}
          className="mb-8 flex justify-center"
        >
          <ArchetypeRevealArt 
            size={isMobileMotion ? 300 : 540} 
            archetype={arch}
            className="animate-in zoom-in-50 duration-1000 ease-out drop-shadow-[0_0_50px_var(--arch-glow)]"
          />
        </motion.div>

        {/* Archetype icon emerging from brain */}
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 100 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
        >
           <div className="h-20 w-20 rounded-full bg-black/80 backdrop-blur-md border border-arch-primary/30 flex items-center justify-center shadow-[0_0_40px_var(--arch-glow)]">
             <ArchetypeIcon arch={arch} className="h-10 w-10 text-arch-primary" />
           </div>
        </motion.div>

        <h1 className="mt-4 font-display text-5xl sm:text-6xl md:text-[10rem] font-black leading-[0.85] text-foreground tracking-tighter uppercase italic overflow-hidden max-w-full relative">
          {/* Cinema explosion background */}
          <div className="absolute inset-0 -z-10 bg-arch-primary/10 blur-[100px] animate-pulse" />
          <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, var(--arch-primary) 0%, #FFFFFF 100%)' }}>{text}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-arch-primary ml-[-0.05em]"
          >
            _
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mx-auto mt-12 max-w-3xl text-3xl md:text-5xl font-black text-foreground tracking-tighter uppercase italic"
        >
          {a.tagline}
        </motion.p>
      </div>

      {leadError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-12 max-w-2xl rounded-2xl border border-primary/40 bg-primary/5 p-6 md:backdrop-blur-md"
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
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-32 max-w-5xl rounded-[4rem] border border-white/5 bg-card/40 p-10 md:p-24 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden md:backdrop-blur-3xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-arch-primary to-transparent" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-arch-primary/10 blur-[10px] lg:blur-[100px]" />

        <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-32 rounded-[2.5rem] bg-background border-2 border-arch-primary flex items-center justify-center text-5xl shadow-[0_20px_40px_-10px_var(--arch-glow)] z-20">
          🔒
        </div>

        <p className="mb-16 text-center font-display text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter uppercase italic">
          {t.reveal.sub}
        </p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6"
        >
          {a.hooks.map((h, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="flex gap-8 rounded-[2.5rem] border border-white/5 bg-background/50 p-8 md:p-12 transition-all hover:border-arch-primary/40 group relative overflow-hidden"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-arch-primary/10 text-arch-primary font-black text-2xl group-hover:bg-arch-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl border border-arch-primary/20">
                {i + 1}
              </div>
              <p className="text-2xl text-foreground font-medium leading-relaxed tracking-tight self-center">
                {h}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="group relative mt-24 w-full overflow-hidden rounded-3xl bg-foreground py-10 text-3xl font-black italic tracking-tighter text-background transition-all shadow-2xl"
        >
          <div className="absolute inset-0 overflow-hidden rounded-3xl bg-arch-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="relative z-10 flex items-center justify-center gap-6">
            {t.reveal.cta.toUpperCase()}
            <ArrowRight
              size={40}
              className="transition-transform duration-500 group-hover:translate-x-4"
            />
          </span>
        </motion.button>
      </motion.div>
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

          {isMobileMotion ? (
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] md:text-8xl tracking-tighter">
              {s.h1(
                name,
                (
                  <span className="text-arch-primary underline decoration-arch-primary/30 underline-offset-8 italic">
                    {a.name}
                  </span>
                ) as any,
              )}
            </h1>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl font-extrabold leading-[1.1] md:text-8xl tracking-tighter"
            >
              {s.h1(
                name,
                (
                  <span className="text-arch-primary underline decoration-arch-primary/30 underline-offset-8 italic">
                    {a.name}
                  </span>
                ) as any,
              )}
            </motion.h1>
          )}

          {isMobileMotion ? (
            <p className="mt-12 text-xl md:text-3xl font-medium text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {s.promise}
            </p>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-xl md:text-3xl font-medium text-muted-foreground leading-relaxed max-w-3xl mx-auto"
            >
              {s.promise}
            </motion.p>
          )}

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
              <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-8 leading-tight tracking-tighter">
                {s.painBlock.title}
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10">
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
          <div className="space-y-12 text-2xl md:text-3xl text-muted-foreground leading-relaxed font-medium tracking-tight">
            <p>{s.science.body}</p>
            <p className="text-sm font-black uppercase tracking-[0.5em] text-arch-primary/40">
              {s.science.references}
            </p>
            <div className="pt-16 border-t border-white/5">
              <p className="text-foreground font-black text-4xl md:text-6xl mb-10 tracking-tighter italic uppercase">
                {s.science.pivot}
              </p>
              <div className="relative inline-block">
                <motion.p
                  animate={{
                    scale: [1, 1.02, 1],
                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                  }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="text-arch-primary font-black text-5xl md:text-9xl tracking-[ -0.05em] uppercase italic"
                >
                  {s.science.solution}
                </motion.p>
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
              <p className="text-muted-foreground text-xl leading-relaxed font-medium">
                {f.description}
              </p>
            </MSection>
          ))}
        </div>

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
              <h4 className="text-3xl font-black mb-4 tracking-tight">{s.guarantee.title}</h4>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
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
              <h3 className="font-display text-4xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[0.9] uppercase italic">
                {s.ctaFinal.title}
              </h3>
              <p className="text-xl md:text-3xl text-muted-foreground mb-16 max-w-3xl mx-auto font-medium tracking-tight leading-relaxed">
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
  const startCheckout = useServerFn(createCheckoutSession);
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 inline-flex items-center gap-3 rounded-xl bg-arch-primary/10 px-5 py-2.5 border border-arch-primary/20"
          >
            <span className="text-sm font-black uppercase tracking-widest text-arch-primary">
              {t.sales.timer} <span className="font-mono text-xl ml-2">{formatTime(timeLeft)}</span>
            </span>
          </motion.div>
        )}
        {isMobileMotion ? (
          <h2 className="font-display text-4xl font-extrabold md:text-7xl mb-6">
            {t.plans.title}
          </h2>
        ) : (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-extrabold md:text-7xl mb-6"
          >
            {t.plans.title}
          </motion.h2>
        )}
        {isMobileMotion ? (
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.plans.sub}
          </p>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t.plans.sub}
          </motion.p>
        )}
      </div>

      {err && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-center font-bold"
        >
          {err}
        </motion.div>
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

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
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
              </motion.button>
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
    <footer className="mt-12 border-t border-border bg-card">
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
