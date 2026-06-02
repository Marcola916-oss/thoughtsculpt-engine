import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
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
      { name: "description", content: "A 3-minute behavioral diagnosis. No budgets. No bank linking. Just psychology that changes behavior." },
      { property: "og:title", content: "MindReset — Discover your financial archetype" },
      { property: "og:description", content: "A 3-minute behavioral diagnosis. No budgets. No bank linking. Just psychology that changes behavior." },
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

  // Loader → persist lead → reveal
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
              user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
            },
          }),
          minDelay,
        ]);
        if (cancelled) return;
        if (row) { setLeadId(row.id); setShareToken(row.share_token); }
        setStage({ kind: "reveal" });
      } catch (e) {
        if (cancelled) return;
        setLeadError((e as Error).message);
        setStage({ kind: "reveal" });
      }
    })();
    return () => { cancelled = true; };
  }, [stage.kind, persistLead, name, gender, email, lang, country, currency, answers]);

  function answerQuestion(optionIdx: number) {
    if (stage.kind !== "q") return;
    const next = [...answers];
    next[stage.index] = optionIdx;
    setAnswers(next);
    if (stage.index < 7) {
      setTimeout(() => setStage({ kind: "q", index: stage.index + 1 }), 180);
    } else {
      setTimeout(() => setStage({ kind: "email" }), 180);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-8 md:pt-16">
        {stage.kind === "hero"     && <Hero  onStart={() => setStage({ kind: "identity" })} />}
        {stage.kind === "identity" && (
          <Identity
            name={name} setName={setName}
            gender={gender} setGender={setGender}
            onContinue={() => setStage({ kind: "q", index: 0 })}
          />
        )}
        {stage.kind === "q" && (
          <QuestionScreen
            index={stage.index}
            name={name}
            selected={answers[stage.index]}
            onSelect={answerQuestion}
            onBack={() => stage.index === 0
              ? setStage({ kind: "identity" })
              : setStage({ kind: "q", index: stage.index - 1 })}
          />
        )}
        {stage.kind === "email" && (
          <EmailCapture
            name={name} email={email} setEmail={setEmail}
            gdpr={gdpr} setGdpr={setGdpr}
            onSubmit={() => setStage({ kind: "loader" })}
          />
        )}
        {stage.kind === "loader" && <LoaderScreen />}
        {stage.kind === "reveal" && archCode && (
          <Reveal name={name} arch={archCode} onContinue={() => setStage({ kind: "sales" })} />
        )}
        {stage.kind === "sales" && archCode && (
          <Sales name={name} arch={archCode} onContinue={() => setStage({ kind: "plans" })} />
        )}
        {stage.kind === "plans" && (
          <Plans email={email} displayName={name} leadId={leadId} />
        )}
      </main>
      <Footer />
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-lg font-bold tracking-tight">
          <span className="text-foreground">Mind</span><span className="text-primary">Reset</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">Log in</Link>
        </div>
      </div>
    </header>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <section className="py-12 md:py-20 text-center">
      <p className="mb-6 inline-block rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
        {t.hero.kicker}
      </p>
      <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
        {t.hero.headline}
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">{t.hero.sub}</p>
      <button
        onClick={onStart}
        className="mr-glow mt-10 inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition hover:bg-[oklch(0.41_0.22_27)] hover:-translate-y-0.5"
      >
        {t.hero.cta} →
      </button>
      <p className="mt-4 text-xs text-muted-foreground">{t.hero.trust}</p>
    </section>
  );
}

function Identity(props: {
  name: string; setName: (v: string) => void;
  gender: "m" | "f" | "n" | ""; setGender: (v: "m" | "f" | "n") => void;
  onContinue: () => void;
}) {
  const { t } = useI18n();
  const ok = props.name.trim().length >= 2 && props.gender !== "";
  return (
    <section className="py-8">
      <h2 className="font-display text-3xl font-bold">{t.identity.title}</h2>
      <p className="mt-2 text-muted-foreground">{t.identity.sub}</p>

      <label className="mt-8 block text-sm font-medium">{t.common.yourName}</label>
      <input
        autoFocus
        value={props.name}
        onChange={(e) => props.setName(e.target.value)}
        placeholder={t.common.yourNamePlaceholder}
        className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-lg outline-none focus:border-primary"
      />

      <p className="mt-6 text-sm font-medium">{t.common.selectGender}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {(["m","f","n"] as const).map((g) => (
          <button
            key={g}
            onClick={() => props.setGender(g)}
            className={`rounded-lg border px-3 py-3 text-sm transition ${
              props.gender === g ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            {g === "m" ? t.common.male : g === "f" ? t.common.female : t.common.neutral}
          </button>
        ))}
      </div>

      <button
        disabled={!ok}
        onClick={props.onContinue}
        className="mt-10 w-full rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground transition hover:bg-[oklch(0.41_0.22_27)] disabled:opacity-40"
      >
        {t.common.continue} →
      </button>
    </section>
  );
}

function QuestionScreen(props: {
  index: number; name: string; selected: number | null;
  onSelect: (i: number) => void; onBack: () => void;
}) {
  const { t } = useI18n();
  const q = t.q[props.index];
  const progress = ((props.index + 1) / 8) * 100;
  return (
    <section className="py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button onClick={props.onBack} className="hover:text-foreground">← {t.common.back}</button>
          <span>{t.questions.title(props.index + 1, 8)}</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold md:text-3xl">{q.q.replace("[NOME]", props.name)}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t.questions.intro(props.name || "")}</p>

      <div className="mt-8 space-y-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => props.onSelect(i)}
            className={`block w-full rounded-xl border px-4 py-4 text-start transition ${
              props.selected === i
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/5"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </section>
  );
}

function EmailCapture(props: {
  name: string; email: string; setEmail: (v: string) => void;
  gdpr: boolean; setGdpr: (v: boolean) => void; onSubmit: () => void;
}) {
  const { t } = useI18n();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email) && props.gdpr;
  return (
    <section className="py-10">
      <h2 className="font-display text-3xl font-bold md:text-4xl">{t.emailCapture.title(props.name)}</h2>
      <p className="mt-3 text-muted-foreground">{t.emailCapture.sub}</p>

      <form
        onSubmit={(e) => { e.preventDefault(); if (valid) props.onSubmit(); }}
        className="mt-8 space-y-4"
      >
        <input
          type="email" required autoFocus
          value={props.email} onChange={(e) => props.setEmail(e.target.value)}
          placeholder={t.common.emailPlaceholder}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-lg outline-none focus:border-primary"
        />
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={props.gdpr} onChange={(e) => props.setGdpr(e.target.checked)} className="mt-1 accent-[oklch(0.52_0.24_27)]" />
          <span>{t.common.gdpr}</span>
        </label>
        <button
          type="submit" disabled={!valid}
          className="w-full rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground transition hover:bg-[oklch(0.41_0.22_27)] disabled:opacity-40"
        >
          {t.emailCapture.cta} →
        </button>
      </form>
    </section>
  );
}

function LoaderScreen() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % t.loader.steps.length), 900);
    return () => clearInterval(id);
  }, [t]);
  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mr-ring" />
      <p className="mt-8 text-lg text-foreground">{t.loader.steps[step]}</p>
    </section>
  );
}

