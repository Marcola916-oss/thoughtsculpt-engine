
-- =========================================================
-- achievements
-- =========================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_code text NOT NULL,
  reward_type text CHECK (reward_type IN ('extra_days','extra_compass','extra_report','discount_coupon','temp_premium','extended_limit','points')),
  reward_value text,
  reward_expires_at timestamptz,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  is_claimed boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, achievement_code)
);

GRANT SELECT, INSERT, UPDATE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_own" ON public.achievements
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id, unlocked_at DESC);

-- =========================================================
-- notifications
-- =========================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('achievement','streak','expiry','system','tip')),
  title text NOT NULL,
  body text NOT NULL,
  icon text,
  action_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- =========================================================
-- monthly_reports
-- =========================================================
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_number integer NOT NULL,
  consistency_score integer CHECK (consistency_score BETWEEN 0 AND 100),
  performance_badge text,
  month_headline text,
  month_summary text,
  behavioral_insight text,
  next_month_challenge text,
  motivational_close text,
  raw_data jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_number)
);

GRANT SELECT, INSERT, UPDATE ON public.monthly_reports TO authenticated;
GRANT ALL ON public.monthly_reports TO service_role;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monthly_reports_own" ON public.monthly_reports
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_user ON public.monthly_reports(user_id, month_number DESC);

-- =========================================================
-- Extend user_progress with extra fields
-- =========================================================
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS compass_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS calendar_exported boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS extra_days_earned integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;
