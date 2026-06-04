-- 1. GRANTs Explícitos (PostgREST necessita disso)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_leads TO authenticated;
GRANT SELECT, INSERT ON public.quiz_leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.viral_shares TO authenticated;
GRANT SELECT, INSERT ON public.viral_shares TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_limits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_events TO authenticated;
GRANT SELECT, INSERT ON public.user_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_answers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnoses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compass_analyses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.quiz_leads TO service_role;
GRANT ALL ON public.subscriptions TO service_role;
GRANT ALL ON public.viral_shares TO service_role;
GRANT ALL ON public.daily_limits TO service_role;
GRANT ALL ON public.user_events TO service_role;
GRANT ALL ON public.onboarding_answers TO service_role;
GRANT ALL ON public.diagnoses TO service_role;
GRANT ALL ON public.calendar_tasks TO service_role;
GRANT ALL ON public.compass_analyses TO service_role;
GRANT ALL ON public.achievements TO service_role;
GRANT ALL ON public.audit_logs TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.monthly_reports TO service_role;
GRANT ALL ON public.user_progress TO service_role;

-- 2. Correção de Funções SECURITY DEFINER e search_path
-- Revogar execução pública de funções críticas
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM public;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, service_role;

-- Ajustar funções identificadas pelo linter
ALTER FUNCTION public.trg_calendar_tasks_gamify() SET search_path = public;
ALTER FUNCTION public.trg_compass_analyses_gamify() SET search_path = public;
ALTER FUNCTION public.check_and_unlock_achievements(uuid) SET search_path = public;
ALTER FUNCTION public.mark_calendar_exported(uuid) SET search_path = public;
ALTER FUNCTION public.apply_extra_days_reward() SET search_path = public;

-- Garantir privilégios mínimos para funções específicas
GRANT EXECUTE ON FUNCTION public.get_shared_quiz(text) TO anon, authenticated, service_role;

-- 3. Refinamento de RLS Policies (Evitar vazamentos)
DROP POLICY IF EXISTS "Users can insert their own events" ON public.user_events;
CREATE POLICY "Users can insert their own events" ON public.user_events 
FOR INSERT TO authenticated, anon 
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);

DROP POLICY IF EXISTS "Users can view their own events" ON public.user_events;
CREATE POLICY "Users can view their own events" ON public.user_events 
FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs 
FOR SELECT TO authenticated 
USING (auth.uid() = actor_id);