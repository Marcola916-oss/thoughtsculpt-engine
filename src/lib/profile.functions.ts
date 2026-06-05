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
        .select("plan, status, current_period_end, stripe_customer_id")
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
          sub?.plan === "p30d"
            ? "30d"
            : sub?.plan === "p6m"
              ? "6m"
              : sub?.plan === "p1y"
                ? "1y"
                : null;
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

    let shareToken: string | null = null;
    if (profile?.quiz_lead_id) {
      const { data: lead } = await supabase
        .from("quiz_leads")
        .select("share_token")
        .eq("id", profile.quiz_lead_id)
        .maybeSingle();
      if (lead) {
        shareToken = lead.share_token;
      }
    } else if (profile) {
      const { data: lead } = await supabase
        .from("quiz_leads")
        .select("id, share_token")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lead) {
        shareToken = lead.share_token;
        await supabase.from("profiles").update({ quiz_lead_id: lead.id }).eq("user_id", userId);
        profile.quiz_lead_id = lead.id;
      }
    }

    return {
      profile,
      subscription: sub,
      onboarding,
      shareToken,
    };
  });

const OnboardingInput = z.object({
  wake_time: z.string().max(30),
  sleep_time: z.string().max(30),
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

const UpdateProfileInput = z.object({
  display_name: z.string().min(1).max(50).optional(),
  lang: z.enum(["pl", "ro", "ar", "pt", "en"]).optional(),
  theme: z.enum(["dark", "light"]).optional(),
});

export const updateProfileSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => UpdateProfileInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const ChangePasswordInput = z.object({
  newPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export const changePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => ChangePasswordInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
