import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  listCalendar,
  generateCalendar,
  toggleTaskComplete,
  saveTaskNote,
  markCalendarExported,
} from "../../lib/calendar.functions";

export const Route = createFileRoute("/_authenticated/dashboard/calendar")({
  head: () => ({ meta: [{ title: "Matriz de Ação — MindReset" }] }),
  component: CalendarPage,
});

// In-memory store for pending per-task checkbox states (resets on page refresh)
type CheckState = { reflective: boolean; action: boolean };
const pendingChecks: Record<string, CheckState> = {};

function fireConfetti() {
  const count = 180;
  const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 100 };
  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  confetti({ ...defaults, particleCount: Math.floor(count * 0.25), origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ["#CC0000", "#ff4444", "#ffffff"] });
  confetti({ ...defaults, particleCount: Math.floor(count * 0.25), origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ["#CC0000", "#ff4444", "#ffffff"] });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: Math.floor(count * 0.2), origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ["#ff8800", "#ffcc00", "#ffffff"] });
    confetti({ ...defaults, particleCount: Math.floor(count * 0.2), origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ["#ff8800", "#ffcc00", "#ffffff"] });
  }, 200);
}

function CalendarPage() {
  const list = useServerFn(listCalendar);
  const gen = useServerFn(generateCalendar);
  const toggle = useServerFn(toggleTaskComplete);
  const saveNoteFn = useServerFn(saveTaskNote);
  const markExported = useServerFn(markCalendarExported);
  const qc = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  // Per-task checkbox states (in-memory)
  const [checks, setChecks] = useState<Record<string, CheckState>>({});

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["calendar"],
    queryFn: () => list(),
  });

  const handleMonthChange = (m: number) => {
    setSelectedMonth(m);
    const monthTasks = tasks.filter((t) => Math.ceil(t.day_number / 30) === m);
    const unlockedMonthTasks = monthTasks.filter((t) => (t as any).is_unlocked);
    if (unlockedMonthTasks.length > 0) {
      const uncompleted = unlockedMonthTasks.find((t) => !t.is_completed);
      if (uncompleted) {
        setSelectedDay(uncompleted.day_number);
      } else {
        setSelectedDay(unlockedMonthTasks[unlockedMonthTasks.length - 1].day_number);
      }
    } else {
      setSelectedDay(null);
    }
  };

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

  const markExportedMut = useMutation({
    mutationFn: (format: "csv" | "md" | "ics") => markExported({ data: { format } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });

  // Handle checkbox change — only commit to DB when both are checked
  const handleCheck = useCallback(
    (taskId: string, field: "reflective" | "action", wasCompleted: boolean) => {
      if (wasCompleted) {
        // Already completed — unmark via the DB toggle
        toggleMut.mutate({ task_id: taskId, is_completed: false });
        setChecks((prev) => ({ ...prev, [taskId]: { reflective: false, action: false } }));
        return;
      }

      setChecks((prev) => {
        const current = prev[taskId] ?? { reflective: false, action: false };
        const next = { ...current, [field]: !current[field] };

        // If both are now checked → mark complete in DB and fire confetti
        if (next.reflective && next.action) {
          setTimeout(() => {
            toggleMut.mutate({ task_id: taskId, is_completed: true });
            fireConfetti();
          }, 300);
        }
        return { ...prev, [taskId]: next };
      });
    },
    [toggleMut],
  );

  // Auto-select first uncompleted unlocked day when tasks load
  useEffect(() => {
    if (tasks.length > 0 && selectedDay === null) {
      const firstUncompletedUnlocked = tasks.find((t) => (t as any).is_unlocked && !t.is_completed);
      if (firstUncompletedUnlocked) {
        setSelectedDay(firstUncompletedUnlocked.day_number);
        setSelectedMonth(Math.ceil(firstUncompletedUnlocked.day_number / 30));
      } else {
        const unlocked = tasks.filter((t) => (t as any).is_unlocked);
        if (unlocked.length > 0) {
          const lastUnlocked = unlocked[unlocked.length - 1];
          setSelectedDay(lastUnlocked.day_number);
          setSelectedMonth(Math.ceil(lastUnlocked.day_number / 30));
        }
      }
    }
  }, [tasks, selectedDay]);

  if (isLoading) return <div className="h-64 max-w-4xl animate-pulse rounded-2xl bg-card" />;

  if (tasks.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center py-12">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_40px_var(--accent-glow)]">
          <span className="text-6xl animate-pulse">📅</span>
        </div>
        <h1 className="font-display text-3xl font-bold">Sua Matriz de Ação está vazia.</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Gere agora seu protocolo de 30 dias. Ele é desenhado especificamente para quebrar as
          reações automáticas do seu arquétipo.
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
              Construindo matriz (Pode levar até 1 minuto)...
            </span>
          ) : (
            "Gerar Minha Matriz de Ação"
          )}
        </button>
      </div>
    );
  }

  const active = tasks.find((t) => t.day_number === selectedDay);
  const totalMonths = Math.ceil(tasks.length / 30);
  const visibleTasks = tasks.filter((t) => Math.ceil(t.day_number / 30) === selectedMonth);
  const activeChecks = active ? (checks[active.id] ?? { reflective: false, action: false }) : null;

  const exportCSV = () => {
    const header = "Dia,Fase,Marco,Tarefa Reflexiva,Tarefa de Ação,Concluído\n";
    const rows = tasks
      .filter((t) => (t as any).is_unlocked)
      .map(
        (t) =>
          `${t.day_number},${t.phase},${t.is_milestone ? "Sim" : "Não"},"${t.reflective_task?.replace(/"/g, '""') || ""}","${t.action_task?.replace(/"/g, '""') || ""}",${t.is_completed ? "Sim" : "Não"}`,
      )
      .join("\n");
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mindreset_action_matrix.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
    markExportedMut.mutate("csv");
  };

  const exportMD = () => {
    const md =
      `# MindReset Action Matrix\n\n` +
      tasks
        .filter((t) => (t as any).is_unlocked)
        .map(
          (t) =>
            `## Dia ${t.day_number} (${t.phase})${t.is_milestone ? " ⭐" : ""}\n- [${t.is_completed ? "x" : " "}] **Reflexão:** ${t.reflective_task}\n- [${t.is_completed ? "x" : " "}] **Ação:** ${t.action_task}\n`,
        )
        .join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mindreset_action_matrix.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
    markExportedMut.mutate("md");
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_400px]">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-display text-3xl font-extrabold">Matriz de Ação</h1>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary transition"
            >
              📥 Exportar
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-xl z-10">
                <button
                  onClick={exportCSV}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
                >
                  CSV (Planilha)
                </button>
                <button
                  onClick={exportMD}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
                >
                  Markdown (.md)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Month Tabs pagination */}
        {totalMonths > 1 && (
          <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
            {Array.from({ length: totalMonths }).map((_, idx) => {
              const m = idx + 1;
              return (
                <button
                  key={m}
                  onClick={() => handleMonthChange(m)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    selectedMonth === m
                      ? "bg-primary text-primary-foreground shadow-[0_0_10px_var(--accent-glow)] font-bold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  Mês {m}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-5 gap-3 md:grid-cols-7">
          {visibleTasks.map((t) => {
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
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {isUnlocked ? "Dia" : "Bloqueado"}
                </div>
                <div
                  className={`font-display text-2xl font-bold ${isActive || t.is_completed ? "text-foreground" : ""}`}
                >
                  {isUnlocked ? t.day_number : "🔒"}
                </div>
                {isUnlocked && t.is_milestone && (
                  <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] shadow-lg">
                    ⭐
                  </div>
                )}
                {isUnlocked && t.is_completed && (
                  <div className="absolute bottom-1 right-1 text-success text-xs">✓</div>
                )}
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
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                  MARCO
                </span>
              )}
            </div>

            {/* Task content */}
            <div className="space-y-4">
              <div className={`rounded-xl border p-4 transition-all ${active.is_completed || activeChecks?.reflective ? "border-success/30 bg-success/5" : "border-border bg-background"}`}>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">🧠 Reflexão</div>
                <p className={`text-sm leading-relaxed ${active.is_completed || activeChecks?.reflective ? "text-foreground line-through opacity-70" : "text-foreground"}`}>
                  {active.reflective_task ?? ""}
                </p>
              </div>
              <div className={`rounded-xl border p-4 transition-all ${active.is_completed || activeChecks?.action ? "border-success/30 bg-success/5" : "border-border bg-background"}`}>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">⚡ Ação Prática</div>
                <p className={`text-sm leading-relaxed ${active.is_completed || activeChecks?.action ? "text-foreground line-through opacity-70" : "text-foreground"}`}>
                  {active.action_task ?? ""}
                </p>
              </div>
            </div>

            {/* Dual checkboxes */}
            {!active.is_completed && (
              <div className="mt-6 space-y-3 border-t border-border pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Marque o que você concluiu hoje:
                </p>

                {/* Reflective checkbox */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all hover:scale-[1.01] ${
                    activeChecks?.reflective
                      ? "border-success/40 bg-success/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      activeChecks?.reflective
                        ? "border-success bg-success text-white"
                        : "border-border"
                    }`}
                    onClick={() => handleCheck(active.id, "reflective", false)}
                  >
                    {activeChecks?.reflective && <span className="text-xs font-bold">✓</span>}
                  </div>
                  <span className={`text-sm font-semibold ${activeChecks?.reflective ? "text-success" : "text-foreground"}`}>
                    🧠 Tarefa Reflexiva Concluída
                  </span>
                </label>

                {/* Action checkbox */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all hover:scale-[1.01] ${
                    activeChecks?.action
                      ? "border-success/40 bg-success/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      activeChecks?.action
                        ? "border-success bg-success text-white"
                        : "border-border"
                    }`}
                    onClick={() => handleCheck(active.id, "action", false)}
                  >
                    {activeChecks?.action && <span className="text-xs font-bold">✓</span>}
                  </div>
                  <span className={`text-sm font-semibold ${activeChecks?.action ? "text-success" : "text-foreground"}`}>
                    ⚡ Tarefa de Ação Concluída
                  </span>
                </label>

                {/* Progress indicator */}
                {(activeChecks?.reflective || activeChecks?.action) && !(activeChecks?.reflective && activeChecks?.action) && (
                  <p className="text-xs text-muted-foreground text-center animate-pulse">
                    ✨ Quase lá! Complete a outra tarefa para registrar o dia.
                  </p>
                )}
              </div>
            )}

            {/* Already completed — show undo */}
            {active.is_completed && (
              <button
                onClick={() => {
                  toggleMut.mutate({ task_id: active.id, is_completed: false });
                  setChecks((prev) => ({ ...prev, [active.id]: { reflective: false, action: false } }));
                }}
                className="mt-6 w-full rounded-xl border border-border bg-background py-3 text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
              >
                Desmarcar Conclusão
              </button>
            )}

            <div className="mt-6 border-t border-border pt-6">
              <label className="mb-2 block text-sm font-bold text-foreground">
                Diário de Bordo
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-xl border border-border bg-background p-3 text-sm outline-none transition focus:border-primary resize-y"
                placeholder="Como você se sentiu fazendo isso? (Salvo automaticamente)"
                defaultValue={active.notes ?? ""}
                onBlur={(e) => saveNoteMut.mutate({ task_id: active.id, notes: e.target.value })}
              />
            </div>
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
