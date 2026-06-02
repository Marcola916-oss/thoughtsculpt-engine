import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listCalendar, generateCalendar, toggleTaskComplete } from "../../lib/calendar.functions";

export const Route = createFileRoute("/_authenticated/dashboard/calendar")({
  head: () => ({ meta: [{ title: "Action Matrix — MindReset" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const list = useServerFn(listCalendar);
  const gen = useServerFn(generateCalendar);
  const toggle = useServerFn(toggleTaskComplete);
  const qc = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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

  if (isLoading) return <div className="animate-pulse h-64 max-w-4xl rounded-2xl bg-card" />;

  if (tasks.length === 0) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold">Your Action Matrix is empty.</h1>
        <p className="mt-3 text-muted-foreground">
          Generate your 30-day personalized protocol based on your archetype and onboarding answers.
        </p>
        {generate.error && (
          <p className="mt-4 text-sm text-primary">{(generate.error as Error).message}</p>
        )}
        <button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="mt-8 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {generate.isPending ? "Building your matrix… (≈ 30s)" : "Generate my 30-day matrix"}
        </button>
      </div>
    );
  }

  const active = tasks.find((t) => t.day_number === selectedDay);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="mb-6 font-display text-3xl font-extrabold">Action Matrix</h1>
        <div className="grid grid-cols-5 gap-2 md:grid-cols-7">
          {tasks.map((t) => {
            const isActive = t.day_number === selectedDay;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedDay(t.day_number)}
                className={`aspect-square rounded-lg border p-2 text-left transition ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : t.is_completed
                    ? "border-success/40 bg-success/5 text-success"
                    : t.is_milestone
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card hover:border-primary/60"
                }`}
              >
                <div className="text-xs text-muted-foreground">Day</div>
                <div className="font-display text-lg font-bold">{t.day_number}</div>
                {t.is_milestone && <div className="text-[10px] text-primary">★ milestone</div>}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-border bg-card p-6">
        {active ? (
          <>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{active.phase} · Day {active.day_number}</p>
            <h2 className="mt-2 font-display text-xl font-bold">Today's tasks</h2>
            <Task
              label="🧠 Reflective"
              text={active.reflective_task ?? ""}
              done={active.is_completed}
              onToggle={() => toggleMut.mutate({ task_id: active.id, is_completed: !active.is_completed })}
            />
            <Task
              label="⚡ Action"
              text={active.action_task ?? ""}
              done={active.is_completed}
              onToggle={() => toggleMut.mutate({ task_id: active.id, is_completed: !active.is_completed })}
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select a day to see today's tasks.</p>
        )}
      </aside>
    </div>
  );
}

function Task({ label, text, done, onToggle }: { label: string; text: string; done: boolean; onToggle: () => void }) {
  return (
    <div className="mt-4 rounded-xl border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <button
          onClick={onToggle}
          className={`text-xs ${done ? "text-success" : "text-primary"}`}
        >
          {done ? "✓ done" : "mark done"}
        </button>
      </div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}