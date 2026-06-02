import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: sub }, { data: onboarding }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("onboarding_answers").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    // If profile has no archetype but the user has a quiz_lead linked, hydrate it.
    if (profile && !profile.archetype) {
      const { data: lead } = await supabase
        .from("quiz_leads")
        .select("id, winner, display_name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lead?.winner) {
        const planType =
          sub?.plan === "p30d" ? "30d" : sub?.plan === "p6m" ? "6m" : sub?.plan === "p1y" ? "1y" : null;
        const { data: updated } = await supabase
          .from("profiles")
          .update({
            archetype: lead.winner,
            quiz_lead_id: lead.id,
            display_name: profile.display_name ?? lead.display_name,
            plan_type: planType,
            plan_started_at: profile.plan_started_at ?? new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select("*")
          .maybeSingle();
        if (updated) Object.assign(profile, updated);
      }
    }

    return {
      profile,
      subscription: sub,
      onboarding,
    };
  });

const OnboardingInput = z.object({
  wake_time: z.string().max(8),
  sleep_time: z.string().max(8),
  daily_minutes: z.number().int().min(5).max(120),
  emotional_trigger: z.string().min(1).max(200),
  financial_goal: z.string().min(1).max(200),
  discipline_style: z.string().min(1).max(200),
  mobile_os: z.enum(["ios", "android", "none"]),
});

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => OnboardingInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("onboarding_answers")
      .upsert({ user_id: userId, ...data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);

    const { error: pErr } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", userId);
    if (pErr) throw new Error(pErr.message);

    return { ok: true };
  });