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
    if (stage.index < 7) {
      setTimeout(() => setStage({ kind: "q", index: stage.index + 1 }), 180);
    } else {
      setTimeout(() => setStage({ kind: "email" }), 180);
    }
  }

  // Auto scroll to top on stage change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage.kind]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <TopBar />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 md:pt-16">
        {stage.kind === "hero" && <Hero onStart={() => setStage({ kind: "identity" })} />}
        {stage.kind === "identity" && (
          <Identity
            name={name}
            setName={setName}
            gender={gender}
            setGender={setGender}
            onContinue={() => setStage({ kind: "q", index: 0 })}
          />
        )}
        {stage.kind === "q" && (
          <QuestionScreen
            index={stage.index}
            name={name}
            selected={answers[stage.index]}
            onSelect={answerQuestion}
            onBack={() =>
              stage.index === 0
                ? setStage({ kind: "identity" })
                : setStage({ kind: "q", index: stage.index - 1 })
            }
          />
        )}
        {stage.kind === "email" && (
          <EmailCapture
            name={name}
            email={email}
            setEmail={setEmail}
            gdpr={gdpr}
            setGdpr={setGdpr}
            onSubmit={() => setStage({ kind: "loader" })}
          />
        )}
        {stage.kind === "loader" && <LoaderScreen />}
        {stage.kind === "reveal" && archCode && (
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
        )}
        {stage.kind === "sales" && archCode && (
          <Sales name={name} arch={archCode} onContinue={() => setStage({ kind: "plans" })} />
        )}
        {stage.kind === "plans" && <Plans email={email} displayName={name} leadId={leadId} />}
      </main>
      <Footer />
    </div>
  );
}

function TopBar() {
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
          <span className="text-primary">Reset</span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <section className="py-12 md:py-24 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-[0_0_15px_var(--accent-glow)]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
        </span>
        {t.hero.kicker}
      </div>

      <h1 className="mx-auto max-w-3xl font-display text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
        Descubra o arquétipo que controla o seu <span className="text-primary">dinheiro</span>.
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
        {t.hero.sub} O primeiro diagnóstico comportamental impulsionado por IA que reconfigura sua
        forma de pensar. Sem planilhas, sem orçamentos chatos.
      </p>

      <div className="mt-12 flex flex-col items-center gap-4">
        <button
          onClick={onStart}
          className="group relative overflow-hidden rounded-full bg-primary px-10 py-5 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_30px_var(--accent-glow)]"
        >
          {t.hero.cta}
          <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <span>🔒</span>
          <span>Pagamento seguro via Stripe</span>
        </div>
      </div>
    </section>
  );
}

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
            className="w-full rounded-xl border border-border bg-card px-5 py-4 text-xl outline-none transition focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
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
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_var(--accent-glow)]"
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
        className="mt-12 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-5 text-lg font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-30 disabled:hover:scale-100 hover:shadow-[0_0_20px_var(--accent-glow)]"
      >
        {t.common.continue} <span>→</span>
      </button>
    </section>
  );
}

