import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";

export const getProgressData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Fetch user progress
    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch task history for the consistency grid
    const { data: tasks } = await supabase
      .from("calendar_tasks")
      .select("day_number, is_completed, is_milestone")
      .eq("user_id", userId)
      .order("day_number", { ascending: true });

    // Fetch latest monthly report
    const { data: report } = await supabase
      .from("monthly_reports")
      .select("*")
      .eq("user_id", userId)
      .order("month_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    return { progress, tasks, report };
  });

export const getAchievements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false });
    return data || [];
  });
