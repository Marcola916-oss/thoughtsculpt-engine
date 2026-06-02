import type { SupabaseClient } from "@supabase/supabase-js";

export async function checkAndIncrementLimit(
  supabase: SupabaseClient,
  userId: string,
  limitType: "generation" | "calendar" | "pdf",
  planType: string
) {
  if (planType !== "1y") return; // Limit checks only apply to 1-year plan per specifications

  const today = new Date().toISOString().split("T")[0];
  const maxLimits = {
    generations: 10,
    calendars: 15,
    pdfs: 15,
  };
  const fieldMap = {
    generation: "generations_count",
    calendar: "calendars_count",
    pdf: "pdfs_count",
  } as const;
  const field = fieldMap[limitType];
  const limitMax = maxLimits[`${limitType}s` as "generations" | "calendars" | "pdfs"];

  // Fetch daily limit row
  const { data, error } = await supabase
    .from("daily_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (error) throw new Error(error.message);

  let currentCount = 0;
  if (data) {
    currentCount = data[field] || 0;
  } else {
    // Insert new row
    const { error: insertErr } = await supabase
      .from("daily_limits")
      .insert({ user_id: userId, date: today, generations_count: 0, calendars_count: 0, pdfs_count: 0 });
    // If conflict, we will fetch again
    if (insertErr && insertErr.code !== "23505") { // Ignore unique constraint conflict
      throw new Error(insertErr.message);
    }
  }

  if (currentCount >= limitMax) {
    throw new Error("DAILY_LIMIT_REACHED");
  }

  const { error: updateErr } = await supabase
    .from("daily_limits")
    .update({ [field]: currentCount + 1 })
    .eq("user_id", userId)
    .eq("date", today);

  if (updateErr) throw new Error(updateErr.message);
}
