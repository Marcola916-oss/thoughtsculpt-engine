import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";

export const triggerAchievementNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Check for newly unlocked achievements
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .is("is_claimed", false)
      .order("unlocked_at", { ascending: false });

    if (!achievements || achievements.length === 0) return { triggered: 0 };

    const ACHIEVEMENT_NAMES: Record<string, { title: string; body: string; icon: string }> = {
      ACH_001: { title: "Primeiro Passo!", body: "Completaste a tua primeira tarefa. A jornada começou!", icon: "🎯" },
      ACH_002: { title: "Sequência de 7 Dias!", body: "7 dias seguidos de dedicação. Estás a construir hábitos!", icon: "🔥" },
      ACH_003: { title: "Exportador!", body: "Exportaste o teu calendário pela primeira vez.", icon: "📥" },
      ACH_004: { title: "15 Dias Imparável!", body: "15 dias sem falhar. Disciplina em ação!", icon: "💪" },
      ACH_005: { title: "Explorador Compass!", body: "Usaste o Compass para analisar alguém.", icon: "🧭" },
      ACH_006: { title: "Veterano!", body: "30 dias completos. Transformação visível!", icon: "🏆" },
      ACH_007: { title: "Mestre dos Relatórios!", body: "Geraste o teu primeiro relatório mensal.", icon: "📊" },
      ACH_008: { title: "Maratonista!", body: "90 dias de protocolo. Mudança profunda!", icon: "🏅" },
    };

    let triggered = 0;
    for (const ach of achievements) {
      const info = ACHIEVEMENT_NAMES[ach.achievement_code];
      if (!info) continue;

      // Check if notification already exists
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "achievement")
        .like("title", `%${info.title}%`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      await supabase.from("notifications").insert({
        user_id: userId,
        type: "achievement",
        title: info.title,
        body: info.body,
        icon: info.icon,
        action_url: "/dashboard/progress",
      });
      triggered++;
    }

    return { triggered };
  });

export const triggerStreakNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: progress } = await supabase
      .from("user_progress")
      .select("streak_days, longest_streak")
      .eq("user_id", userId)
      .maybeSingle();

    if (!progress || progress.streak_days < 3) return { triggered: false };

    const milestones = [7, 14, 21, 30, 60, 90];
    if (!milestones.includes(progress.streak_days)) return { triggered: false };

    // Check if already notified for this streak
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "streak")
      .like("body", `%${progress.streak_days} dias%`)
      .limit(1);

    if (existing && existing.length > 0) return { triggered: false };

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "streak",
      title: `🔥 ${progress.streak_days} Dias de Streak!`,
      body: `Levas ${progress.streak_days} dias seguidos de dedicação. Continua assim!`,
      icon: "🔥",
      action_url: "/dashboard/progress",
    });

    return { triggered: true, streak: progress.streak_days };
  });
