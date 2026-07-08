
-- 1. Extend profiles with archetype + plan info from quiz/subscription
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS archetype text,
  ADD COLUMN IF NOT EXISTS quiz_lead_id uuid REFERENCES public.quiz_leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan_type text,
  ADD COLUMN IF NOT EXISTS plan_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS features_expires_at timestamptz;

-- 2. Onboarding answers (7 calibration questions)
CREATE TABLE IF NOT EXISTS public.onboarding_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  wake_time text,
  sleep_time text,
  daily_minutes integer,
  emotional_trigger text,
  financial_goal text,
  discipline_style text,
  mobile_os text CHECK (mobile_os IN ('ios','android','none')),
  completed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_answers TO authenticated;
GRANT ALL ON public.onboarding_answers TO service_role;
ALTER TABLE public.onboarding_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onboarding_own" ON public.onboarding_answers
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Diagnoses (AI-generated 4-dimension analysis, cached)
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archetype text NOT NULL,
  financial_analysis text,
  professional_analysis text,
  romantic_analysis text,
  personal_analysis text,
  model_used text NOT NULL DEFAULT 'google/gemini-2.5-pro',
  version integer NOT NULL DEFAULT 1,
  generated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnoses TO authenticated;
GRANT ALL ON public.diagnoses TO service_role;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diagnoses_own" ON public.diagnoses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user ON public.diagnoses(user_id, generated_at DESC);

-- 4. Calendar tasks (drip-unlocked daily action plan)
CREATE TABLE IF NOT EXISTS public.calendar_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  phase text,
  reflective_task text,
  action_task text,
  is_milestone boolean NOT NULL DEFAULT false,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_tasks TO authenticated;
GRANT ALL ON public.calendar_tasks TO service_role;
ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_own" ON public.calendar_tasks
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user_day ON public.calendar_tasks(user_id, day_number);

-- 5. Compass analyses (relationship archetype analyses)
CREATE TABLE IF NOT EXISTS public.compass_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_name text NOT NULL,
  relationship_type text CHECK (relationship_type IN ('professional','romantic','family','general')),
  context text,
  observations text,
  probable_archetype text,
  analysis_content jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compass_analyses TO authenticated;
GRANT ALL ON public.compass_analyses TO service_role;
ALTER TABLE public.compass_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compass_own" ON public.compass_analyses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_compass_user ON public.compass_analyses(user_id, created_at DESC);

-- 6. User progress (gamification)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_checkin_date date,
  tasks_completed integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_own" ON public.user_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
