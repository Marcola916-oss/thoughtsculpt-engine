-- 1. Analytics & Tracking Infrastructure
CREATE TABLE public.user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT ON public.user_events TO authenticated;
GRANT ALL ON public.user_events TO service_role;

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events" ON public.user_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events" ON public.user_events
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Performance Optimizations (Indexes)
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON public.quiz_leads (email);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_user_id ON public.quiz_leads (user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON public.diagnoses (user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events (user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_name ON public.user_events (event_name);

-- 3. Schema refinement for value delivery
ALTER TABLE public.quiz_leads ADD COLUMN IF NOT EXISTS insight_preview TEXT;

-- 4. Audit Log for critical changes (optional but professional)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = actor_id);