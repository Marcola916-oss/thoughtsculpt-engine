import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { listCalendar, generateCalendar, toggleTaskComplete, saveTaskNote } from "../../lib/calendar.functions";

export const Route = createFileRoute("/_authenticated/dashboard/calendar")({
  head: () => ({ meta: [{ title: "Matriz de Ação — MindReset" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const list = useServerFn(listCalendar);
  const gen = useServerFn(generateCalendar);
  const toggle = useServerFn(toggleTaskComplete);
  const saveNoteFn = useServerFn(saveTaskNote);
  const qc = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["calendar"],
    queryFn: () => list(),
  });

  const generate = useMutation({
    mutationFn: () => gen(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });

  const toggleMut = useMutation({
    mutationFn: (vars: { task_id: string; is_completed: boolean }) => toggle({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });

  const saveNoteMut = useMutation({
    mutationFn: (vars: { task_id: string; notes: string }) => saveNoteFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });

  if (isLoading) return <div className="h-64 max-w-4xl animate-pulse rounded-2xl bg-card" />;

  if (tasks.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center py-12">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_40px_var(--accent-glow)]">
          <span className="text-6xl animate-pulse">📅</span>
        </div>
        <h1 className="font-display text-3xl font-bold">Sua Matriz de Ação está vazia.</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Gere agora seu protocolo de 30 dias. Ele é desenhado especificamente para quebrar as reações automáticas do seu arquétipo.
        </p>
        {generate.error && (
          <p className="mt-4 text-sm text-primary">{(generate.error as Error).message}</p>
        )}
        <button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="mt-8 group relative overflow-hidden rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_20px_var(--accent-glow)] disabled:scale-100 disabled:opacity-50"
        >
          {generate.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Construindo matriz (≈ 30s)...
            </span>
          ) : (
            "Gerar Minha Matriz de Ação"
          )}
        </button>
      </div>
    );
  }

  const active = tasks.find((t) => t.day_number === selectedDay);

  const exportCSV = () => {
    const header = "Dia,Fase,Marco,Tarefa Reflexiva,Tarefa de Ação,Concluído\n";
    const rows = tasks.map(t => `${t.day_number},${t.phase},${t.is_milestone ? 'Sim' : 'Não'},"${t.reflective_task.replace(/"/g, '""')}","${t.action_task.replace(/"/g, '""')}",${t.is_completed ? 'Sim' : 'Não'}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mindreset_action_matrix.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportMD = () => {
    const md = `# MindReset Action Matrix\n\n` + tasks.map(t => `## Dia ${t.day_number} (${t.phase})${t.is_milestone ? ' ⭐' : ''}\n- [${t.is_completed ? 'x' : ' '}] **Reflexão:** ${t.reflective_task}\n- [${t.is_completed ? 'x' : ' '}] **Ação:** ${t.action_task}\n`).join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mindreset_action_matrix.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_400px]">
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-extrabold">Matriz de Ação</h1>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:border-primary transition"
            >
              📥 Exportar
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-xl z-10">
                <button onClick={exportCSV} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary">CSV (Planilha)</button>
                <button onClick={exportMD} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary">Markdown (.md)</button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 md:grid-cols-7">
          {tasks.map((t) => {
            const isUnlocked = (t as any).is_unlocked !== false;
            const isActive = t.day_number === selectedDay;
            return (
              <button
                key={t.id}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && setSelectedDay(t.day_number)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border transition-all duration-300 ${
                  !isUnlocked
                    ? "border-border bg-card/50 opacity-40 blur-[1px] cursor-not-allowed"
                    : isActive
                    ? "border-primary bg-primary/20 shadow-[0_0_15px_var(--accent-glow)] hover:scale-[1.05]"
                    : t.is_completed
                    ? "border-success/40 bg-success/10 text-success hover:scale-[1.05]"
                    : t.is_milestone
                    ? "border-primary/50 bg-primary/5 hover:scale-[1.05]"
                    : "border-border bg-card hover:border-primary/60 hover:scale-[1.05]"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{isUnlocked ? "Dia" : "Bloqueado"}</div>
                <div className={`font-display text-2xl font-bold ${isActive || t.is_completed ? "text-foreground" : ""}`}>
                  {isUnlocked ? t.day_number : "🔒"}
                </div>
                {isUnlocked && t.is_milestone && <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] shadow-lg">⭐</div>}
                {isUnlocked && t.is_completed && <div className="absolute bottom-1 right-1 text-success text-xs">✓</div>}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-fit">
        {active ? (
          <>
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Fase: {active.phase}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold">Dia {active.day_number}</h2>
              </div>
              {active.is_milestone && (
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">MARCO</span>
              )}
            </div>

            <div className="space-y-4">
              <Task
                label="🧠 Reflexão"
                text={active.reflective_task ?? ""}
                done={active.is_completed}
              />
              <Task
                label="⚡ Ação Prática"
                text={active.action_task ?? ""}
                done={active.is_completed}
              />
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <label className="mb-2 block text-sm font-bold text-foreground">Diário de Bordo</label>
              <textarea 
                className="w-full min-h-[120px] rounded-xl border border-border bg-background p-3 text-sm outline-none transition focus:border-primary resize-y"
                placeholder="Como você se sentiu fazendo isso? (Salvo automaticamente)"
                defaultValue={active.notes ?? ""}
                onBlur={(e) => saveNoteMut.mutate({ task_id: active.id, notes: e.target.value })}
              />
            </div>

            <button
              onClick={() => {
                if (!active.is_completed) {
                  // Simula confetti trigger (apenas class CSS visual, no app real poderia usar canvas-confetti)
                  document.getElementById(`btn-complete-${active.id}`)?.classList.add("animate-bounce");
                }
                toggleMut.mutate({ task_id: active.id, is_completed: !active.is_completed });
              }}
              id={`btn-complete-${active.id}`}
              className={`mt-6 w-full rounded-xl py-4 font-bold transition-all ${
                active.is_completed 
                ? "bg-background border border-border text-muted-foreground hover:bg-secondary" 
                : "bg-success text-success-foreground hover:bg-success/90 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              }`}
            >
              {active.is_completed ? "Desmarcar Conclusão" : "✓ Marcar Dia como Concluído"}
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground py-12 opacity-50">
            <span className="text-4xl mb-4">👆</span>
            <p>Selecione um dia no calendário para ver suas tarefas e registrar seu progresso.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Task({ label, text, done }: { label: string; text: string; done: boolean }) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${done ? "border-success/30 bg-success/5" : "border-border bg-background"}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={`text-sm leading-relaxed ${done ? "text-foreground line-through opacity-70" : "text-foreground"}`}>{text}</p>
    </div>
  );
}