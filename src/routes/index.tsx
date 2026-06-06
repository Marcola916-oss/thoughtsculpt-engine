import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";

import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  ChevronDown
} from "lucide-react";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Magnetic } from "../components/PageTransition";
import { useMousePosition } from "../hooks/use-mouse-position";
import { scoreAnswers, type Answers, type Archetype } from "../lib/quiz/scoring";
import { PRICES, pricePerDay, formatPrice, type PlanKey } from "../lib/pricing";
import { saveQuizLead } from "../lib/quiz.functions";
import { createCheckoutSession } from "../lib/checkout.functions";

import { QuizScreenWrapper } from "../components/quiz/QuizScreenWrapper";
import { QuizOption } from "../components/quiz/QuizOption";
import { NeuralLoader } from "../components/quiz/NeuralLoader";
import { staggerContainer, staggerItem } from "../lib/animations";
import { Atmosphere } from "@/components/atmosphere/Atmosphere";
import { AchievementUnlock } from "@/components/gamification/AchievementUnlock";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-arch-primary origin-left shadow-[0_0_10px_var(--arch-glow)]"
      style={{ scaleX: scrollYProgress, opacity: scrollYProgress }}
    />
  );
}


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

function BentoCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  useMousePosition(ref);

  return (
    <div ref={ref} className={`bento-card ${className}`}>
      {children}
    </div>
  );
}


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
  const { t, lang, currency, country } = useI18n();
  const [stage, setStage] = useState<Stage>({ kind: "hero" });
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
    const interval = setInterval(() => setTimerLeft(t => t - 1), 1000);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage.kind]);

  return (
    <div 
      className="min-h-screen w-full bg-[#000000] text-foreground selection:bg-primary/30 overflow-x-hidden relative"
      data-arch={archCode || undefined}
    >
      <div className="noise-overlay pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,_var(--arch-glow),transparent_70%)] opacity-30 pointer-events-none" />

      <ScrollProgress />
      <TopBar />

      
      <main className="w-full px-4 pb-24 pt-4 md:pt-12 relative z-10">
        <AnimatePresence mode="wait">
          {stage.kind === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Atmosphere fog="dramatic" symbols="sparse" scan="subtle" pinned>
                <Hero onStart={() => setStage({ kind: "identity" })} />
                <Features />
              </Atmosphere>
            </motion.div>
          )}

          {stage.kind === "identity" && (
            <Atmosphere fog="subtle" symbols="off" scan="subtle" pinned>
              <QuizScreenWrapper
                stepKey="identity"
                progress={0}
                onBack={undefined}
                progressTitle="Identificação"
              >
                <Identity
                  name={name}
                  setName={setName}
                  gender={gender}
                  setGender={setGender}
                  onContinue={() => setStage({ kind: "q", index: 0 })}
                />
              </QuizScreenWrapper>
            </Atmosphere>
          )}

          {stage.kind === "q" && (
            <Atmosphere fog="subtle" symbols="sparse" scan="subtle" pinned>
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
            </Atmosphere>
          )}

          {stage.kind === "email" && (
            <Atmosphere fog="normal" symbols="off" scan="subtle" pinned>
              <QuizScreenWrapper
                stepKey="email"
                progress={90}
                onBack={() => setStage({ kind: "q", index: 7 })}
                progressTitle="Finalização"
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
            </Atmosphere>
          )}

          {stage.kind === "loader" && (
            <Atmosphere fog="dramatic" symbols="off" scan="subtle" pinned>
              <NeuralLoader
                key="loader"
                onComplete={() => setStage({ kind: "reveal" })}
                durationMs={3000}
              />
            </Atmosphere>
          )}

          {stage.kind === "reveal" && archCode && (
            <Atmosphere fog="dramatic" symbols="sparse" scan="subtle" pinned>
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
              >
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
              </motion.div>
            </Atmosphere>
          )}

          {stage.kind === "sales" && archCode && (
            <motion.div
              key="sales"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Sales name={name} arch={archCode} timeLeft={timerLeft} onContinue={() => setStage({ kind: "plans" })} />
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
      setVisible(window.scrollY > 1200);
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
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 p-4 backdrop-blur-lg"
        >
          <button
            onClick={onClick}
            className="w-full rounded-full bg-arch-primary py-4 text-lg font-bold text-primary-foreground shadow-[0_0_20px_var(--arch-glow)]"
          >
            {t.sales.cta}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── TopBar ──────────────────────────────────────────────── */

function TopBar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
        scrolled 
          ? "bg-background/60 backdrop-blur-2xl border-b border-white/5 py-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-3 font-display text-3xl font-black tracking-tighter">
          <div className="h-10 w-10 rounded-xl bg-arch-primary flex items-center justify-center transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 shadow-[0_0_20px_var(--arch-glow)]">
            <span className="text-white text-2xl italic font-black">M</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-white transition-colors group-hover:text-arch-primary">Mind</span>
            <span className="text-arch-primary/80 transition-colors group-hover:text-white">Reset</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8">
            <LanguageSwitcher />
          </div>
          <Link
            to="/login"
            data-cursor="hover"
            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-white/5 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-foreground/80 border border-white/5 transition-all hover:bg-white/10 hover:border-white/10"
          >
            <span className="relative z-10">{t.common.login}</span>
            <div className="absolute inset-0 translate-y-[100%] bg-arch-primary transition-transform duration-300 group-hover:translate-y-0" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────── */

/* ─── Hero ────────────────────────────────────────────────── */

function Hero({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <section className="relative pt-24 pb-12 md:pt-48 md:pb-40 text-center overflow-hidden">
      {/* Dynamic Aura Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_0%,_var(--arch-glow),transparent_50%)] opacity-40 blur-[100px]" />
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-arch-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-arch-primary/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      {/* Stats Badges */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 flex flex-wrap justify-center gap-4"
      >
        <div className="glass-morphism rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-arch-primary flex items-center gap-2 border border-arch-primary/20 shadow-[0_0_20px_rgba(var(--arch-primary-rgb),0.1)]">
          <span className="flex h-2 w-2 rounded-full bg-arch-primary animate-ping" />
          {t.hero.kicker}
        </div>
        <div className="glass-morphism rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 flex items-center gap-2 border border-white/5">
          <Star className="h-3 w-3 fill-arch-primary text-arch-primary" />
          4.9/5 Avaliação média
        </div>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-6xl font-display text-5xl font-black leading-[0.9] tracking-[-0.05em] md:text-[9.5rem] uppercase italic"
      >
        <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
          {t.hero.headline.split('conhecer')[0]}
        </span>
        <span className="relative inline-block mx-4">
          <span className="relative z-10 text-arch-primary">conhecer</span>
          <motion.span 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8, ease: "circOut" }}
            className="absolute bottom-[5%] left-0 h-[10%] w-full bg-arch-primary/40 -z-0 origin-left"
          />
        </span>
        <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
          {t.hero.headline.split('conhecer')[1]}
        </span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="mx-auto mt-16 max-w-2xl text-lg text-muted-foreground md:text-2xl leading-relaxed font-medium tracking-tight px-6"
      >
        {t.hero.sub}
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mt-24 flex flex-col items-center gap-12"
      >
        <Magnetic>
          <button
            onClick={onStart}
            data-cursor="hover"
            className="group relative h-28 w-full max-w-2xl overflow-hidden rounded-full bg-white text-black transition-all hover:scale-[1.03] active:scale-95 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-full bg-arch-primary opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center justify-center gap-6 text-3xl md:text-4xl font-black italic tracking-tighter group-hover:text-white transition-colors">
              {t.hero.cta.toUpperCase()}
              <ArrowRight className="h-10 w-10 transition-transform duration-700 group-hover:translate-x-4" />
            </span>
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
          </button>
        </Magnetic>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-muted-foreground/50">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-emerald-500/50" />
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Lock className="h-4 w-4 text-blue-500/50" />
              <span>Dados Protegidos</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Clock className="h-4 w-4 text-arch-primary/50" />
              <span>7 dias garantia</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 className="h-4 w-4 text-emerald-500/50" />
              <span>Sem dados bancários</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Archetype Display */}
      <div className="mt-40 relative px-4 max-w-7xl mx-auto overflow-visible">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 opacity-40 hover:opacity-100 transition-opacity duration-1000">
           {['AO', 'SS', 'EA', 'HI'].map((arch) => (
             <motion.div 
               key={arch}
               whileHover={{ y: -10, scale: 1.05 }}
               className="glass-morphism rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center text-center gap-4 transition-all hover:border-arch-primary/30 group"
             >
               <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">
                 {arch === 'AO' ? '🛡️' : arch === 'SS' ? '👑' : arch === 'EA' ? '👻' : '⚡'}
               </span>
               <div className="space-y-1">
                 <span className="block text-[10px] font-black uppercase tracking-widest text-arch-primary">{arch}</span>
                 <span className="block text-lg font-bold tracking-tighter text-foreground/80">{t.archetypes?.[arch as 'AO']?.name || arch}</span>
               </div>
             </motion.div>
           ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="mt-32 opacity-20"
      >
        <ChevronDown className="mx-auto h-6 w-6 animate-bounce text-arch-primary" />
      </motion.div>
    </section>
  );
}


function Features() {
  const { t } = useI18n();
  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl text-gradient">
          {t.features?.title || "Engineered for deep transformation"}
        </h2>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          {t.features?.subtitle || "More than a test. A precision instrument for your subconscious."}
        </p>
      </div>

      <div className="bento-grid">
        <BentoCard className="md:col-span-2">
          <Brain className="h-10 w-10 text-arch-primary mb-4" />
          <h3 className="text-2xl font-bold mb-2">Neural Pattern Analysis</h3>
          <p className="text-muted-foreground">
            Our AI engine decodes the microscopic language patterns in your choices to map your financial identity with 98% accuracy.
          </p>
        </BentoCard>

        <BentoCard>
          <ShieldCheck className="h-10 w-10 text-arch-primary mb-4" />
          <h3 className="text-2xl font-bold mb-2">Privacy First</h3>
          <p className="text-muted-foreground">
            No bank linking. No data selling. Your psychological profile is encrypted and remains yours.
          </p>
        </BentoCard>

        <BentoCard>
          <LineChart className="h-10 w-10 text-arch-primary mb-4" />
          <h3 className="text-2xl font-bold mb-2">Real-time Evolution</h3>
          <p className="text-muted-foreground">
            Track how your patterns change as you implement the personalized resets.
          </p>
        </BentoCard>

        <BentoCard className="md:col-span-2">
          <CompassIcon className="h-10 w-10 text-arch-primary mb-4" />
          <h3 className="text-2xl font-bold mb-2">Life Path Mapping</h3>
          <p className="text-muted-foreground">
            Go beyond money. Understand how your archetype influences your career, relationships, and health.
          </p>
        </BentoCard>
      </div>
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
      <h2 className="font-display text-5xl font-black md:text-7xl tracking-tighter uppercase italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">{t.identity.title}</h2>
      <p className="mt-6 text-xl text-muted-foreground leading-relaxed font-medium tracking-tight max-w-xl">{t.identity.sub}</p>


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
                className={`rounded-2xl border px-4 py-4 text-base font-black uppercase tracking-tighter italic transition-all ${
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
          <ArrowRight size={22} className="transition-transform duration-500 group-hover:translate-x-2" />
        </span>
      </motion.button>
    </div>
  );
}

/* ─── QuestionScreen ──────────────────────────────────────── */

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
      <p className="text-muted-foreground mb-8 text-base">
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

/* ─── EmailCapture ────────────────────────────────────────── */

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
      <p className="mt-3 text-base text-muted-foreground leading-relaxed">
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

        <PrimaryButton
          type="submit"
          disabled={!valid}
          fullWidth
          size="lg"
          className="mt-4"
        >
          {t.emailCapture.cta} →
        </PrimaryButton>
      </form>
    </div>
  );
}

/* ─── Reveal ──────────────────────────────────────────────── */

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
    <section className="py-12 md:py-40 overflow-hidden relative">
      <div className="absolute inset-0 bg-arch-glow blur-[160px] opacity-20 -z-10" />
      <div className="text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
          className="mb-10 inline-block rounded-full bg-white/5 border border-white/10 px-8 py-3 text-xs font-black uppercase tracking-[0.5em] text-arch-primary shadow-2xl backdrop-blur-xl"
        >
          {t.reveal.kicker(name)}
        </motion.div>
        
        <h1 className="mt-4 font-display text-7xl font-black leading-[0.85] text-foreground md:text-[14rem] tracking-tighter uppercase italic">
          <span className="text-arch-primary text-gradient">{text}</span>
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
          className="mx-auto mt-12 max-w-2xl rounded-2xl border border-primary/40 bg-primary/5 p-6 backdrop-blur-md"
        >
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">!</div>
            <div>
              <p className="font-black uppercase tracking-wider text-primary">{t.reveal.errorTitle}</p>
              <p className="mt-1 text-muted-foreground leading-relaxed">{leadError}. {t.reveal.errorBody}</p>
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
        className="mx-auto mt-32 max-w-5xl rounded-[4rem] border border-white/5 bg-card/40 p-10 md:p-24 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-3xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-arch-primary to-transparent" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-arch-primary/10 blur-[100px]" />
        
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-32 rounded-[2.5rem] bg-background border-2 border-arch-primary flex items-center justify-center text-5xl shadow-[0_20px_40px_-10px_var(--arch-glow)] z-20">
          🎯
        </div>
        
        <p className="mb-16 text-center font-display text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter uppercase italic">{t.reveal.sub}</p>
        
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
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-8xl font-black italic pointer-events-none">{i+1}</div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-arch-primary/10 text-arch-primary font-black text-2xl group-hover:bg-arch-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl border border-arch-primary/20">
                {i + 1}
              </div>
              <p className="text-2xl text-foreground font-medium leading-relaxed tracking-tight self-center">{h}</p>
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
            <ArrowRight size={40} className="transition-transform duration-500 group-hover:translate-x-4" />
          </span>
        </motion.button>
      </motion.div>
    </section>
  );
}

/* ─── Sales (9-Block VSL) ────────────────────────────────── */


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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const featureIcons = [
    <Brain className="h-8 w-8 text-arch-primary" />,
    <CalendarIcon className="h-8 w-8 text-arch-primary" />,
    <CompassIcon className="h-8 w-8 text-arch-primary" />,
    <LineChart className="h-8 w-8 text-arch-primary" />
  ];

  return (
    <section className="py-12 md:py-24 animate-in fade-in duration-1000">
      <div className="space-y-40">

        {/* ── Block 1: H1 + Promise + Video Placeholder ────────────────────── */}
        <div className="text-center max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-3 rounded-xl bg-arch-primary/10 px-4 py-2 border border-arch-primary/20"
          >
            <span className="text-sm font-black uppercase tracking-widest text-arch-primary">
              {s.timer} <span className="font-mono text-xl ml-2">{formatTime(timeLeft)}</span>
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-extrabold leading-[1.1] md:text-8xl tracking-tighter"
          >
            {s.h1(name, <span className="text-arch-primary underline decoration-arch-primary/30 underline-offset-8 italic">{a.name}</span> as any)}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-xl md:text-3xl font-medium text-muted-foreground leading-relaxed max-w-3xl mx-auto"
          >
            {s.promise}
          </motion.p>

          {/* Video Placeholder Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-20 relative aspect-video w-full rounded-[2.5rem] bg-card border border-border shadow-2xl overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-arch-primary/10 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              <div className="h-24 w-24 rounded-full bg-arch-primary flex items-center justify-center shadow-[0_0_50px_var(--arch-glow)] transition-transform group-hover:scale-110">
                <div className="ml-2 h-0 w-0 border-y-[15px] border-y-transparent border-l-[25px] border-l-primary-foreground" />
              </div>
              <span className="text-xl font-black uppercase tracking-[0.2em] text-foreground/80">{s.videoPlaceholder}</span>
            </div>
            {/* Visual sound waves decor */}
            <div className="absolute bottom-10 left-10 flex items-end gap-1 opacity-20">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="w-1 bg-arch-primary rounded-full animate-pulse" style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Block 2: Pain Mirror ─────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="rounded-[4rem] border border-white/5 bg-white/[0.02] backdrop-blur-2xl p-8 md:p-24 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden max-w-6xl mx-auto"
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
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 items-start p-6 rounded-2xl bg-background/50 border border-border/50"
                >
                  <div className="h-6 w-6 rounded-full bg-arch-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={14} className="text-arch-primary" />
                  </div>
                  <span className="text-lg font-medium leading-tight">{b}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mid-CTA after Pain Mirror */}
        <div className="text-center">
          <PrimaryButton
            onClick={onContinue}
            size="lg"
            icon={<ArrowRight size={20} />}
          >
            {t.plans.chooseCta}
          </PrimaryButton>
        </div>

        {/* ── Block 3: Scientific Proof ────────────────── */}
        <div className="text-center max-w-5xl mx-auto relative px-6">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-full h-[600px] bg-arch-glow blur-[140px] opacity-10 -z-10" />
          <div className="inline-flex items-center justify-center h-32 w-32 rounded-[2.5rem] bg-white/5 border border-white/10 mb-12 shadow-2xl backdrop-blur-xl">
            <ShieldCheck className="h-16 w-16 text-arch-primary animate-pulse" />
          </div>
          <h3 className="font-display text-4xl md:text-8xl font-black mb-12 leading-[0.95] tracking-tighter uppercase italic">{s.science.title}</h3>
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
                  animate={{ scale: [1, 1.02, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }}
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

        {/* ── Block 4: Product Grid (4D Features) ──────── */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {s.features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-[3rem] border border-white/5 bg-card/40 p-12 transition-all backdrop-blur-xl hover:border-arch-primary/30 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">
                {featureIcons[i]}
              </div>
              <div className="mb-10 h-20 w-20 rounded-2xl bg-background border border-border flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-arch-primary group-hover:text-primary-foreground group-hover:border-arch-primary shadow-xl">
                {featureIcons[i]}
              </div>
              <h4 className="font-display text-3xl font-black mb-6 tracking-tight uppercase italic">{f.title}</h4>
              <p className="text-muted-foreground text-xl leading-relaxed font-medium">{f.description}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Block 5: How It Works (Simple. Profundo. Eficaz.) ────────────────────── */}
        <div className="text-center max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 inline-flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-arch-primary"
          >
            COMO FUNCIONA
          </motion.div>
          <h3 className="font-display text-4xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic">
            Simples. <span className="text-arch-primary">Profundo.</span> Eficaz.
          </h3>
          <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed mb-24">
            Sem planilhas. Sem dados bancários. Apenas psicologia aplicada para reprogramar sua relação com o dinheiro.
          </p>

          <div className="grid md:grid-cols-3 gap-12 md:gap-24 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-arch-primary/20 to-transparent" />
            
            {s.howItWorks.steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-12">
                  <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-background border border-border group-hover:border-arch-primary group-hover:bg-arch-primary group-hover:text-primary-foreground transition-all duration-700 font-display text-5xl font-black italic shadow-2xl relative z-10">
                    {step.num}
                  </div>
                  {/* Decorative number glow */}
                  <div className="absolute inset-0 bg-arch-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Step separator (Mobile) */}
                  {i < 2 && <div className="md:hidden absolute -bottom-12 left-1/2 -translate-x-1/2 h-12 w-px bg-gradient-to-b from-arch-primary/50 to-transparent" />}
                </div>
                <h4 className="font-black text-3xl mb-6 tracking-tight uppercase italic">{step.title}</h4>
                <p className="text-muted-foreground text-xl leading-relaxed font-medium px-4">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>


        {/* ── Block 6: Social Proof ────────────────────── */}
        <div className="rounded-[4rem] border border-border bg-card p-12 md:p-32 shadow-2xl overflow-hidden relative max-w-7xl mx-auto">
          <div className="absolute top-0 left-0 h-96 w-96 bg-arch-primary/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 h-96 w-96 bg-arch-primary/5 blur-[120px] rounded-full" />
          
          <p className="text-center text-2xl font-black text-arch-primary mb-24 uppercase tracking-[0.3em]">
            {s.socialProof.counterText}
          </p>
          <div className="grid md:grid-cols-2 gap-12">
            {s.socialProof.testimonials.map((test, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="rounded-[2.5rem] border border-border bg-background p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-1 text-arch-primary">
                    {[...Array(5)].map((_, star) => <Star key={star} size={20} fill="currentColor" />)}
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verificado
                  </span>
                </div>
                <p className="text-2xl text-foreground leading-relaxed font-medium mb-12 italic">"{test.quote}"</p>
                <div className="flex items-center gap-5 border-t border-border pt-8">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg ${
                    i === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    i === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                    'bg-gradient-to-br from-amber-500 to-amber-600'
                  }`}>
                    {test.author[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xl text-foreground">{test.author}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{test.country}</p>
                      <span className="text-muted-foreground">·</span>
                      <p className="text-xs font-bold text-arch-primary">Google Reviews</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-24 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 text-4xl font-black tracking-tighter">
              <span className="text-arch-primary">4.9/5</span>
              <div className="flex text-arch-primary gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={32} fill="currentColor" />)}
              </div>
            </div>
            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-sm">
              {s.socialProof.ratingText}
            </p>
          </div>
        </div>

        {/* Mid-CTA after Social Proof */}
        <div className="text-center">
          <PrimaryButton
            onClick={onContinue}
            size="lg"
            icon={<ArrowRight size={20} />}
          >
            {t.plans.chooseCta}
          </PrimaryButton>
        </div>

        {/* ── Block 7: FAQ ────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="font-display text-4xl md:text-7xl font-black text-center mb-24 tracking-tighter">FAQ</h3>
          <div className="grid gap-6">
            {s.faq.map((item, i) => (
              <details key={i} className="group rounded-3xl border border-border bg-card overflow-hidden transition-all hover:border-arch-primary/30 shadow-sm">
                <summary className="flex items-center justify-between p-10 cursor-pointer font-bold text-2xl list-none select-none">
                  {item.q}
                  <ChevronDown size={28} className="transition-transform group-open:rotate-180 text-arch-primary" />
                </summary>
                <div className="px-10 pb-10 text-xl text-muted-foreground leading-relaxed border-t border-border pt-8">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ── Block 8: Final CTA + Guarantee (O padrão que te travou tem nome) ───────────────────────── */}
        <div className="max-w-6xl mx-auto space-y-24 px-6 pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center rounded-[5rem] border border-white/10 bg-white/5 p-12 md:p-32 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-3xl group"
          >
            {/* Animated Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-arch-primary/20 via-transparent to-arch-primary/5 opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-arch-primary/10 blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-arch-primary/10 blur-[100px] animate-pulse [animation-delay:2s]" />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mb-12 inline-flex items-center gap-3 rounded-full bg-arch-primary/10 px-6 py-2 border border-arch-primary/20"
              >
                <span className="text-xs font-black uppercase tracking-[0.4em] text-arch-primary">CHEGOU A HORA</span>
              </motion.div>

              <h3 className="font-display text-4xl md:text-[7rem] font-black text-foreground mb-10 tracking-tighter leading-[0.85] uppercase italic">
                O padrão que te travou <span className="text-arch-primary underline decoration-arch-primary/20 underline-offset-8">tem nome.</span>
              </h3>
              
              <p className="text-xl md:text-3xl text-muted-foreground mb-20 max-w-3xl mx-auto font-medium tracking-tight leading-relaxed">
                8 perguntas. 3 minutos. Uma clareza que nenhuma planilha de Excel jamais conseguirá te dar.
              </p>
              
              <PrimaryButton
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="xl"
                className="italic h-28 md:h-32 px-12 md:px-20 text-3xl md:text-4xl"
                icon={<ArrowRight size={40} className="text-arch-primary ml-4" />}
              >
                DESCOBRIR MEU ARQUÉTIPO →
              </PrimaryButton>
              
              <div className="mt-20 flex flex-wrap items-center justify-center gap-10 opacity-40">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>7 DIAS GARANTIA</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]">
                  <Lock size={16} className="text-blue-500" />
                  <span>DADOS PROTEGIDOS</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]">
                  <CheckCircle2 size={16} className="text-arch-primary" />
                  <span>SEM CARTÃO DE CRÉDITO</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed FAQ section based on the mockup if not already covered enough */}
        </div>


      </div>
    </section>
  );
}

/* ─── Plans ───────────────────────────────────────────────── */

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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl font-extrabold md:text-7xl mb-6"
        >
          {t.plans.title}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          {t.plans.sub}
        </motion.p>
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
            discountStr = `${t.plans.mostPopular} · −${savings}%`;
          } else if (p === "1y") {
            const savings = Math.round((1 - total / (baseMonthlyPrice * 12)) * 100);
            discountStr = `−${savings}%`;
          }

          return (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col rounded-[3.5rem] border bg-card/50 p-12 transition-all backdrop-blur-3xl ${
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
                  { label: f.gamification, check: p !== "30d" }
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-4 text-lg ${item.check ? "text-foreground font-medium" : "text-muted-foreground line-through opacity-20"}`}>
                    <CheckCircle2 className={`h-6 w-6 shrink-0 ${item.check ? "text-arch-primary" : "text-muted-foreground"}`} />
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
                  ) : t.plans.chooseCta.toUpperCase()}
                </span>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-24 text-center">
        {/* Guarantee Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 inline-flex flex-col items-center gap-4 rounded-3xl border border-arch-primary/20 bg-arch-primary/5 px-10 py-8"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-arch-primary/10">
            <ShieldCheck className="h-8 w-8 text-arch-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">7 Dias de Garantia</p>
          <p className="text-sm text-muted-foreground max-w-md">{t.plans.guarantee}</p>
        </motion.div>

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

/* ─── Footer ──────────────────────────────────────────────── */

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
