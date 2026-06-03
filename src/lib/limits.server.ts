import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_LIMITS = {
  generations: 10,
  calendars: 15,
  pdfs: 15,
} as const;

type LimitType = "generation" | "calendar" | "pdf";

const FIELD_MAP: Record<LimitType, "generations_count" | "calendars_count" | "pdfs_count"> = {
  generation: "generations_count",
  calendar: "calendars_count",
  pdf: "pdfs_count",
};

const MAX_MAP: Record<LimitType, number> = {
  generation: MAX_LIMITS.generations,
  calendar: MAX_LIMITS.calendars,
  pdf: MAX_LIMITS.pdfs,
};

export async function checkAndIncrementLimit(
  supabase: SupabaseClient,
  userId: string,
  limitType: LimitType,
  planType: string,
) {
  if (planType !== "1y") return; // Limit checks only apply to 1-year plan per specifications

  const field = FIELD_MAP[limitType];
  const max = MAX_MAP[limitType];

  // Single atomic RPC. Throws 'DAILY_LIMIT_REACHED' if cap is hit.
  // Race-free: the UPDATE acquires a row lock and the WHERE clause enforces the cap.
  const { error } = await supabase.rpc("check_and_increment_daily_limit", {
    p_user_id: userId,
    p_field: field,
    p_max: max,
  });

  if (error) {
    if (error.message?.includes("DAILY_LIMIT_REACHED")) {
      throw new Error("DAILY_LIMIT_REACHED");
    }
    if (error.message?.includes("FORBIDDEN")) {
      throw new Error("FORBIDDEN");
    }
    throw new Error(error.message);
  }
}
