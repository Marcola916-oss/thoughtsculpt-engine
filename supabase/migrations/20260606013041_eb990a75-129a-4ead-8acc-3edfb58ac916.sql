-- Drop the incorrect update policy
DROP POLICY IF EXISTS "profiles_update_safe_fields" ON public.profiles;

-- Create a corrected update policy that uses user_id to match auth.uid()
CREATE POLICY "profiles_update_safe_fields" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND (
            -- Ensure restricted fields are not changed by comparing with current values
            (plan_type IS NOT DISTINCT FROM (SELECT p.plan_type FROM public.profiles p WHERE p.user_id = auth.uid())) AND
            (access_level IS NOT DISTINCT FROM (SELECT p.access_level FROM public.profiles p WHERE p.user_id = auth.uid())) AND
            (features_expires_at IS NOT DISTINCT FROM (SELECT p.features_expires_at FROM public.profiles p WHERE p.user_id = auth.uid())) AND
            (plan_started_at IS NOT DISTINCT FROM (SELECT p.plan_started_at FROM public.profiles p WHERE p.user_id = auth.uid()))
        )
    );

-- Add a specific policy for onboarding completion to avoid any ambiguity
CREATE POLICY "profiles_update_onboarding" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Ensure the service_role has full access (standard practice)
GRANT ALL ON public.profiles TO service_role;
