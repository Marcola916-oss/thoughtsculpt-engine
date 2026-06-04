import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveOnboarding } from "../../lib/profile.functions";
import { generateCalendar } from "../../lib/calendar.functions";
import { useI18n } from "../../lib/i18n/LanguageProvider";
import { PageTransition } from "../../components/PageTransition";


export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Calibração — MindReset" }] }),
  component: OnboardingPage,
});

type FormState = {
  wake_time: string;
  sleep_time: string;
  daily_minutes: number | null;
  emotional_trigger: string;
  financial_goal: string;
  discipline_style: string;
  mobile_os: "ios" | "android" | "none" | "";
};

function AILoader({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(Date.now());

  const loaderSteps = [t.onboarding.loader.step0, t.onboarding.loader.step1, t.onboarding.loader.step2];

  useEffect(() => {
    // Step transitions: 0-3s step0, 3-6s step1, 6s+ step2
    const stepTimer = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      if (elapsed >= 6 && step < 2) setStep(2);
      else if (elapsed >= 3 && step < 1) setStep(1);
    }, 500);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const target = Math.min((elapsed / 9) * 100, 99);
      setProgress((p) => Math.max(p, target));
    }, 80);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      {/* Backdrop glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center max-w-lg">
        {/* Logo */}
        <div className="font-display text-2xl font-bold tracking-tight">
          <span className="text-foreground">Mind</span>
          <span className="text-primary">Reset</span>
        </div>

        {/* Animated ring */}
        <div className="relative flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-4 border-primary/20 border-t-primary shadow-[0_0_24px_var(--accent-glow)]" />
          <div className="absolute inset-3 animate-[spin_2s_linear_infinite_reverse] rounded-full border-4 border-primary/10 border-b-primary" />
          <span className="text-5xl animate-pulse">🧠</span>
        </div>

        {/* Step text */}
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-extrabold text-foreground">
            {t.onboarding.loader.heading}
          </h2>
          <p
            key={step}
            className="text-lg font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {loaderSteps[step]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm">
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary shadow-[0_0_10px_var(--accent-glow)] transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.onboarding.loader.progressLabel(step + 1, loaderSteps.length)}
          </p>
        </div>

        {/* Milestone indicators */}
        <div className="flex gap-3">
          {loaderSteps.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-16 rounded-full transition-all duration-700 ${
                i <= step
                  ? "bg-primary shadow-[0_0_8px_var(--accent-glow)]"
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OnboardingPage() {
  const { t } = useI18n();
  const save = useServerFn(saveOnboarding);
  const genCalendar = useServerFn(generateCalendar);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showLoader, setShowLoader] = useState(false);
  const [form, setForm] = useState<FormState>({
    wake_time: "",
    sleep_time: "",
    daily_minutes: null,
    emotional_trigger: "",
    financial_goal: "",
    discipline_style: "",
    mobile_os: "",
  });

  const mut = useMutation({
    mutationFn: async () => {
      // Show loader immediately
      setShowLoader(true);
      const startTime = Date.now();

      // Save onboarding answers
      await save({
        data: {
          ...form,
          daily_minutes: form.daily_minutes ?? 15,
          mobile_os: form.mobile_os || "none",
        },
      });

      // Generate calendar tasks in parallel with the minimum display time
      const minDelay = new Promise((r) => setTimeout(r, 8000));
      await Promise.all([genCalendar(), minDelay]);

      return { elapsed: Date.now() - startTime };
    },
    onSuccess: () => navigate({ to: "/dashboard" }),
    onError: () => {
      // On error, still navigate but without hiding the loader until navigation
      navigate({ to: "/dashboard" });
    },
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const isFormValid =
    form.wake_time &&
    form.sleep_time &&
    form.daily_minutes &&
    form.emotional_trigger.trim() &&
    form.financial_goal &&
    form.discipline_style &&
    form.mobile_os;

  const handleSubmit = () => {
    if (isFormValid) {
      mut.mutate();
    }
  };

  // Show full-screen AI loader while generating
  if (showLoader) {
    return <AILoader onComplete={() => navigate({ to: "/dashboard" })} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between py-12 px-4">
      <header className="mx-auto max-w-xl w-full text-center">
        <div className="font-display text-2xl font-bold tracking-tight mb-8">
          <span className="text-foreground">Mind</span><span className="text-primary">Reset</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_var(--accent-glow)]"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t.onboarding.progress(step)}
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center my-8">
        <div className="w-full max-w-xl glass-panel p-6 md:p-10 shadow-2xl min-h-[500px] flex flex-col justify-between overflow-hidden relative">
          <AnimatePresence mode="wait">

          {/* Step 1: Wake Time */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">{t.onboarding.step1.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">{t.onboarding.step1.description}</p>
              <div className="grid gap-3">
                {[
                  { value: "before-6am", label: t.onboarding.step1.option.before6am },
                  { value: "6am-7am", label: t.onboarding.step1.option.between6am7am },
                  { value: "7am-8am", label: t.onboarding.step1.option.between7am8am },
                  { value: "after-8am", label: t.onboarding.step1.option.after8am },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm({ ...form, wake_time: opt.value });
                      nextStep();
                    }}
                    className={`w-full text-left rounded-2xl border p-4 text-base font-semibold transition-all hover:scale-[1.01] ${
                      form.wake_time === opt.value
                        ? "border-primary bg-primary/10 shadow-[0_0_10px_var(--accent-glow)] text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Sleep Time */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">{t.onboarding.step2.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">{t.onboarding.step2.description}</p>
              <div className="grid gap-3">
                {[
                  { value: "before-10pm", label: t.onboarding.step2.option.before10pm },
                  { value: "10pm-11pm", label: t.onboarding.step2.option.between10pm11pm },
                  { value: "11pm-midnight", label: t.onboarding.step2.option.between11pmMidnight },
                  { value: "after-midnight", label: t.onboarding.step2.option.afterMidnight },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm({ ...form, sleep_time: opt.value });
                      nextStep();
                    }}
                    className={`w-full text-left rounded-2xl border p-4 text-base font-semibold transition-all hover:scale-[1.01] ${
                      form.sleep_time === opt.value
                        ? "border-primary bg-primary/10 shadow-[0_0_10px_var(--accent-glow)] text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Daily Minutes */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">{t.onboarding.step3.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">{t.onboarding.step3.description}</p>
              <div className="grid gap-3">
                {[
                  { value: 15, label: t.onboarding.step3.option.min15 },
                  { value: 30, label: t.onboarding.step3.option.min30 },
                  { value: 45, label: t.onboarding.step3.option.min45 },
                  { value: 60, label: t.onboarding.step3.option.min60 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm({ ...form, daily_minutes: opt.value });
                      nextStep();
                    }}
                    className={`w-full text-left rounded-2xl border p-4 text-base font-semibold transition-all hover:scale-[1.01] ${
                      form.daily_minutes === opt.value
                        ? "border-primary bg-primary/10 shadow-[0_0_10px_var(--accent-glow)] text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Emotional Trigger */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">{t.onboarding.step4.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">{t.onboarding.step4.description}</p>
              <input
                required
                autoFocus
                type="text"
                maxLength={200}
                placeholder={t.onboarding.step4.placeholder}
                value={form.emotional_trigger}
                onChange={(e) => setForm({ ...form, emotional_trigger: e.target.value })}
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-lg outline-none transition focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
              <button
                disabled={!form.emotional_trigger.trim()}
                onClick={nextStep}
                className="mt-8 w-full rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                {t.onboarding.continue} →
              </button>
            </div>
          )}

          {/* Step 5: Financial Priority */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">{t.onboarding.step5.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">{t.onboarding.step5.description}</p>
              <div className="grid gap-3">
                {[
                  { value: "debt", label: t.onboarding.step5.option.debt },
                  { value: "emergency", label: t.onboarding.step5.option.emergency },
                  { value: "invest", label: t.onboarding.step5.option.invest },
                  { value: "organize", label: t.onboarding.step5.option.organize },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm({ ...form, financial_goal: opt.value });
                      nextStep();
                    }}
                    className={`w-full text-left rounded-2xl border p-4 text-base font-semibold transition-all hover:scale-[1.01] ${
                      form.financial_goal === opt.value
                        ? "border-primary bg-primary/10 shadow-[0_0_10px_var(--accent-glow)] text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Discipline Style */}
          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">{t.onboarding.step6.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">{t.onboarding.step6.description}</p>
              <div className="grid gap-3">
                {[
                  { value: "hardcore", label: t.onboarding.step6.option.hardcore },
                  { value: "gradual", label: t.onboarding.step6.option.gradual },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm({ ...form, discipline_style: opt.value });
                      nextStep();
                    }}
                    className={`w-full text-left rounded-2xl border p-4 text-base font-semibold transition-all hover:scale-[1.01] ${
                      form.discipline_style === opt.value
                        ? "border-primary bg-primary/10 shadow-[0_0_10px_var(--accent-glow)] text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Mobile OS */}
          {step === 7 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">{t.onboarding.step7.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">{t.onboarding.step7.description}</p>
              <div className="grid gap-3">
                {[
                  { value: "ios", label: t.onboarding.step7.option.ios },
                  { value: "android", label: t.onboarding.step7.option.android },
                  { value: "none", label: t.onboarding.step7.option.none },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm({ ...form, mobile_os: opt.value as any });
                    }}
                    className={`w-full text-left rounded-2xl border p-4 text-base font-semibold transition-all hover:scale-[1.01] ${
                      form.mobile_os === opt.value
                        ? "border-primary bg-primary/10 shadow-[0_0_10px_var(--accent-glow)] text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {mut.error && <p className="text-sm text-primary mt-4">{(mut.error as Error).message}</p>}

              <button
                disabled={!form.mobile_os || mut.isPending}
                onClick={handleSubmit}
                className="mt-8 w-full rounded-full bg-primary px-6 py-4 font-bold text-primary-foreground shadow-[0_4px_15px_var(--accent-glow)] transition hover:opacity-90 disabled:opacity-40"
              >
                {t.onboarding.step7.submit} →
              </button>
            </div>
          )}

          {/* Navigation controls */}
          <div className="mt-8 flex justify-between border-t border-border pt-4 text-sm font-semibold text-muted-foreground">
            {step > 1 ? (
              <button onClick={prevStep} className="hover:text-foreground transition flex items-center gap-1">
                <span>←</span> {t.onboarding.back}
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground">
        {t.onboarding.footer.privacy}
      </footer>
    </div>
  );
}
