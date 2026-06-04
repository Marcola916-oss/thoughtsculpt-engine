-- 1. Add points for diagnosis
CREATE OR REPLACE FUNCTION public.recalculate_user_stats(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  v_tasks_completed INTEGER;
  v_milestones_completed INTEGER;
  v_compass_count INTEGER;
  v_diagnosis_count INTEGER;
  v_calendar_exported BOOLEAN;
  v_points_from_tasks INTEGER;
  v_points_from_milestones INTEGER;
  v_points_from_compass INTEGER;
  v_points_from_diagnosis INTEGER;
  v_points_from_export INTEGER;
  v_points_from_achievements INTEGER;
  v_total_points INTEGER;
  
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

  -- Count diagnoses
  SELECT COUNT(*) INTO v_diagnosis_count
  FROM public.diagnoses
  WHERE user_id = user_uuid;

  -- Check calendar exported
  SELECT calendar_exported INTO v_calendar_exported
  FROM public.user_progress
  WHERE user_id = user_uuid;
  
  IF v_calendar_exported IS NULL THEN
    v_calendar_exported := false;
  END IF;

  -- Points calculation
  v_points_from_tasks := v_tasks_completed * 25;
  v_points_from_milestones := v_milestones_completed * 30;
  v_points_from_compass := v_compass_count * 15;
  v_points_from_diagnosis := v_diagnosis_count * 100; -- High value for diagnosis
  v_points_from_export := CASE WHEN v_calendar_exported THEN 25 ELSE 0 END;
  
  -- Points from achievements
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

  v_total_points := v_points_from_tasks + v_points_from_milestones + v_points_from_compass + v_points_from_diagnosis + v_points_from_export + v_points_from_achievements;

  -- Streak Calculation (Simplified for clarity)
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
    ELSE
      v_temp_streak := 1;
    END IF;
    
    IF v_temp_streak > v_max_streak THEN
      v_max_streak := v_temp_streak;
    END IF;
    v_prev_date := r.comp_date;
  END LOOP;

  -- Update user_progress
  UPDATE public.user_progress
  SET
    total_points = v_total_points,
    longest_streak = v_max_streak,
    tasks_completed = v_tasks_completed,
    compass_used = v_compass_count,
    updated_at = NOW()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Add trigger for diagnoses gamification
CREATE OR REPLACE FUNCTION public.trg_diagnoses_gamify()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recalculate_user_stats(NEW.user_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_diagnosis_created
  AFTER INSERT ON public.diagnoses
  FOR EACH ROW EXECUTE FUNCTION public.trg_diagnoses_gamify();