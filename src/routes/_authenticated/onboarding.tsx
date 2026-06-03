import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { saveOnboarding } from "../../lib/profile.functions";

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

function OnboardingPage() {
  const save = useServerFn(saveOnboarding);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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
    mutationFn: () =>
      save({
        data: {
          ...form,
          daily_minutes: form.daily_minutes ?? 15,
          mobile_os: form.mobile_os || "none",
        },
      }),
    onSuccess: () => navigate({ to: "/dashboard" }),
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
          Calibração: Etapa {step} de 7
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center my-8">
        <div className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl min-h-[400px] flex flex-col justify-between">
          {/* Step 1: Wake Time */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">A que horas você costuma acordar?</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">Isso ajuda a calibrar o melhor horário para suas tarefas reflexivas matinais.</p>
              <div className="grid gap-3">
                {[
                  { value: "before-6am", label: "Antes das 6:00" },
                  { value: "6am-7am", label: "Entre 6:00 e 7:00" },
                  { value: "7am-8am", label: "Entre 7:00 e 8:00" },
                  { value: "after-8am", label: "Após as 8:00" },
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
            </div>
          )}

          {/* Step 2: Sleep Time */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">A que horas você costuma dormir?</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">Isso nos ajuda a evitar perturbar você com lembretes à noite.</p>
              <div className="grid gap-3">
                {[
                  { value: "before-10pm", label: "Antes das 22:00" },
                  { value: "10pm-11pm", label: "Entre 22:00 e 23:00" },
                  { value: "11pm-midnight", label: "Entre 23:00 e Meia-noite" },
                  { value: "after-midnight", label: "Após a Meia-noite" },
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
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">Quanto tempo você pode dedicar por dia?</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">Mesmo poucos minutos por dia geram mudanças consistentes.</p>
              <div className="grid gap-3">
                {[
                  { value: 15, label: "15 minutos" },
                  { value: 30, label: "30 minutos" },
                  { value: 45, label: "45 minutos" },
                  { value: 60, label: "60+ minutos" },
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
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">Qual emoção mais ativa seus impulsos de gasto?</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">Seja específico. Ansiedade, tédio, desejo de comemoração ou busca por aceitação.</p>
              <input
                required
                autoFocus
                type="text"
                maxLength={200}
                placeholder="Ex: ansiedade devido ao trabalho, tédio nos finais de semana"
                value={form.emotional_trigger}
                onChange={(e) => setForm({ ...form, emotional_trigger: e.target.value })}
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-lg outline-none transition focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
              <button
                disabled={!form.emotional_trigger.trim()}
                onClick={nextStep}
                className="mt-8 w-full rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* Step 5: Financial Priority */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">Qual seu foco financeiro prioritário?</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">Nós desenharemos as tarefas de ação prática em torno deste objetivo.</p>
              <div className="grid gap-3">
                {[
                  { value: "debt", label: "Pagar dívidas pendentes" },
                  { value: "emergency", label: "Construir reserva de emergência" },
                  { value: "invest", label: "Começar a investir" },
                  { value: "organize", label: "Organizar e planejar finanças" },
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
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">Qual seu estilo preferido de disciplina?</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">Você prefere ser desafiado de forma estrita ou conduzido gradualmente?</p>
              <div className="grid gap-3">
                {[
                  { value: "hardcore", label: "Estilo Hardcore (Regras estritas e desafios)" },
                  { value: "gradual", label: "Estilo Gradual (Nudges lentos e hábitos)" },
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
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">Qual o sistema do seu celular?</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-8">Utilizaremos isso para otimizar os formatos de exportação de agenda (.ics).</p>
              <div className="grid gap-3">
                {[
                  { value: "ios", label: "iOS (iPhone)" },
                  { value: "android", label: "Android" },
                  { value: "none", label: "Apenas Desktop / Não uso agenda" },
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
                {mut.isPending ? "Configurando Protocolo..." : "Concluir Calibração →"}
              </button>
            </div>
          )}

          {/* Navigation controls */}
          <div className="mt-8 flex justify-between border-t border-border pt-4 text-sm font-semibold text-muted-foreground">
            {step > 1 ? (
              <button onClick={prevStep} className="hover:text-foreground transition flex items-center gap-1">
                <span>←</span> Voltar
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground">
        MindReset respeita as diretrizes de privacidade e segurança do GDPR/LGPD.
      </footer>
    </div>
  );
}