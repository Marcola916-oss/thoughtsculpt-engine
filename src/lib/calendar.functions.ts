import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { JSONSchema7 } from "json-schema";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";
import { callAIStructured } from "./ai/gateway.server";
import { ARCHETYPE_NAMES, type Archetype } from "./ai/archetypes";

type CalendarDay = {
  day: number;
  phase: string;
  reflective_task: string;
  action_task: string;
  is_milestone: boolean;
};

const CalendarSchema: { name: string; description: string; schema: JSONSchema7 } = {
  name: "save_calendar",
  description: "Save the personalized day-by-day action plan.",
  schema: {
    type: "object",
    properties: {
      days: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "integer", minimum: 1 },
            phase: { type: "string" },
            reflective_task: { type: "string", minLength: 20 },
            action_task: { type: "string", minLength: 20 },
            is_milestone: { type: "boolean" },
          },
          required: ["day", "phase", "reflective_task", "action_task", "is_milestone"],
          additionalProperties: false,
        },
      },
    },
    required: ["days"],
    additionalProperties: false,
  },
};

import { checkAndIncrementLimit } from "./limits.server";

export const listCalendar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: tasks }] = await Promise.all([
      supabase
        .from("profiles")
        .select("plan_started_at, plan_type, created_at")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("calendar_tasks")
        .select("*")
        .eq("user_id", userId)
        .order("day_number"),
    ]);

    if (!tasks) return [];

    const planStartedAt = profile?.plan_started_at || profile?.created_at || new Date().toISOString();
    const elapsedMs = Date.now() - new Date(planStartedAt).getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const elapsedDays = Math.floor(elapsedHours / 24);

    // +5 days unlocked every 24h during Month 1
    const month1UnlockedDays = Math.min(30, 5 * (elapsedDays + 1));

    return tasks.map((t) => {
      let isUnlocked = false;
      if (t.day_number <= 30) {
        isUnlocked = t.day_number <= month1UnlockedDays;
      } else {
        // Days > 30 (only on 6m/1y plans) unlock instantly after Month 1 (720 hours / 30 days)
        isUnlocked = elapsedHours >= 720;
      }

      // Keep task unlocked if it's already completed
      if (t.is_completed) {
        isUnlocked = true;
      }

      return {
        ...t,
        is_unlocked: isUnlocked,
      };
    });
  });

export const generateCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { count } = await supabase
      .from("calendar_tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) > 0) {
      return { generated: false, count };
    }

    const [{ data: profile }, { data: onboarding }] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, archetype, plan_type, lang")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("onboarding_answers").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    const archetype = profile?.archetype as Archetype | undefined;
    if (!archetype) throw new Error("Missing archetype.");
    if (!onboarding) throw new Error("Complete onboarding first.");

    // Check anti-abuse daily limits for 1-year plan
    const planType = profile?.plan_type || "30d";
    await checkAndIncrementLimit(supabase, userId, "calendar", planType);

    const totalDays = 30;
    const name = profile?.display_name ?? "you";
    const archName = ARCHETYPE_NAMES[archetype]?.en ?? archetype;
    const lang = profile?.lang ?? "en";

    const result = await callAIStructured<{ days: CalendarDay[] }>({
      model: "google/gemini-2.5-flash",
      jsonSchema: CalendarSchema,
      messages: [
        {
          role: "system",
          content:
            "You are the behavioral calendar engine of MindReset. Build daily action plans grounded in behavioral psychology and applied stoicism. Each task must be specific, executable, and emotionally relevant.",
        },
        {
          role: "user",
          content: `Generate a ${totalDays}-day calendar for:
- Name: ${name} | Archetype: ${archName} | Language: ${lang}
- Minutes/day: ${onboarding.daily_minutes}
- Wake: ${onboarding.wake_time} | Sleep: ${onboarding.sleep_time}
- Emotional spending trigger: ${onboarding.emotional_trigger}
- Priority financial goal: ${onboarding.financial_goal}
- Discipline style: ${onboarding.discipline_style}

Phases: days 1-7 "recognition", 8-14 "interruption", 15-21 "substitution", 22-30 "consolidation".
Milestones (is_milestone: true): days 7, 14, 21, 30.
Each day MUST have a reflective_task (mindset/journaling, ~15s reading) AND an action_task (concrete physical action). Output exactly ${totalDays} days, numbered 1..${totalDays}.`,
        },
      ],
    });

    if (!Array.isArray(result.days) || result.days.length === 0) {
      throw new Error("AI returned no calendar days.");
    }

    const rows = result.days.slice(0, totalDays).map((d) => ({
      user_id: userId,
      day_number: d.day,
      phase: d.phase,
      reflective_task: d.reflective_task,
      action_task: d.action_task,
      is_milestone: d.is_milestone,
    }));
    const { error } = await supabase.from("calendar_tasks").insert(rows);
    if (error) throw new Error(error.message);
    return { generated: true, count: rows.length };
  });

export const toggleTaskComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ task_id: z.string().uuid(), is_completed: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Safety verification: task must be unlocked to mark completed
    const { data: task } = await supabase
      .from("calendar_tasks")
      .select("day_number")
      .eq("id", data.task_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!task) throw new Error("Task not found");

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_started_at, plan_type, created_at")
      .eq("user_id", userId)
      .maybeSingle();

    const planStartedAt = profile?.plan_started_at || profile?.created_at || new Date().toISOString();
    const elapsedMs = Date.now() - new Date(planStartedAt).getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const elapsedDays = Math.floor(elapsedHours / 24);
    const month1UnlockedDays = Math.min(30, 5 * (elapsedDays + 1));

    let isUnlocked = false;
    if (task.day_number <= 30) {
      isUnlocked = task.day_number <= month1UnlockedDays;
    } else {
      isUnlocked = elapsedHours >= 720;
    }

    if (!isUnlocked && data.is_completed) {
      throw new Error("This day is currently locked.");
    }

    const { error } = await supabase
      .from("calendar_tasks")
      .update({
        is_completed: data.is_completed,
        completed_at: data.is_completed ? new Date().toISOString() : null,
      })
      .eq("id", data.task_id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveTaskNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ task_id: z.string().uuid(), notes: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("calendar_tasks")
      .update({ notes: data.notes })
      .eq("id", data.task_id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });