
-- Explicitly deny client (anon/authenticated) writes on server-only tables.
-- All writes must go through service_role server functions (which bypass RLS).
CREATE POLICY "achievements_deny_client_insert" ON public.achievements
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "achievements_deny_client_update" ON public.achievements
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "achievements_deny_client_delete" ON public.achievements
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "audit_logs_deny_client_insert" ON public.audit_logs
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "audit_logs_deny_client_update" ON public.audit_logs
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "audit_logs_deny_client_delete" ON public.audit_logs
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "user_progress_deny_client_insert" ON public.user_progress
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "user_progress_deny_client_update" ON public.user_progress
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "user_progress_deny_client_delete" ON public.user_progress
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);