function Reveal({ name, arch, onContinue }: { name: string; arch: Archetype; onContinue: () => void }) {
  const { t } = useI18n();
  const a = t.archetypes[arch];
  // typewriter
  const [text, setText] = useState("");
  useEffect(() => {
    let i = 0;
    setText("");
    const id = setInterval(() => {
      i++;
      setText(a.name.slice(0, i));
      if (i >= a.name.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [a.name]);

  return (
    <section className="py-12">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">{t.reveal.kicker(name)}</p>
      <h1 className="mt-3 font-display text-5xl font-extrabold text-primary md:text-7xl">
        <span className="mr-cursor">{text}</span>
      </h1>
      <p className="mt-4 text-lg text-foreground/90">{a.tagline}</p>
      <p className="mt-2 text-sm text-muted-foreground">{t.reveal.sub}</p>

      <ul className="mt-8 space-y-3">
        {a.hooks.map((h, i) => (
          <li key={i} className="rounded-lg border border-border bg-card px-4 py-3 text-foreground">
            <span className="text-primary">→</span> {h}
          </li>
        ))}
      </ul>

      <button
        onClick={onContinue}
        className="mr-glow mt-10 w-full rounded-full bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground transition hover:bg-[oklch(0.41_0.22_27)]"
      >
        {t.reveal.cta} →
      </button>
    </section>
  );
}

function Sales({ name, arch, onContinue }: { name: string; arch: Archetype; onContinue: () => void }) {
  const { t } = useI18n();
  const a = t.archetypes[arch];
  return (
    <section className="py-12 space-y-10">
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">
        {t.sales.h1(name, a.name)}
      </h1>
      <p className="text-xl text-foreground/90">{t.sales.promise}</p>

      <ul className="space-y-3">
        {t.sales.bullets.map((b, i) => (
          <li key={i} className="flex gap-3 rounded-lg border border-border bg-card p-4">
            <span className="text-primary">✓</span><span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-2xl font-bold">{t.sales.why}</h3>
        <p className="mt-3 text-muted-foreground">{t.sales.whyBody}</p>
      </div>

      <button
        onClick={onContinue}
        className="mr-glow w-full rounded-full bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground transition hover:bg-[oklch(0.41_0.22_27)]"
      >
        {t.sales.cta} →
      </button>
    </section>
  );
}

function Plans() {
  const { t, currency } = useI18n();
  const plans: PlanKey[] = ["30d", "6m", "1y"];
  return (
    <section className="py-12">
      <h2 className="font-display text-3xl font-extrabold md:text-4xl">{t.plans.title}</h2>
      <p className="mt-2 text-muted-foreground">{t.plans.sub}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const total = PRICES[currency][p];
          const popular = p === "6m";
          return (
            <div
              key={p}
              className={`relative rounded-2xl border bg-card p-6 transition ${popular ? "border-primary shadow-[0_0_40px_var(--accent-glow)]" : "border-border"}`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  {t.plans.mostPopular}
                </span>
              )}
              <h3 className="font-display text-xl font-bold">
                {p === "30d" ? t.plans.p30 : p === "6m" ? t.plans.p6m : t.plans.p1y}
              </h3>
              <p className="mt-4 font-display text-4xl font-extrabold">{formatPrice(currency, total)}</p>
              <p className="text-xs text-muted-foreground">{t.plans.perDay(pricePerDay(currency, p))}</p>
              <button
                disabled
                title="Stripe BYOK — connect a Stripe secret key in Lovable settings to enable checkout"
                className={`mt-6 w-full rounded-full px-4 py-3 font-semibold transition ${
                  popular ? "bg-primary text-primary-foreground hover:bg-[oklch(0.41_0.22_27)]" : "border border-border bg-background text-foreground hover:border-primary"
                } disabled:opacity-60`}
              >
                {t.plans.chooseCta}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">{t.plans.guarantee}</p>
    </section>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} MindReset</p>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-foreground">{t.common.privacy}</Link>
          <Link to="/terms" className="hover:text-foreground">{t.common.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
