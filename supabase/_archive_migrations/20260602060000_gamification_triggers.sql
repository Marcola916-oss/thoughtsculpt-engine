-- Migration: Gamification Triggers and PL/pgSQL helper functions
-- Created: 2026-06-02

-- 1. Helper function to unlock achievements and notify user
CREATE OR REPLACE FUNCTION public.unlock_achievement(
  user_uuid UUID,
  ach_code TEXT,
  rew_type TEXT,
  rew_value TEXT
)
RETURNS VOID AS $$
DECLARE
  v_already_unlocked BOOLEAN;
  v_ach_name TEXT;
BEGIN
  -- Check if already unlocked
  SELECT EXISTS(
    SELECT 1 FROM public.achievements 
    WHERE user_id = user_uuid AND achievement_code = ach_code
  ) INTO v_already_unlocked;
  
  IF NOT v_already_unlocked THEN
    -- Insert achievement
    INSERT INTO public.achievements (user_id, achievement_code, reward_type, reward_value)
    VALUES (user_uuid, ach_code, rew_type, rew_value);
    
    -- Determine achievement name
    v_ach_name := CASE
      WHEN ach_code = 'ACH_001' THEN 'Primeiro Passo'
      WHEN ach_code = 'ACH_002' THEN '7 Dias de Reset'
      WHEN ach_code = 'ACH_003' THEN 'Exportador'
      WHEN ach_code = 'ACH_004' THEN '15 Dias Imparável'
      WHEN ach_code = 'ACH_005' THEN 'Meio Caminho'
      WHEN ach_code = 'ACH_006' THEN '30 Days Complete'
      WHEN ach_code = 'ACH_007' THEN 'Explorador'
      WHEN ach_code = 'ACH_008' THEN '100 Dias (6m)'
      ELSE 'Nova Conquista'
    END;
    
    -- Insert notification
    INSERT INTO public.notifications (user_id, type, title, body, icon)
    VALUES (
      user_uuid,
      'achievement',
      '🏆 Conquista Desbloqueada!',
      'Você desbloqueou: ' || v_ach_name || '. Acesse o menu de evolução para conferir.',
      '🏆'
    );
    
    -- Update points directly to avoid full trigger loop recursion
    UPDATE public.user_progress
    SET total_points = total_points + CASE
      WHEN ach_code = 'ACH_001' THEN 50
      WHEN ach_code = 'ACH_002' THEN 50
      WHEN ach_code = 'ACH_003' THEN 25
      WHEN ach_code = 'ACH_004' THEN 100
      WHEN ach_code = 'ACH_005' THEN 80
      WHEN ach_code = 'ACH_006' THEN 200
      WHEN ach_code = 'ACH_007' THEN 60
      WHEN ach_code = 'ACH_008' THEN 300
      ELSE 0
    END
    WHERE user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Helper function to check and unlock achievements based on progress stats
CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(
  user_uuid UUID,
  v_tasks_completed INTEGER,
  v_max_streak INTEGER,
  v_compass_count INTEGER,
  v_calendar_exported BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  -- ACH_001: Primeiro Passo (Dia 1 completo)
  IF v_tasks_completed >= 1 THEN
    PERFORM public.unlock_achievement(user_uuid, 'ACH_001', 'points', '50');
  END IF;

  -- ACH_002: 7 Dias de Reset (7 consecutive days)
  IF v_max_streak >= 7 THEN
    PERFORM public.unlock_achievement(user_uuid, 'ACH_002', 'extra_compass', '1');
  END IF;

  -- ACH_003: Exportador (Export calendar)
  IF v_calendar_exported = true THEN
    PERFORM public.unlock_achievement(user_uuid, 'ACH_003', 'extra_report', '1');
  END IF;

  -- ACH_004: 15 Dias Imparável (15 consecutive days)
  IF v_max_streak >= 15 THEN
    PERFORM public.unlock_achievement(user_uuid, 'ACH_004', 'extended_limit', '1');
  END IF;

  -- ACH_005: Meio Caminho (Completar Dia 15)
  IF EXISTS (SELECT 1 FROM public.calendar_tasks WHERE user_id = user_uuid AND day_number = 15 AND is_completed = true) THEN
    PERFORM public.unlock_achievement(user_uuid, 'ACH_005', 'extra_days', '2');
  END IF;

  -- ACH_006: 30 Days Complete (Completar Dia 30)
  IF EXISTS (SELECT 1 FROM public.calendar_tasks WHERE user_id = user_uuid AND day_number = 30 AND is_completed = true) THEN
    PERFORM public.unlock_achievement(user_uuid, 'ACH_006', 'extra_days', '5');
  END IF;

  -- ACH_007: Explorador (Usar Compass 3x)
  IF v_compass_count >= 3 THEN
    PERFORM public.unlock_achievement(user_uuid, 'ACH_007', 'extra_compass', '2');
  END IF;

  -- ACH_008: 100 Dias (6m) (100 days complete)
  IF v_tasks_completed >= 100 THEN
    PERFORM public.unlock_achievement(user_uuid, 'ACH_008', 'extra_days', '10');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Main recalculate stats function (Self-healing & transactional)
CREATE OR REPLACE FUNCTION public.recalculate_user_stats(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  v_tasks_completed INTEGER;
  v_milestones_completed INTEGER;
  v_compass_count INTEGER;
  v_calendar_exported BOOLEAN;
  v_points_from_tasks INTEGER;
  v_points_from_milestones INTEGER;
  v_points_from_compass INTEGER;
  v_points_from_export INTEGER;
  v_points_from_achievements INTEGER;
  v_total_points INTEGER;
  
  -- Streak variables
  v_current_date DATE := CURRENT_DATE;
  v_prev_date DATE := NULL;
  v_curr_streak INTEGER := 0;
  v_temp_streak INTEGER := 0;
  v_max_streak INTEGER := 0;
  r RECORD;
  v_last_checkin DATE := NULL;
BEGIN
  -- Count completed tasks
  SELECT COUNT(*) INTO v_tasks_completed
  FROM public.calendar_tasks
  WHERE user_id = user_uuid AND is_completed = true;

  -- Count completed milestones
  SELECT COUNT(*) INTO v_milestones_completed
  FROM public.calendar_tasks
  WHERE user_id = user_uuid AND is_completed = true AND is_milestone = true;

  -- Count compass analyses
  SELECT COUNT(*) INTO v_compass_count
  FROM public.compass_analyses
  WHERE user_id = user_uuid;

  -- Check calendar exported
  SELECT calendar_exported INTO v_calendar_exported
  FROM public.user_progress
  WHERE user_id = user_uuid;
  
  IF v_calendar_exported IS NULL THEN
    v_calendar_exported := false;
  END IF;

  -- Points calculation
  v_points_from_tasks := v_tasks_completed * 25; -- +10 ref, +10 act, +5 bonus
  v_points_from_milestones := v_milestones_completed * 30;
  v_points_from_compass := v_compass_count * 15;
  v_points_from_export := CASE WHEN v_calendar_exported THEN 25 ELSE 0 END;
  
  -- Points from achievements (exclude reward type check, just sum them up based on standard values)
  SELECT COALESCE(SUM(
    CASE 
      WHEN achievement_code = 'ACH_001' THEN 50
      WHEN achievement_code = 'ACH_002' THEN 50
      WHEN achievement_code = 'ACH_003' THEN 25
      WHEN achievement_code = 'ACH_004' THEN 100
      WHEN achievement_code = 'ACH_005' THEN 80
      WHEN achievement_code = 'ACH_006' THEN 200
      WHEN achievement_code = 'ACH_007' THEN 60
      WHEN achievement_code = 'ACH_008' THEN 300
      ELSE 0
    END
  ), 0) INTO v_points_from_achievements
  FROM public.achievements
  WHERE user_id = user_uuid;

  v_total_points := v_points_from_tasks + v_points_from_milestones + v_points_from_compass + v_points_from_export + v_points_from_achievements;

  -- Streak Calculation
  FOR r IN (
    SELECT DISTINCT (completed_at AT TIME ZONE 'UTC')::date AS comp_date
    FROM public.calendar_tasks
    WHERE user_id = user_uuid AND is_completed = true AND completed_at IS NOT NULL
    ORDER BY comp_date ASC
  ) LOOP
    IF v_prev_date IS NULL THEN
      v_temp_streak := 1;
    ELSIF r.comp_date = v_prev_date + 1 THEN
      v_temp_streak := v_temp_streak + 1;
    ELSIF r.comp_date = v_prev_date THEN
      -- same date, ignore
    ELSE
      v_temp_streak := 1;
    END IF;
    
    IF v_temp_streak > v_max_streak THEN
      v_max_streak := v_temp_streak;
    END IF;
    
    v_prev_date := r.comp_date;
  END LOOP;

  -- Current streak: consecutive days ending today or yesterday
  SELECT MAX((completed_at AT TIME ZONE 'UTC')::date) INTO v_last_checkin
  FROM public.calendar_tasks
  WHERE user_id = user_uuid AND is_completed = true AND completed_at IS NOT NULL;

  IF v_last_checkin IS NOT NULL AND (v_last_checkin = v_current_date OR v_last_checkin = v_current_date - 1) THEN
    v_curr_streak := 0;
    v_prev_date := v_last_checkin;
    LOOP
      IF EXISTS (
        SELECT 1 FROM public.calendar_tasks 
        WHERE user_id = user_uuid AND is_completed = true AND completed_at IS NOT NULL
        AND (completed_at AT TIME ZONE 'UTC')::date = v_prev_date
      ) THEN
        v_curr_streak := v_curr_streak + 1;
        v_prev_date := v_prev_date - 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;
  ELSE
    v_curr_streak := 0;
  END IF;

  -- Update user_progress
  UPDATE public.user_progress
  SET
    total_points = v_total_points,
    streak_days = v_curr_streak,
    longest_streak = v_max_streak,
    last_checkin_date = v_last_checkin,
    tasks_completed = v_tasks_completed,
    compass_used = v_compass_count,
    last_activity_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Perform achievements check (does not cause infinite loop because achievements checks skip if already unlocked)
  PERFORM public.check_and_unlock_achievements(user_uuid, v_tasks_completed, v_max_streak, v_compass_count, v_calendar_exported);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Trigger function to initialize user_progress for new profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_profile_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_progress();

-- 5. Trigger function on calendar_tasks complete / incomplete
CREATE OR REPLACE FUNCTION public.trg_calendar_tasks_gamify()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.is_completed IS DISTINCT FROM NEW.is_completed THEN
    PERFORM public.recalculate_user_stats(NEW.user_id);
  ELSIF TG_OP = 'INSERT' AND NEW.is_completed = true THEN
    PERFORM public.recalculate_user_stats(NEW.user_id);
  ELSIF TG_OP = 'DELETE' AND OLD.is_completed = true THEN
    PERFORM public.recalculate_user_stats(OLD.user_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_calendar_task_completed
  AFTER INSERT OR UPDATE OR DELETE ON public.calendar_tasks
  FOR EACH ROW EXECUTE FUNCTION public.trg_calendar_tasks_gamify();

-- 6. Trigger function on compass_analyses insert/delete
CREATE OR REPLACE FUNCTION public.trg_compass_analyses_gamify()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recalculate_user_stats(NEW.user_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_user_stats(OLD.user_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_compass_analysis_created
  AFTER INSERT OR DELETE ON public.compass_analyses
  FOR EACH ROW EXECUTE FUNCTION public.trg_compass_analyses_gamify();

-- 7. RPC to mark calendar exported and award points/achievements
CREATE OR REPLACE FUNCTION public.mark_calendar_exported(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_progress
  SET calendar_exported = true
  WHERE user_id = user_uuid;
  
  PERFORM public.recalculate_user_stats(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Backfill existing user_progress and run stats recalculation
INSERT INTO public.user_progress (user_id)
SELECT user_id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM public.profiles LOOP
    PERFORM public.recalculate_user_stats(r.user_id);
  END LOOP;
END;
$$;
