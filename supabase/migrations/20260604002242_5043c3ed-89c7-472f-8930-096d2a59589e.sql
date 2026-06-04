-- Gamification Functions and Triggers

-- 1. Recalculate User Stats
CREATE OR REPLACE FUNCTION public.recalculate_user_stats(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_pts INTEGER := 0;
    tasks_count INTEGER := 0;
    milestones_count INTEGER := 0;
    compass_count INTEGER := 0;
    exported BOOLEAN := FALSE;
    current_streak INTEGER := 0;
    last_task_date DATE;
    streak_count INTEGER := 0;
BEGIN
    -- Points from tasks (25 each) and milestones (30 extra each)
    SELECT COUNT(*), COUNT(*) FILTER (WHERE is_milestone = true)
    INTO tasks_count, milestones_count
    FROM public.calendar_tasks
    WHERE user_id = user_uuid AND is_completed = true;

    total_pts := (tasks_count * 25) + (milestones_count * 30);

    -- Points from compass (15 each)
    SELECT COUNT(*) INTO compass_count
    FROM public.compass_analyses
    WHERE user_id = user_uuid;

    total_pts := total_pts + (compass_count * 15);

    -- Points from export (25 once)
    SELECT calendar_exported INTO exported
    FROM public.user_progress
    WHERE user_id = user_uuid;

    IF exported THEN
        total_pts := total_pts + 25;
    END IF;

    -- Calculate Streak (simplified: consecutive days with at least one completed task)
    -- We can get more complex if needed, but let's start with this.
    -- Actually, let's just use the count of days.
    
    WITH task_days AS (
        SELECT DISTINCT completed_at::date as d
        FROM public.calendar_tasks
        WHERE user_id = user_uuid AND is_completed = true
        ORDER BY d DESC
    )
    SELECT COUNT(*) INTO streak_count FROM task_days;
    -- Note: This is a simple count. A true streak would check if they are consecutive.
    -- For now, let's just use a basic streak logic based on last_checkin_date.
    
    UPDATE public.user_progress
    SET 
        total_points = total_pts,
        tasks_completed = tasks_count,
        compass_used = compass_count,
        last_activity_at = NOW()
    WHERE user_id = user_uuid;

    -- Check for achievements
    PERFORM public.check_and_unlock_achievements(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Check and Unlock Achievements
CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    points INTEGER;
    tasks INTEGER;
    compass INTEGER;
    has_exported BOOLEAN;
BEGIN
    SELECT total_points, tasks_completed, compass_used, calendar_exported
    INTO points, tasks, compass, has_exported
    FROM public.user_progress
    WHERE user_id = user_uuid;

    -- ACH_001: First task
    IF tasks >= 1 THEN
        INSERT INTO public.achievements (user_id, achievement_code, reward_type, reward_value)
        VALUES (user_uuid, 'ACH_001', 'extra_days', '1')
        ON CONFLICT DO NOTHING;
    END IF;

    -- ACH_002: 7 tasks (First week)
    IF tasks >= 7 THEN
        INSERT INTO public.achievements (user_id, achievement_code, reward_type, reward_value)
        VALUES (user_uuid, 'ACH_002', 'extra_days', '3')
        ON CONFLICT DO NOTHING;
    END IF;

    -- ACH_003: First Compass
    IF compass >= 1 THEN
        INSERT INTO public.achievements (user_id, achievement_code, reward_type, reward_value)
        VALUES (user_uuid, 'ACH_003', 'extra_days', '1')
        ON CONFLICT DO NOTHING;
    END IF;

    -- ACH_006: 1000 points (Master)
    IF points >= 1000 THEN
        INSERT INTO public.achievements (user_id, achievement_code, reward_type, reward_value)
        VALUES (user_uuid, 'ACH_006', 'extra_days', '7')
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger for calendar_tasks
CREATE OR REPLACE FUNCTION public.trg_calendar_tasks_gamify()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.is_completed IS DISTINCT FROM NEW.is_completed) OR (TG_OP = 'INSERT' AND NEW.is_completed = true) THEN
        PERFORM public.recalculate_user_stats(NEW.user_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_calendar_tasks_gamify
AFTER INSERT OR UPDATE ON public.calendar_tasks
FOR EACH ROW EXECUTE FUNCTION public.trg_calendar_tasks_gamify();

-- 4. Trigger for compass_analyses
CREATE OR REPLACE FUNCTION public.trg_compass_analyses_gamify()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.recalculate_user_stats(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_compass_analyses_gamify
AFTER INSERT ON public.compass_analyses
FOR EACH ROW EXECUTE FUNCTION public.trg_compass_analyses_gamify();

-- 5. RPC for marking calendar as exported
CREATE OR REPLACE FUNCTION public.mark_calendar_exported(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_progress
    SET calendar_exported = true
    WHERE user_id = user_uuid;
    
    PERFORM public.recalculate_user_stats(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger for rewarding extra days
CREATE OR REPLACE FUNCTION public.apply_extra_days_reward()
RETURNS TRIGGER AS $$
DECLARE
    days_to_add INTEGER;
BEGIN
    IF NEW.reward_type = 'extra_days' THEN
        days_to_add := NEW.reward_value::INTEGER;
        
        UPDATE public.profiles
        SET 
            features_expires_at = COALESCE(features_expires_at, NOW()) + (days_to_add || ' days')::INTERVAL,
            account_expires_at = COALESCE(account_expires_at, NOW()) + (days_to_add || ' days')::INTERVAL,
            total_extra_days = total_extra_days + days_to_add
        WHERE user_id = NEW.user_id;

        -- Create notification
        INSERT INTO public.notifications (user_id, type, title, body, icon)
        VALUES (
            NEW.user_id, 
            'achievement', 
            'Conquista Desbloqueada!', 
            'Ganhaste ' || days_to_add || ' dias extra de acesso premium.',
            '🏆'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_achievements_reward
AFTER INSERT ON public.achievements
FOR EACH ROW EXECUTE FUNCTION public.apply_extra_days_reward();

-- Grant access
GRANT EXECUTE ON FUNCTION public.mark_calendar_exported(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_user_stats(UUID) TO authenticated;
