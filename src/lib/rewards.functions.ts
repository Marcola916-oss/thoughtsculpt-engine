import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";
import { z } from "zod";

export const getPointsBalance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_progress")
      .select("total_points")
      .eq("user_id", userId)
      .maybeSingle();
    return { points: data?.total_points ?? 0 };
  });

export const claimAchievementReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ achievement_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: achievement, error: fetchErr } = await supabase
      .from("achievements")
      .select("*")
      .eq("id", data.achievement_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr || !achievement) throw new Error("Achievement not found.");
    if (achievement.is_claimed) return { claimed: false, reason: "already_claimed" };
    if (achievement.reward_expires_at && new Date(achievement.reward_expires_at) < new Date()) {
      return { claimed: false, reason: "expired" };
    }

    // Mark as claimed
    const { error: claimErr } = await supabase
      .from("achievements")
      .update({ is_claimed: true })
      .eq("id", data.achievement_id);

    if (claimErr) throw new Error(claimErr.message);

    // Apply reward based on type
    const rewardType = achievement.reward_type;
    const rewardValue = achievement.reward_value;

    if (rewardType === "extra_days" && rewardValue) {
      const days = parseInt(rewardValue, 10);
      if (!isNaN(days)) {
        const { data: cur } = await supabase
          .from("user_progress")
          .select("extra_days_earned")
          .eq("user_id", userId)
          .maybeSingle();
        if (cur) {
          await supabase
            .from("user_progress")
            .update({ extra_days_earned: (cur.extra_days_earned ?? 0) + days })
            .eq("user_id", userId);
        }
      }
    } else if (rewardType === "points" && rewardValue) {
      const pts = parseInt(rewardValue, 10);
      if (!isNaN(pts)) {
        const { data: cur } = await supabase
          .from("user_progress")
          .select("total_points")
          .eq("user_id", userId)
          .maybeSingle();
        if (cur) {
          await supabase
            .from("user_progress")
            .update({ total_points: (cur.total_points ?? 0) + pts })
            .eq("user_id", userId);
        }
      }
    } else if (rewardType === "discount_coupon") {
      // Generate a unique coupon code
      const code = `MIND${achievement.achievement_code.slice(-4)}${Date.now().toString(36).toUpperCase()}`;
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "system",
        title: "Cupão de Desconto",
        body: `Usa o código ${code} para obter desconto na tua próxima compra.`,
        icon: "🎟️",
      });
    }

    return { claimed: true, rewardType, rewardValue };
  });

export const redeemPoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        points_cost: z.number().int().min(100),
        reward_type: z.enum(["extra_days", "extra_compass", "discount_coupon"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: progress } = await supabase
      .from("user_progress")
      .select("total_points")
      .eq("user_id", userId)
      .maybeSingle();

    const currentPoints = progress?.total_points ?? 0;
    if (currentPoints < data.points_cost) {
      return { redeemed: false, reason: "insufficient_points" };
    }

    // Deduct points
    const { error: deductErr } = await supabase
      .from("user_progress")
      .update({ total_points: currentPoints - data.points_cost })
      .eq("user_id", userId);
    if (deductErr) throw new Error(deductErr.message);

    // Create an achievement record for the redemption
    const { error: insertErr } = await supabase.from("achievements").insert({
      user_id: userId,
      achievement_code: `REDEEM_${data.reward_type.toUpperCase()}`,
      reward_type: data.reward_type,
      reward_value: data.reward_type === "extra_days" ? "7" : data.reward_type === "extra_compass" ? "3" : "15",
      is_claimed: true,
    });
    if (insertErr) throw new Error(insertErr.message);

    // Notify user
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "system",
      title: "Recompensa Desbloqueada!",
      body:
        data.reward_type === "extra_days"
          ? "Ganhou 7 dias extras de acesso ao teu protocolo!"
          : data.reward_type === "extra_compass"
            ? "Ganhou 3 análises extras do Compass!"
            : "Ganhou 15% de desconto na tua próxima compra!",
      icon: "🎁",
    });

    return { redeemed: true, rewardType: data.reward_type };
  });
