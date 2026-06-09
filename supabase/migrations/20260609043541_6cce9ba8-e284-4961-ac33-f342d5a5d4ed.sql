
-- 1. Diagnoses: split ALL policy into SELECT-only for clients, deny writes
DROP POLICY IF EXISTS "diagnoses_own" ON public.diagnoses;

CREATE POLICY "diagnoses_select_own" ON public.diagnoses
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "diagnoses_deny_client_insert" ON public.diagnoses
  AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "diagnoses_deny_client_update" ON public.diagnoses
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "diagnoses_deny_client_delete" ON public.diagnoses
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);

-- 2. Profiles: remove conflicting UPDATE policy that bypasses field protection
DROP POLICY IF EXISTS "profiles_update_onboarding" ON public.profiles;

-- 3. Subscriptions: explicit deny INSERT/UPDATE/DELETE for clients
CREATE POLICY "subscriptions_deny_client_insert" ON public.subscriptions
  AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "subscriptions_deny_client_update" ON public.subscriptions
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "subscriptions_deny_client_delete" ON public.subscriptions
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);
