import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";
import { callAIStructured } from "./ai/gateway.server";
import type { JSONSchema7 } from "json-schema";

const ReportSchema: { name: string; description: string; schema: JSONSchema7 } = {
  name: "monthly_report",
  description: "Generate a monthly behavioral finance report.",
  schema: {
    type: "object",
    properties: {
      consistency_score: { type: "integer", minimum: 0, maximum: 100 },
      performance_badge: { type: "string" },
      month_headline: { type: "string", minLength: 10 },
      month_summary: { type: "string", minLength: 50 },
      behavioral_insight: { type: "string", minLength: 50 },
      next_month_challenge: { type: "string", minLength: 30 },
      motivational_close: { type: "string", minLength: 30 },
    },
    required: [
      "consistency_score",
      "performance_badge",
      "month_headline",
      "month_summary",
      "behavioral_insight",
      "next_month_challenge",
      "motivational_close",
    ],
    additionalProperties: false,
  },
};

export const generateMonthlyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [{ data: profile }, { data: tasks }, { data: existingReport }] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, archetype, lang, plan_started_at, created_at")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("calendar_tasks")
        .select("day_number, is_completed, is_milestone, reflective_task, action_task, completed_at")
        .eq("user_id", userId)
        .order("day_number"),
      supabase
        .from("monthly_reports")
        .select("month_number")
        .eq("user_id", userId)
        .order("month_number", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const planStartedAt = profile?.plan_started_at || profile?.created_at;
    if (!planStartedAt) throw new Error("No plan start date found.");

    const elapsedDays = Math.floor(
      (Date.now() - new Date(planStartedAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    const currentMonth = Math.floor(elapsedDays / 30) + 1;

    // Don't regenerate if already exists for this month
    if (existingReport && existingReport.month_number === currentMonth) {
      return { generated: false, month: currentMonth };
    }

    const completedTasks = tasks?.filter((t) => t.is_completed) ?? [];
    const totalTasks = tasks?.filter((t) => t.day_number <= currentMonth * 30) ?? [];
    const milestonesHit = completedTasks.filter((t) => t.is_milestone).length;

    const name = profile?.display_name ?? "User";
    const lang = profile?.lang ?? "en";
    const archetype = profile?.archetype ?? "unknown";

    const result = await callAIStructured<{
      consistency_score: number;
      performance_badge: string;
      month_headline: string;
      month_summary: string;
      behavioral_insight: string;
      next_month_challenge: string;
      motivational_close: string;
    }>({
      model: "google/gemini-2.5-flash",
      jsonSchema: ReportSchema,
      messages: [
        {
          role: "system",
          content: `You are the monthly report engine of MindReset, a behavioral finance platform. Generate insightful, encouraging reports in ${lang}. Be concise but warm. Focus on behavioral patterns, not just completion stats.`,
        },
        {
          role: "user",
          content: `Generate Month ${currentMonth} report for ${name} (archetype: ${archetype}).
- Days completed: ${completedTasks.length} / ${totalTasks.length}
- Milestones hit: ${milestonesHit}
- Streak data: ${completedTasks.length} total completions
- First 5 completed tasks: ${completedTasks.slice(0, 5).map((t) => `Day ${t.day_number}: ${t.action_task?.slice(0, 60)}`).join("; ")}
- Plan started: ${planStartedAt}

Provide:
1. consistency_score (0-100)
2. performance_badge (short badge name like "Consistency Warrior", "Silent Progress", etc.)
3. month_headline (catchy title)
4. month_summary (2-3 sentences overview)
5. behavioral_insight (1-2 sentences about their pattern)
6. next_month_challenge (1 sentence challenge for next month)
7. motivational_close (1 sentence closing)`,
        },
      ],
    });

    const { error } = await supabase.from("monthly_reports").insert({
      user_id: userId,
      month_number: currentMonth,
      consistency_score: result.consistency_score,
      performance_badge: result.performance_badge,
      month_headline: result.month_headline,
      month_summary: result.month_summary,
      behavioral_insight: result.behavioral_insight,
      next_month_challenge: result.next_month_challenge,
      motivational_close: result.motivational_close,
      raw_data: {
        completed: completedTasks.length,
        total: totalTasks.length,
        milestones: milestonesHit,
      },
    });

    if (error) throw new Error(error.message);
    return { generated: true, month: currentMonth };
  });
