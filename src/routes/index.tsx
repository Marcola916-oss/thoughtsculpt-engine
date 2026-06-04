import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  CheckCircle2, 
  Lock, 
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
import { scoreAnswers, type Answers, type Archetype } from "../lib/quiz/scoring";
import { PRICES, pricePerDay, formatPrice, type PlanKey } from "../lib/pricing";
import { saveQuizLead } from "../lib/quiz.functions";
import { createCheckoutSession } from "../lib/checkout.functions";

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
      className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden"
      data-arch={archCode || undefined}
    >
      <TopBar />
      
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-12">
        <AnimatePresence mode="wait">
          {stage.kind === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Hero onStart={() => setStage({ kind: "identity" })} />
            </motion.div>
          )}

          {stage.kind === "identity" && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Identity
                name={name}
                setName={setName}
                gender={gender}
                setGender={setGender}
                onContinue={() => setStage({ kind: "q", index: 0 })}
              />
            </motion.div>
          )}

          {stage.kind === "q" && (
            <motion.div
              key={`q-${stage.index}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <QuestionScreen
                index={stage.index}
                total={8}
                name={name}
                selected={answers[stage.index]}
                onSelect={answerQuestion}
                onBack={() =>
                  stage.index === 0
                    ? setStage({ kind: "identity" })
                    : setStage({ kind: "q", index: stage.index - 1 })
                }
              />
            </motion.div>
          )}

          {stage.kind === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <EmailCapture
                name={name}
                email={email}
                setEmail={setEmail}
                gdpr={gdpr}
                setGdpr={setGdpr}
                onSubmit={() => setStage({ kind: "loader" })}
              />
            </motion.div>
          )}

          {stage.kind === "loader" && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[60vh] flex-col items-center justify-center text-center"
            >
              <LoaderScreen />
            </motion.div>
          )}

          {stage.kind === "reveal" && archCode && (
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
          )}

          {stage.kind === "sales" && archCode && (
            <motion.div
              key="sales"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Sales name={name} arch={archCode} onContinue={() => setStage({ kind: "plans" })} />
            </motion.div>
          )}

          {stage.kind === "plans" && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Plans email={email} displayName={name} leadId={leadId} />
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
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 p-4 backdrop-blur-lg md:hidden"
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
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm py-2" : "bg-transparent py-4"}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          <span className="text-foreground">Mind</span>
          <span className="text-arch-primary transition-colors duration-500">Reset</span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            {t.common.login}
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
    <section className="relative py-12 md:py-32 text-center">
      {/* Background glow effect */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-arch-primary/30 bg-arch-primary/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-arch-primary shadow-[0_0_20px_var(--arch-glow)]"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arch-primary opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-arch-primary"></span>
        </span>
        {t.hero.kicker}
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mx-auto max-w-4xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-8xl"
      >
        {t.hero.headline}
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mx-auto mt-10 max-w-2xl text-lg text-muted-foreground md:text-2xl leading-relaxed"
      >
        {t.hero.sub}
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-16 flex flex-col items-center gap-6"
      >
        <button
          onClick={onStart}
          className="group relative overflow-hidden rounded-full bg-arch-primary px-12 py-6 text-xl font-black text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_40px_var(--arch-glow)] active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2">
            {t.hero.cta}
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </span>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-arch-primary to-arch-accent opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
        
        <div className="flex flex-col items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="h-full w-full object-cover grayscale opacity-70" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex text-primary">
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
            </span>
            <span>{t.hero.trust}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-24 animate-bounce"
      >
        <ChevronDown className="mx-auto h-8 w-8 text-muted-foreground/30" />
      </motion.div>
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
    <section className="py-12 animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto">
      <h2 className="font-display text-3xl font-bold md:text-4xl">{t.identity.title}</h2>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{t.identity.sub}</p>

      <div className="mt-10 space-y-8">
        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.common.yourName}
          </label>
          <input
            autoFocus
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            placeholder={t.common.yourNamePlaceholder}
            className="w-full rounded-xl border border-border bg-card px-5 py-4 text-xl outline-none transition focus:border-arch-primary focus:ring-1 focus:ring-arch-primary shadow-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.common.selectGender}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["m", "f", "n"] as const).map((g) => (
              <button
                key={g}
                onClick={() => props.setGender(g)}
                className={`rounded-xl border px-4 py-4 text-base font-semibold transition-all ${
                  props.gender === g
                    ? "border-arch-primary bg-arch-primary text-primary-foreground shadow-[0_0_15px_var(--arch-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-foreground hover:bg-secondary"
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
        onClick={props.onContinue}
        className="mt-12 w-full rounded-full bg-arch-primary py-5 text-xl font-black text-primary-foreground shadow-[0_0_20px_var(--arch-glow)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-30 disabled:shadow-none"
      >
        {t.common.continue}
      </button>
    </section>
  );
}

/* ─── QuestionScreen ──────────────────────────────────────── */

function QuestionScreen(props: {
  index: number;
  total: number;
  name: string;
  selected: number | null;
  onSelect: (idx: number) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const q = t.q[props.index];
  
  // Strategic progress bar with Zeigarnik effect
  const progress = ((props.index + 1) / props.total) * 100;
  // Accelerate progress visual after 80% to create urgency
  const visualProgress = progress >= 80 ? 95 : progress;

  return (
    <section className="py-8 max-w-2xl mx-auto">
      {/* Strategic Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-arch-primary">
            {t.questions.title(props.index + 1, props.total)}
          </span>
          <span className="text-sm font-bold text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${visualProgress}%` }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="h-full bg-arch-primary shadow-[0_0_15px_var(--arch-glow)]" 
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={props.index}
      >
        <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl mb-4">
          {q.q.replace("[NOME]", props.name)}
        </h2>
        <p className="text-muted-foreground mb-10 text-lg">
          {t.questions.intro(props.name)}
        </p>

        <div className="grid gap-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => props.onSelect(i)}
              className={`group flex items-center justify-between rounded-2xl border p-6 text-left transition-all duration-300 ${
                props.selected === i
                  ? "border-arch-primary bg-arch-primary/10 shadow-[0_0_20px_var(--arch-glow)]"
                  : "border-border bg-card hover:border-arch-primary/50 hover:bg-secondary/50"
              }`}
            >
              <span className={`text-lg font-medium transition-colors ${props.selected === i ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                {opt}
              </span>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                props.selected === i 
                  ? "border-arch-primary bg-arch-primary shadow-[0_0_10px_var(--arch-glow)]" 
                  : "border-border group-hover:border-arch-primary/50"
              }`}>
                {props.selected === i && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={props.onBack}
          className="mt-12 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition"
        >
          ← {t.common.back}
        </button>
      </motion.div>
    </section>
  );

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
    <section className="py-12 max-w-xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-arch-primary/10 shadow-[0_0_30px_var(--arch-glow)] mx-auto">
        <span className="text-4xl">🔐</span>
      </div>
      <h2 className="text-center font-display text-3xl font-extrabold md:text-5xl">
        {t.emailCapture.title(props.name)}
      </h2>
      <p className="mt-4 text-center text-lg text-muted-foreground leading-relaxed">
        {t.emailCapture.sub}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) props.onSubmit();
        }}
        className="mt-10 space-y-6"
      >
        <div>
          <input
            type="email"
            required
            autoFocus
            value={props.email}
            onChange={(e) => props.setEmail(e.target.value)}
            placeholder={t.common.emailPlaceholder}
            className="w-full rounded-2xl border border-border bg-card px-6 py-5 text-xl outline-none transition focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground transition hover:bg-card cursor-pointer">
          <input
            type="checkbox"
            checked={props.gdpr}
            onChange={(e) => props.setGdpr(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-primary"
          />
          <span className="leading-relaxed">{t.common.gdpr}</span>
        </label>

        <button
          type="submit"
          disabled={!valid}
          className="w-full rounded-full bg-arch-primary px-6 py-5 text-lg font-bold text-primary-foreground shadow-[0_0_20px_var(--arch-glow)] transition-all hover:scale-[1.02] disabled:scale-100 disabled:opacity-40 disabled:shadow-none"
        >
          {t.emailCapture.cta} →
        </button>
      </form>
    </section>
  );
}

/* ─── LoaderScreen ────────────────────────────────────────── */

function LoaderScreen() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % t.loader.steps.length), 1200);
    return () => clearInterval(id);
  }, [t]);

  return (
    <section className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700 relative overflow-hidden">
      {/* Dynamic Scan Line Effect */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-arch-primary to-transparent opacity-50 shadow-[0_0_15px_var(--arch-glow)] animate-[scan-line_2.5s_ease-in-out_infinite]" />
      </div>

      <div className="relative flex h-40 w-40 items-center justify-center">
        {/* Modern Concentric Loaders */}
        <div className="absolute h-full w-full animate-[spin_3s_linear_infinite] rounded-full border-[3px] border-arch-glow border-t-arch-primary" />
        <div className="absolute h-[80%] w-[80%] animate-[spin_2s_linear_infinite_reverse] rounded-full border-[3px] border-arch-glow/30 border-b-arch-primary/60" />
        <div className="absolute h-[60%] w-[60%] animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-arch-primary/10 flex items-center justify-center">
          <Brain size={48} className="text-arch-primary animate-pulse" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 z-20"
      >
        <h2 className="font-display text-3xl font-black text-foreground tracking-tight">
          {t.loader.title}
          <span className="mr-cursor" />
        </h2>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-4 text-xl font-medium text-muted-foreground max-w-md"
          >
            {t.loader.steps[step]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Perceived value text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 grid grid-cols-2 gap-8"
      >
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-arch-primary/60 mb-1">Data Stream</p>
          <div className="h-1 w-24 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              animate={{ x: ["-100%", "100%"] }} 
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="h-full w-1/2 bg-arch-primary" 
            />
          </div>
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-arch-primary/60 mb-1">Neural Mapping</p>
          <div className="h-1 w-24 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              animate={{ x: ["-100%", "100%"] }} 
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear", delay: 0.3 }}
              className="h-full w-1/2 bg-arch-primary" 
            />
          </div>
        </div>
      </motion.div>
    </section>
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
    }, 80);
    return () => clearInterval(id);
  }, [a.name]);

  return (
    <section className="py-12 md:py-32 overflow-hidden">
      <div className="text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="mb-8 inline-block rounded-full bg-primary/10 px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-primary shadow-[0_0_20px_var(--accent-glow)]"
        >
          {t.reveal.kicker(name)}
        </motion.div>
        
        <h1 className="mt-4 font-display text-6xl font-black leading-none text-foreground md:text-[10rem] tracking-tighter">
          <span className="text-primary">{text}</span>
          <motion.span 
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-primary"
          >
            |
          </motion.span>
        </h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mx-auto mt-10 max-w-2xl text-2xl font-bold text-muted-foreground leading-relaxed"
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
        transition={{ delay: 1.5, duration: 0.8 }}
        className="mx-auto mt-24 max-w-4xl rounded-[3rem] border border-border bg-card p-8 md:p-20 shadow-2xl relative"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full bg-background border border-border flex items-center justify-center text-4xl shadow-xl">
          🎯
        </div>
        
        <p className="mb-12 text-center font-display text-3xl font-black leading-tight">{t.reveal.sub}</p>
        
        <div className="grid gap-4">
          {a.hooks.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2 + i * 0.2 }}
              className="flex gap-6 rounded-3xl border border-border bg-background p-6 md:p-8 transition-all hover:border-primary/30 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {i + 1}
              </div>
              <p className="text-xl text-foreground font-medium leading-relaxed">{h}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="mt-16 w-full rounded-2xl bg-primary px-8 py-6 text-2xl font-black text-primary-foreground shadow-[0_0_40px_var(--accent-glow)] transition-all flex items-center justify-center gap-4"
        >
          {t.reveal.cta} <ArrowRight size={28} />
        </motion.button>
      </motion.div>
    </section>
  );
}

/* ─── Sales (9-Block VSL) ────────────────────────────────── */


function Sales({
  name,
  arch,
  onContinue,
}: {
  name: string;
  arch: Archetype;
  onContinue: () => void;
}) {
  const { t } = useI18n();
  const a = t.archetypes[arch];
  const s = t.sales;

  const featureIcons = [
    <Brain className="h-8 w-8 text-primary" />,
    <CalendarIcon className="h-8 w-8 text-primary" />,
    <CompassIcon className="h-8 w-8 text-primary" />,
    <LineChart className="h-8 w-8 text-primary" />
  ];

  return (
    <section className="py-12 md:py-24 animate-in fade-in duration-1000">
      <div className="space-y-32">

        {/* ── Block 1: H1 + Promise ────────────────────── */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-extrabold leading-tight md:text-7xl"
          >
            {s.h1(name, <span className="text-primary underline decoration-primary/30 underline-offset-8">{a.name}</span> as any)}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-xl md:text-2xl font-black uppercase tracking-wider text-primary"
          >
            {s.promise}
          </motion.p>
        </div>

        {/* ── Block 2: Pain Mirror ─────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="rounded-[2.5rem] border border-border bg-card p-8 md:p-16 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Brain size={120} />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            {s.painBlock.title}
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            {s.painBlock.body}
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {s.painBlock.bullets.map((b, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50"
              >
                <CheckCircle2 className="h-6 w-6 shrink-0 text-primary mt-0.5" />
                <span className="text-lg font-medium text-foreground">{b}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-12 text-xl font-bold text-primary italic border-l-4 border-primary pl-6">
            {s.painBlock.conclusion}
          </p>
        </motion.div>

        {/* ── Block 3: Scientific Proof ────────────────── */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-8">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h3 className="font-display text-3xl md:text-5xl font-bold mb-8">{s.science.title}</h3>
          <div className="space-y-6 text-xl text-muted-foreground leading-relaxed">
            <p>{s.science.body}</p>
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground/50">
              {s.science.references}
            </p>
            <p className="text-foreground font-bold text-2xl pt-4">
              {s.science.pivot}
            </p>
            <motion.p 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-primary font-black text-3xl"
            >
              {s.science.solution}
            </motion.p>
          </div>
        </div>

        {/* ── Block 4: Product Grid (4D Features) ──────── */}
        <div className="grid md:grid-cols-2 gap-8">
          {s.features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-3xl border border-border bg-card p-10 transition-all hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(204,0,0,0.1)]"
            >
              <div className="mb-8 p-4 rounded-2xl bg-background border border-border inline-block transition-transform group-hover:scale-110 group-hover:bg-primary/5">
                {featureIcons[i]}
              </div>
              <h4 className="font-display text-2xl font-bold mb-4">{f.title}</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Block 5: How It Works ────────────────────── */}
        <div className="text-center">
          <h3 className="font-display text-3xl md:text-5xl font-bold mb-20">{s.howItWorks.title}</h3>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border -z-10" />
            
            {s.howItWorks.steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background border-4 border-border group-hover:border-primary text-foreground group-hover:text-primary transition-all duration-500 font-display text-4xl font-black mb-8 relative">
                  {step.num}
                  {i < 2 && <div className="md:hidden absolute -bottom-10 left-1/2 -translate-x-1/2 h-10 w-0.5 bg-border" />}
                </div>
                <h4 className="font-bold text-2xl mb-4">{step.title}</h4>
                <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Block 6: Social Proof ────────────────────── */}
        <div className="rounded-[3rem] border border-border bg-card p-10 md:p-20 shadow-2xl overflow-hidden relative">
          <div className="absolute -top-24 -left-24 h-64 w-64 bg-primary/5 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-primary/5 blur-3xl rounded-full" />
          
          <p className="text-center text-2xl font-black text-primary mb-16 uppercase tracking-[0.2em]">
            {s.socialProof.counterText}
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {s.socialProof.testimonials.map((test, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="rounded-3xl border border-border bg-background p-8 flex flex-col justify-between"
              >
                <div className="flex gap-1 text-primary mb-6">
                  {[...Array(5)].map((_, star) => <Star key={star} size={16} fill="currentColor" />)}
                </div>
                <p className="text-xl text-foreground leading-relaxed italic mb-8">"{test.quote}"</p>
                <div className="flex items-center gap-4 border-t border-border pt-6">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                    {test.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{test.author}</p>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest">{test.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-primary">4.9/5</span>
              <div className="flex text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
            </div>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
              {s.socialProof.ratingText}
            </p>
          </div>
        </div>

        {/* ── Block 7: CTA Mid ────────────────────────── */}
        <div className="text-center py-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="group inline-flex items-center gap-4 rounded-full bg-primary px-12 py-8 text-2xl font-black text-primary-foreground shadow-[0_0_50px_var(--accent-glow)] transition-all"
          >
            {s.cta}
            <ArrowRight size={28} className="transition-transform group-hover:translate-x-2" />
          </motion.button>
          <div className="mt-8 flex items-center justify-center gap-4 text-muted-foreground opacity-50">
            <Lock size={16} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">{t.common.securePayment}</span>
          </div>
        </div>

        {/* ── Block 8: FAQ ────────────────────────────── */}
        <div className="max-w-4xl mx-auto">
          <h3 className="font-display text-3xl md:text-5xl font-bold text-center mb-16">FAQ</h3>
          <div className="grid gap-4">
            {s.faq.map((item, i) => (
              <details key={i} className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30">
                <summary className="flex items-center justify-between p-8 cursor-pointer font-bold text-xl list-none">
                  {item.q}
                  <ChevronDown size={20} className="transition-transform group-open:rotate-180 text-primary" />
                </summary>
                <div className="px-8 pb-8 text-lg text-muted-foreground leading-relaxed border-t border-border pt-6">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ── Block 9: Final CTA ───────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center rounded-[3rem] border border-primary/30 bg-primary/5 p-12 md:p-24 shadow-[0_0_60px_var(--accent-glow)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <h3 className="font-display text-4xl md:text-6xl font-black text-foreground mb-6">{s.ctaFinal.title}</h3>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">{s.ctaFinal.subtitle}</p>
          <button
            onClick={onContinue}
            className="group inline-flex items-center gap-4 rounded-full bg-primary px-12 py-8 text-2xl font-black text-primary-foreground shadow-[0_0_50px_var(--accent-glow)] transition-all hover:scale-105"
          >
            {s.ctaFinal.cta}
            <ArrowRight size={28} className="transition-transform group-hover:translate-x-2" />
          </button>
          <div className="mt-12 flex items-center justify-center gap-8">
             <div className="flex items-center gap-2 grayscale opacity-50 transition-opacity hover:opacity-100 cursor-default">
               <ShieldCheck size={20} className="text-primary" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{s.ctaFinal.trust}</span>
             </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

/* ─── Plans ───────────────────────────────────────────────── */

function Plans({
  email,
  displayName,
  leadId,
}: {
  email: string;
  displayName: string;
  leadId: string | null;
}) {
  const { t, currency, lang } = useI18n();
  const startCheckout = useServerFn(createCheckoutSession);
  const [busy, setBusy] = useState<PlanKey | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const plans: PlanKey[] = ["30d", "6m", "1y"];
  const f = t.plans.features;

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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative flex flex-col rounded-[2.5rem] border bg-card p-10 transition-all ${
                popular
                  ? "border-primary shadow-[0_0_60px_var(--accent-glow)] md:scale-110 z-10"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-6 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-xl">
                  {t.plans.mostPopular}
                </div>
              )}

              <div className="mb-10 flex-1 text-center">
                <h3 className="font-display text-3xl font-black mb-4">
                  {p === "30d" ? t.plans.p30 : p === "6m" ? t.plans.p6m : t.plans.p1y}
                </h3>

                {discountStr && (
                  <div className="inline-block rounded-lg border border-success/30 bg-success/10 px-3 py-1 text-xs font-black text-success uppercase tracking-widest">
                    {discountStr}
                  </div>
                )}

                <div className="mt-8 flex items-baseline justify-center gap-1">
                  <span className="font-display text-6xl font-black tracking-tighter">
                    {formatPrice(currency, total)}
                  </span>
                </div>
                <p className="mt-4 text-sm font-bold uppercase tracking-widest text-primary">
                  {t.plans.perDay(pricePerDay(currency, p))}
                </p>
              </div>

              <div className="mb-12 space-y-4 border-t border-border/50 pt-10">
                {[
                  { label: f.diagnosis, check: true },
                  { label: f.matrix, check: true },
                  { label: f.compass, check: true },
                  { label: f.gamification, check: p !== "30d" }
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-3 text-sm ${item.check ? "text-foreground font-medium" : "text-muted-foreground line-through opacity-40"}`}>
                    <CheckCircle2 className={`h-5 w-5 shrink-0 ${item.check ? "text-primary" : "text-muted-foreground"}`} />
                    {item.label}
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={busy !== null || !email}
                onClick={() => choose(p)}
                className={`w-full rounded-2xl px-6 py-6 text-xl font-black transition-all ${
                  popular
                    ? "bg-primary text-primary-foreground shadow-[0_10px_30px_var(--accent-glow)]"
                    : "border-2 border-primary/20 bg-background text-foreground hover:border-primary/50"
                } disabled:opacity-50 disabled:scale-100 uppercase tracking-widest`}
              >
                {busy === p ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t.common.processing}
                  </span>
                ) : t.plans.chooseCta}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-24 text-center">
        <div className="inline-flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-bold text-muted-foreground shadow-sm">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="uppercase tracking-[0.1em]">{t.plans.secureBadge}</span>
        </div>
        <p className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto italic">{t.plans.guarantee}</p>
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
