import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getDiagnosis, generateDiagnosis } from "../../lib/diagnosis.functions";

export const Route = createFileRoute("/_authenticated/dashboard/diagnosis")({
  head: () => ({ meta: [{ title: "Diagnosis — MindReset" }] }),
  component: DiagnosisPage,
});

const tabs = [
  { key: "financial_analysis", label: "Financial" },
  { key: "professional_analysis", label: "Professional" },
  { key: "romantic_analysis", label: "Romantic" },
  { key: "personal_analysis", label: "Personal" },
] as const;

function DiagnosisPage() {
  const fetchDx = useServerFn(getDiagnosis);
  const genDx = useServerFn(generateDiagnosis);
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("financial_analysis");

  const { data: diagnosis, isLoading } = useQuery({
    queryKey: ["diagnosis"],
    queryFn: () => fetchDx(),
  });

  const mutation = useMutation({
    mutationFn: () => genDx(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diagnosis"] }),
  });

  if (isLoading) return <Skeleton />;

  if (!diagnosis) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold">Your diagnosis is ready to be generated.</h1>
        <p className="mt-3 text-muted-foreground">
          A 4-dimension psychological analysis crafted from your quiz answers and archetype.
        </p>
        {mutation.error ? (
          <p className="mt-4 text-sm text-primary">{(mutation.error as Error).message}</p>
        ) : null}
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="mt-8 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? "Generating… (≈ 30s)" : "Generate my diagnosis"}
        </button>
      </div>
    );
  }

  const content = diagnosis[tab];
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold">Your diagnosis</h1>
        <p className="text-xs text-muted-foreground">
          Generated on {new Date(diagnosis.generated_at).toLocaleDateString()}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition ${
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <article className="prose prose-invert max-w-none whitespace-pre-wrap rounded-2xl border border-border bg-card p-6 leading-relaxed">
        {content}
      </article>

      <p className="mt-8 text-xs text-muted-foreground">
        This diagnosis is a behavioral analysis based on your quiz responses. It does not constitute professional medical, psychological, or financial advice.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="h-8 w-48 rounded bg-card" />
      <div className="mt-4 h-4 w-32 rounded bg-card" />
      <div className="mt-8 h-64 rounded-2xl bg-card" />
    </div>
  );
}