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

function CompassPage() {
  const list = useServerFn(listCompass);
  const run = useServerFn(analyzeCompass);
  const qc = useQueryClient();

  const [form, setForm] = useState({
    target_name: "",
    relationship_type: "professional" as "professional" | "romantic" | "family" | "general",
    context: "",
    observations: "",
  });

  const { data: history = [] } = useQuery({ queryKey: ["compass"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: () => run({ data: form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compass"] });
      setForm((f) => ({ ...f, target_name: "", context: "", observations: "" }));
    },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    mut.mutate();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
      <section>
        <h1 className="font-display text-3xl font-extrabold">Compass</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Analyze the probable archetype of someone in your life. Based on your perception — not a clinical diagnosis.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            required
            placeholder="Their name"
            value={form.target_name}
            onChange={(e) => setForm({ ...form, target_name: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
          />
          <select
            value={form.relationship_type}
            onChange={(e) => setForm({ ...form, relationship_type: e.target.value as typeof form.relationship_type })}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
          >
            <option value="professional">Professional</option>
            <option value="romantic">Romantic</option>
            <option value="family">Family</option>
            <option value="general">General</option>
          </select>
          <input
            required
            placeholder="What do you want to understand or solve?"
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
          />
          <textarea
            required
            placeholder="Describe their behavior around money, decisions, status, emotions… (10+ chars)"
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            rows={5}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
          />
          {mut.error && <p className="text-sm text-primary">{(mut.error as Error).message}</p>}
          <button
            disabled={mut.isPending}
            className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {mut.isPending ? "Analyzing…" : "Analyze"}
          </button>
        </form>

        {mut.data?.analysis_content && (
          <article className="mt-8 rounded-2xl border border-primary/40 bg-card p-6">
            <h3 className="font-display text-xl font-bold text-primary">
              Likely {ARCHETYPE_NAMES[(mut.data.probable_archetype ?? "AO") as Archetype].en}
            </h3>
            <CompassReport data={mut.data.analysis_content as never} />
          </article>
        )}
      </section>

      <aside>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent</h2>
        <ul className="space-y-2">
          {history.length === 0 && <li className="text-xs text-muted-foreground">No analyses yet.</li>}
          {history.map((h) => (
            <li key={h.id} className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold">{h.target_name}</div>
              <div className="text-xs text-muted-foreground">
                {h.relationship_type} · {h.probable_archetype}
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function CompassReport({ data }: { data: { archetype_in_context?: string; dynamic_analysis?: string; interaction_strategies?: string[]; communication_script?: string; what_to_avoid?: string[]; perception_disclaimer?: string } }) {
  return (
    <div className="mt-4 space-y-4 text-sm leading-relaxed">
      {data.perception_disclaimer && <p className="text-xs italic text-muted-foreground">{data.perception_disclaimer}</p>}
      {data.archetype_in_context && <p>{data.archetype_in_context}</p>}
      {data.dynamic_analysis && (
        <div>
          <h4 className="font-semibold">Dynamic with you</h4>
          <p>{data.dynamic_analysis}</p>
        </div>
      )}
      {data.interaction_strategies && (
        <div>
          <h4 className="font-semibold">Strategies</h4>
          <ul className="list-disc pl-5">{data.interaction_strategies.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      {data.communication_script && (
        <div>
          <h4 className="font-semibold">Try saying</h4>
          <p className="rounded-lg bg-background/50 p-3 italic">"{data.communication_script}"</p>
        </div>
      )}
      {data.what_to_avoid && (
        <div>
          <h4 className="font-semibold">Avoid</h4>
          <ul className="list-disc pl-5">{data.what_to_avoid.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}