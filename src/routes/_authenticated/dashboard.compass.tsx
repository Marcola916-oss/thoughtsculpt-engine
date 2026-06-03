import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { listCompass, analyzeCompass } from "../../lib/compass.functions";
import { ARCHETYPE_NAMES, type Archetype } from "../../lib/ai/archetypes";

export const Route = createFileRoute("/_authenticated/dashboard/compass")({
  head: () => ({ meta: [{ title: "Compass — MindReset" }] }),
  component: CompassPage,
});

// Type for the stored analysis row
type CompassAnalysis = {
  id: string;
  target_name: string;
  relationship_type: string | null;
  probable_archetype: string | null;
  analysis_content: any;
  created_at: string;
  context?: string | null;
  observations?: string | null;
};

function CompassPage() {
  const list = useServerFn(listCompass);
  const run = useServerFn(analyzeCompass);
  const qc = useQueryClient();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    target_name: "",
    relationship_type: "professional" as "professional" | "romantic" | "family" | "general",
    context: "",
    observations: "",
  });

  // The analysis currently being viewed (could be a past one or the new one)
  const [activeAnalysis, setActiveAnalysis] = useState<CompassAnalysis | null>(null);

  const { data: history = [] } = useQuery({ queryKey: ["compass"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: () => run({ data: form }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["compass"] });
      setActiveAnalysis(data as unknown as CompassAnalysis);
      setStep(3);
    },
  });

  function handleNext(e: FormEvent) {
    e.preventDefault();
    if (step === 1 && form.target_name.trim() !== "") {
      setStep(2);
    } else if (step === 2 && form.context && form.observations) {
      mut.mutate();
    }
  }

  function handleReset() {
    setForm({ target_name: "", relationship_type: "professional", context: "", observations: "" });
    setStep(1);
    setActiveAnalysis(null);
    mut.reset();
  }

  // Load a historical analysis into view
  function handleLoadHistory(entry: CompassAnalysis) {
    setActiveAnalysis(entry);
    setForm({
      target_name: entry.target_name,
      relationship_type: (entry.relationship_type ?? "general") as any,
      context: entry.context ?? "",
      observations: entry.observations ?? "",
    });
    setStep(3);
    mut.reset();
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px]">
      <section>
        <header className="mb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary shadow-[0_0_20px_var(--accent-glow)]">🧭</div>
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">Compass</h1>
          <p className="mt-2 text-muted-foreground">
            Decodifique o comportamento financeiro de pessoas ao seu redor e descubra a melhor forma de se comunicar com elas.
          </p>
        </header>

        {/* --- FORM STEPS --- */}
        {step < 3 && !mut.isPending && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            {/* Progress Bar */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
            </div>

            <form onSubmit={handleNext} className="space-y-6">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="mb-6 font-display text-2xl font-bold">Quem vamos analisar?</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Nome da pessoa</label>
                      <input
                        required
                        autoFocus
                        placeholder="Ex: João, Sócio, Minha esposa"
                        value={form.target_name}
                        onChange={(e) => setForm({ ...form, target_name: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Qual a sua relação com ela?</label>
                      <select
                        value={form.relationship_type}
                        onChange={(e) => setForm({ ...form, relationship_type: e.target.value as any })}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        <option value="professional">Profissional (Colega, Chefe, Sócio)</option>
                        <option value="romantic">Romântica (Cônjuge, Namorado/a)</option>
                        <option value="family">Familiar (Pai, Mãe, Irmão)</option>
                        <option value="general">Geral (Amigo, Conhecido)</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="mt-8 w-full rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground transition hover:opacity-90 hover:shadow-[0_0_15px_var(--accent-glow)]">
                    Continuar →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="mb-6 font-display text-2xl font-bold">Comportamento de {form.target_name}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Qual o contexto/problema atual?</label>
                      <input
                        required
                        autoFocus
                        placeholder="Ex: Precisamos alinhar os gastos da casa"
                        value={form.context}
                        onChange={(e) => setForm({ ...form, context: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Como {form.target_name} lida com dinheiro, risco ou emoções?</label>
                      <textarea
                        required
                        placeholder="Ex: Fica ansioso quando falo de cortar gastos, mas sempre compra coisas caras para impressionar os outros..."
                        value={form.observations}
                        onChange={(e) => setForm({ ...form, observations: e.target.value })}
                        rows={5}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-border px-6 py-4 font-bold text-muted-foreground hover:text-foreground">
                      ← Voltar
                    </button>
                    <button type="submit" className="flex-1 rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground transition hover:opacity-90 hover:shadow-[0_0_15px_var(--accent-glow)]">
                      Analisar Perfil
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* --- LOADING STATE --- */}
        {mut.isPending && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center shadow-sm animate-in fade-in">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_30px_var(--accent-glow)]">
              <span className="text-4xl animate-[spin_3s_linear_infinite]">🧭</span>
            </div>
            <h2 className="font-display text-2xl font-bold">Decodificando {form.target_name}...</h2>
            <p className="mt-2 text-muted-foreground">Analisando padrões comportamentais via IA.</p>
          </div>
        )}

        {/* --- RESULT STATE --- */}
        {step === 3 && activeAnalysis?.analysis_content && !mut.isPending && (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <article className="overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-[0_8px_30px_var(--accent-glow)]">
              <div className="bg-primary/10 p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Arquétipo Provável</p>
                <h2 className="mt-1 font-display text-3xl font-extrabold text-foreground">
                  {ARCHETYPE_NAMES[(activeAnalysis.probable_archetype ?? "AO") as Archetype]?.pt}
                </h2>
                <p className="mt-1 text-sm font-bold text-primary">
                  {activeAnalysis.probable_archetype}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeAnalysis.target_name} — {
                    activeAnalysis.relationship_type === "romantic"
                      ? "Relação Romântica"
                      : activeAnalysis.relationship_type === "professional"
                      ? "Relação Profissional"
                      : activeAnalysis.relationship_type === "family"
                      ? "Relação Familiar"
                      : "Relação Geral"
                  }
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Análise de {new Date(activeAnalysis.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="p-6 md:p-8">
                <CompassReport data={activeAnalysis.analysis_content as never} />

                <button onClick={handleReset} className="mt-8 w-full rounded-xl border border-border py-4 font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition">
                  ＋ Fazer nova análise
                </button>
              </div>
            </article>
          </div>
        )}

        {mut.error && (
          <div className="mt-6 rounded-lg bg-primary/20 px-4 py-3 text-sm font-semibold text-primary">
            {(mut.error as Error).message}
            <button onClick={() => mut.reset()} className="ml-4 underline">Tentar novamente</button>
          </div>
        )}
      </section>

      {/* --- SIDEBAR HISTORY --- */}
      <aside>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Análises Anteriores</h2>
          {history.length > 0 && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {history.length}
            </span>
          )}
        </div>
        <ul className="space-y-3">
          {history.length === 0 && (
            <li className="rounded-xl border border-border border-dashed bg-card/50 p-4 text-center text-xs text-muted-foreground">
              Nenhuma análise feita ainda.
            </li>
          )}
          {(history as unknown as CompassAnalysis[]).map((h) => {
            const isActive = activeAnalysis?.id === h.id;
            return (
              <li
                key={h.id}
                onClick={() => handleLoadHistory(h)}
                className={`group cursor-pointer rounded-xl border p-4 transition-all hover:border-primary hover:shadow-sm ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-[0_0_10px_var(--accent-glow)]"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-display font-bold truncate flex-1 mr-2">{h.target_name}</div>
                  <div className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {h.probable_archetype}
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="uppercase">{h.relationship_type}</span>
                  <span>•</span>
                  <span>{new Date(h.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                {isActive && (
                  <div className="mt-1.5 text-[10px] font-semibold text-primary">▶ Visualizando agora</div>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

function CompassReport({ data }: { data: { archetype_in_context?: string; dynamic_analysis?: string; interaction_strategies?: string[]; communication_script?: string; what_to_avoid?: string[]; perception_disclaimer?: string } }) {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      {data.perception_disclaimer && (
        <div className="rounded-lg border-l-2 border-warning bg-warning/10 p-3 text-xs italic text-warning-foreground">
          ⚠️ {data.perception_disclaimer}
        </div>
      )}

      {data.archetype_in_context && (
        <section>
          <h4 className="mb-2 font-bold text-foreground">Como o arquétipo se manifesta</h4>
          <p className="text-muted-foreground">{data.archetype_in_context}</p>
        </section>
      )}

      {data.dynamic_analysis && (
        <section>
          <h4 className="mb-2 font-bold text-foreground">Dinâmica com você</h4>
          <p className="text-muted-foreground">{data.dynamic_analysis}</p>
        </section>
      )}

      {data.interaction_strategies && (
        <section>
          <h4 className="mb-2 font-bold text-foreground">Estratégias de Interação</h4>
          <ul className="grid gap-2">
            {data.interaction_strategies.map((s, i) => (
              <li key={i} className="flex gap-2 rounded-lg bg-secondary p-3 text-foreground">
                <span className="text-primary">✦</span> {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.communication_script && (
        <section>
          <h4 className="mb-2 font-bold text-foreground">O que dizer (Script Sugerido)</h4>
          <p className="relative rounded-xl border border-border bg-background p-4 italic text-foreground shadow-sm">
            <span className="absolute -top-3 left-4 bg-background px-1 text-2xl text-primary">"</span>
            {data.communication_script}
            <span className="absolute -bottom-5 right-4 bg-background px-1 text-2xl text-primary">"</span>
          </p>
        </section>
      )}

      {data.what_to_avoid && (
        <section>
          <h4 className="mb-2 font-bold text-primary">O que NÃO dizer/fazer</h4>
          <ul className="space-y-2">
            {data.what_to_avoid.map((s, i) => (
              <li key={i} className="flex gap-2 text-muted-foreground">
                <span className="text-primary">✕</span> {s}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}