function QuestionScreen(props: {
  index: number;
  name: string;
  selected: number | null;
  onSelect: (i: number) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const q = t.q[props.index];
  const progress = ((props.index + 1) / 8) * 100;

  return (
    <section className="py-8 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={props.onBack}
            className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <span>←</span> {t.common.back}
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {t.questions.title(props.index + 1, 8)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out shadow-[0_0_10px_var(--accent-glow)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
        {q.q.replace("[NOME]", props.name)}
      </h2>
      <p className="mt-3 text-lg text-muted-foreground">{t.questions.intro(props.name || "")}</p>

      <div className="mt-10 space-y-4">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => props.onSelect(i)}
            className={`group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border p-5 text-start transition-all duration-300 hover:scale-[1.01] ${
              props.selected === i
                ? "border-primary bg-primary/10 text-foreground shadow-[0_0_15px_var(--accent-glow)]"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary"
            }`}
          >
            <span className="text-lg md:text-xl">{opt}</span>
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                props.selected === i
                  ? "border-primary bg-primary"
                  : "border-border bg-background group-hover:border-primary/50"
              }`}
            >
              {props.selected === i && <span className="h-2 w-2 rounded-full bg-background" />}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

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
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_30px_var(--accent-glow)] mx-auto">
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
          className="w-full rounded-full bg-primary px-6 py-5 text-lg font-bold text-primary-foreground shadow-[0_0_20px_var(--accent-glow)] transition-all hover:scale-[1.02] disabled:scale-100 disabled:opacity-40 disabled:shadow-none"
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
    <section className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <div className="absolute h-full w-full animate-[spin_3s_linear_infinite] rounded-full border-4 border-primary/20 border-t-primary" />
        <div className="absolute h-24 w-24 animate-[spin_2s_linear_infinite_reverse] rounded-full border-4 border-primary/10 border-b-primary" />
        <span className="text-4xl animate-pulse">🧠</span>
      </div>
      <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
        Processando suas respostas
      </h2>
      <p className="mt-3 text-lg font-medium text-muted-foreground transition-opacity animate-pulse">
        {t.loader.steps[step]}
      </p>
    </section>
  );
}

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
    }, 55);
    return () => clearInterval(id);
  }, [a.name]);

  return (
    <section className="py-12 md:py-20 animate-in zoom-in-95 duration-700">
      <div className="text-center">
        <p className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-primary shadow-[0_0_15px_var(--accent-glow)]">
          {t.reveal.kicker(name)}
        </p>
        <h1 className="mt-2 font-display text-5xl font-extrabold leading-tight text-foreground md:text-7xl">
          <span className="text-primary">{text}</span>
          <span className="animate-pulse text-primary">|</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl font-medium text-muted-foreground">
          {a.tagline}
        </p>
      </div>

      {leadError && (
        <div
          role="alert"
          className="mx-auto mt-8 max-w-2xl rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-left text-sm"
        >
          <p className="font-semibold text-primary">⚠️ Não conseguimos salvar seu diagnóstico.</p>
          <p className="mt-1 text-muted-foreground">
            {leadError}. Sua revelação ainda aparece abaixo, mas o link de compartilhamento não está
            disponível.
          </p>
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
          >
            🔄 Tentar novamente
          </button>
        </div>
      )}

      <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-border bg-card p-8 md:p-12 shadow-xl">
        <p className="mb-6 font-display text-2xl font-bold">{t.reveal.sub}</p>
        <ul className="space-y-4">
          {a.hooks.map((h, i) => (
            <li
              key={i}
              className="flex gap-4 rounded-xl border border-border bg-background p-5 text-lg transition-transform hover:scale-[1.02]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                !
              </span>
              <span className="text-foreground leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onContinue}
          className="mt-10 w-full rounded-xl bg-primary px-6 py-5 text-xl font-bold text-primary-foreground shadow-[0_0_30px_var(--accent-glow)] transition-all hover:scale-[1.02]"
        >
          {t.reveal.cta} →
        </button>
      </div>
    </section>
  );
}

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
  return (
    <section className="py-12 md:py-20 animate-in fade-in duration-700 max-w-3xl mx-auto">
      {/* VSL / Sales letter style */}
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">
            {t.sales.h1(name, a.name)}
          </h1>
          <p className="mt-6 text-xl font-medium text-primary">{t.sales.promise}</p>
        </div>

        {/* The Pain Block */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Você já tentou de tudo, certo?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Planilhas do Excel. Aplicativos de orçamento. Promessas de ano novo. Mas o padrão do{" "}
            {a.name} sempre volta a assumir o controle nas horas de estresse, ansiedade ou euforia.
            Isso acontece porque o problema não é matemático, é comportamental.
          </p>
          <ul className="space-y-4">
            {t.sales.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold mt-1">
                  ✓
                </span>
                <span className="text-lg font-medium text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The Science Block */}
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="font-display text-3xl font-bold">A Revelação Científica</h3>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {t.sales.whyBody} O MindReset utiliza TCC (Terapia Cognitivo-Comportamental) adaptada
            para finanças, combinada com IA para mapear seus gatilhos invisíveis.
          </p>
        </div>

        {/* How it Works Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-4xl mb-4">🧠</div>
            <h4 className="font-bold text-xl mb-2">Diagnóstico Profundo</h4>
            <p className="text-muted-foreground text-sm">
              Um dossiê de 4 dimensões (Finanças, Profissional, Pessoal, Amor) detalhando seus
              pontos cegos.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-4xl mb-4">📅</div>
            <h4 className="font-bold text-xl mb-2">Matriz de Ação</h4>
            <p className="text-muted-foreground text-sm">
              Protocolo diário de 30 dias gerado por IA com micro-tarefas para religar seu cérebro.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-4xl mb-4">🧭</div>
            <h4 className="font-bold text-xl mb-2">Compass</h4>
            <p className="text-muted-foreground text-sm">
              Decodifique as pessoas da sua vida e saiba exatamente o que dizer para evitar
              conflitos.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-4xl mb-4">📈</div>
            <h4 className="font-bold text-xl mb-2">Gamificação Real</h4>
            <p className="text-muted-foreground text-sm">
              Ganhe pontos, mantenha o streak e gere relatórios mensais para provar sua evolução.
            </p>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="mx-auto block w-full max-w-md rounded-full bg-primary px-8 py-5 text-xl font-bold text-primary-foreground shadow-[0_0_30px_var(--accent-glow)] transition-all hover:scale-105"
        >
          {t.sales.cta} →
        </button>
      </div>
    </section>
  );
}

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
      else throw new Error("Stripe session has no URL");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(null);
    }
  }

  // Calculate discount dynamically based on pricing
  const baseMonthlyPrice = PRICES[currency]["30d"];

  return (
    <section className="py-12 md:py-24 animate-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl font-extrabold md:text-5xl">{t.plans.title}</h2>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">{t.plans.sub}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => {
          const total = PRICES[currency][p];
          const popular = p === "6m";

          // Discount calculation
          let discountStr = null;
          if (p === "6m") {
            const savings = Math.round((1 - total / (baseMonthlyPrice * 6)) * 100);
            discountStr = `ECONOMIZE ${savings}%`;
          } else if (p === "1y") {
            const savings = Math.round((1 - total / (baseMonthlyPrice * 12)) * 100);
            discountStr = `ECONOMIZE ${savings}%`;
          }

          return (
            <div
              key={p}
              className={`relative flex flex-col rounded-3xl border bg-card p-8 transition-all hover:-translate-y-2 ${
                popular
                  ? "border-primary shadow-[0_0_40px_var(--accent-glow)] md:scale-105 z-10"
                  : "border-border"
              }`}
            >
              {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
                  {t.plans.mostPopular}
                </div>
              )}

              <div className="mb-6 flex-1 text-center">
                <h3 className="font-display text-2xl font-bold">
                  {p === "30d" ? t.plans.p30 : p === "6m" ? t.plans.p6m : t.plans.p1y}
                </h3>

                {discountStr && (
                  <div className="mt-2 inline-block rounded border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                    {discountStr}
                  </div>
                )}

                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="font-display text-5xl font-extrabold">
                    {formatPrice(currency, total)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-primary">
                  {t.plans.perDay(pricePerDay(currency, p))}
                </p>
              </div>

              <div className="mb-8 space-y-3 border-t border-border pt-6">
                <div className="flex text-sm text-muted-foreground">
                  <span className="mr-2 text-primary">✓</span> Diagnóstico Completo AI
                </div>
                <div className="flex text-sm text-muted-foreground">
                  <span className="mr-2 text-primary">✓</span> Matriz de Ação Diária
                </div>
                <div className="flex text-sm text-muted-foreground">
                  <span className="mr-2 text-primary">✓</span> Compass (Acessos ilimitados)
                </div>
                {p !== "30d" && (
                  <div className="flex text-sm font-semibold text-foreground">
                    <span className="mr-2 text-primary">✓</span> Gamificação & Relatórios de IA
                  </div>
                )}
              </div>

              <button
                disabled={busy !== null || !email}
                onClick={() => choose(p)}
                className={`w-full rounded-xl px-6 py-4 font-bold transition-all ${
                  popular
                    ? "bg-primary text-primary-foreground shadow-[0_4px_20px_var(--accent-glow)] hover:scale-105"
                    : "border-2 border-primary/20 bg-background text-foreground hover:border-primary"
                } disabled:opacity-50 disabled:scale-100`}
              >
                {busy === p ? "Processando..." : t.plans.chooseCta}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
          <span className="text-lg">🔒</span> Pagamento 100% Seguro via Stripe
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{t.plans.guarantee}</p>
      </div>

      {/* FAQ Block */}
      <div className="mt-24 max-w-3xl mx-auto text-left">
        <h3 className="font-display text-3xl font-bold text-center mb-10">Perguntas Frequentes</h3>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h4 className="font-bold text-lg">Isso é um aplicativo de finanças comum?</h4>
            <p className="text-muted-foreground mt-2">
              Não. Não pedimos senhas de banco nem mandamos você cortar o cafezinho. O MindReset
              foca na origem do problema: seu comportamento invisível e emocional com o dinheiro.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h4 className="font-bold text-lg">Posso cancelar a qualquer momento?</h4>
            <p className="text-muted-foreground mt-2">
              Sim. Direto pelo painel, com 2 cliques. Sem perguntas chatas ou ligações para
              retenção.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h4 className="font-bold text-lg">Como funciona a Inteligência Artificial?</h4>
            <p className="text-muted-foreground mt-2">
              A nossa IA usa as regras da TCC (Terapia Cognitivo-Comportamental) cruzadas com o seu
              arquétipo. Ela não escreve textos genéricos, ela desenha tarefas reais, como "Hoje,
              você vai atrasar essa compra impulsiva por 24h anotando-a neste espaço".
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">© {new Date().getFullYear()} MindReset Inc.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-primary transition">
            Política de Privacidade
          </Link>
          <Link to="/terms" className="hover:text-primary transition">
            Termos de Uso
          </Link>
        </div>
      </div>
    </footer>
  );
}
