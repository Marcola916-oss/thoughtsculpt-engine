import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getDiagnosis, generateDiagnosis } from "../../lib/diagnosis.functions";
import { ARCHETYPE_NAMES, type Archetype } from "../../lib/ai/archetypes";

export const Route = createFileRoute("/_authenticated/dashboard/diagnosis")({
  head: () => ({ meta: [{ title: "Diagnóstico — MindReset" }] }),
  component: DiagnosisPage,
});

const tabs = [
  { key: "financial_analysis", label: "Finanças" },
  { key: "professional_analysis", label: "Profissional" },
  { key: "romantic_analysis", label: "Relacionamentos" },
  { key: "personal_analysis", label: "Pessoal" },
] as const;

function DiagnosisPage() {
  const fetchDx = useServerFn(getDiagnosis);
  const genDx = useServerFn(generateDiagnosis);
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("financial_analysis");
  const [copied, setCopied] = useState(false);

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
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_40px_var(--accent-glow)]">
          <span className="text-6xl animate-pulse">🧠</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Seu diagnóstico está pronto para ser revelado.</h1>
        <p className="mt-4 max-w-lg text-muted-foreground leading-relaxed">
          Nossa IA estruturou uma análise psicológica profunda de 4 dimensões sobre como o seu arquétipo toma decisões invisíveis diariamente.
        </p>
        
        {mutation.error && (
          <div className="mt-6 rounded-lg bg-primary/20 px-4 py-3 text-sm font-semibold text-primary">
            {(mutation.error as Error).message}
          </div>
        )}
        
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="mt-8 group relative overflow-hidden rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_20px_var(--accent-glow)] disabled:scale-100 disabled:opacity-50"
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Gerando análise (≈ 20s)...
            </span>
          ) : (
            "Desbloquear Meu Diagnóstico"
          )}
        </button>
      </div>
    );
  }

  const content = diagnosis[tab];
  const archetypeName = ARCHETYPE_NAMES[diagnosis.archetype as Archetype]?.pt ?? diagnosis.archetype;

  const handleShare = () => {
    // Basic share copying the URL to the share token if available, or just the root
    // In a real app we'd fetch the exact share token for this lead
    const url = `${window.location.origin}/`;
    navigator.clipboard.writeText(`Eu sou o arquétipo ${archetypeName}! Descubra o seu no MindReset: ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl pb-12">
      {/* Header Premium */}
      <header className="mb-8 rounded-2xl bg-card p-6 border border-border shadow-sm print:shadow-none print:border-none">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
              <span className="text-sm font-bold text-primary">{archetypeName}</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold md:text-4xl">Dossiê Comportamental</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Análise gerada por IA em {new Date(diagnosis.generated_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-2 print:hidden">
            <button 
              onClick={() => window.print()}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              Baixar PDF
            </button>
            <button 
              onClick={handleShare}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {copied ? "Copiado!" : "Compartilhar"}
            </button>
          </div>
        </div>
      </header>

      {/* Tabs animadas */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border print:hidden">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
              tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo com tipografia premium */}
      <article className="prose prose-invert max-w-none whitespace-pre-wrap rounded-2xl border border-border bg-card p-6 md:p-8 leading-relaxed shadow-sm print:border-none print:shadow-none print:p-0">
        <h2 className="font-display text-2xl text-primary mb-6 hidden print:block">
          {tabs.find((t) => t.key === tab)?.label}
        </h2>
        {content}
      </article>

      <p className="mt-8 text-center text-xs text-muted-foreground print:text-left">
        Isenção de responsabilidade: Esta análise é baseada em padrões comportamentais identificados em suas respostas. 
        Não constitui aconselhamento financeiro, psicológico ou médico profissional.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="h-32 rounded-2xl bg-card mb-8" />
      <div className="flex gap-4 border-b border-border mb-8 pb-4">
        <div className="h-4 w-20 bg-card rounded" />
        <div className="h-4 w-20 bg-card rounded" />
      </div>
      <div className="h-96 rounded-2xl bg-card" />
    </div>
  );
}