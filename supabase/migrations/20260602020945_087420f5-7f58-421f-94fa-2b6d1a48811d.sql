
-- quiz_leads INSERT: tighten to prevent identity spoofing
DROP POLICY IF EXISTS "quiz_leads_insert_anyone" ON public.quiz_leads;
CREATE POLICY "quiz_leads_insert_safe" ON public.quiz_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  );

-- viral_shares INSERT: require at least a lead reference or token
DROP POLICY IF EXISTS "viral_insert_anyone" ON public.viral_shares;
CREATE POLICY "viral_insert_safe" ON public.viral_shares
  FOR INSERT TO anon, authenticated
  WITH CHECK (lead_id IS NOT NULL OR share_token IS NOT NULL);

-- get_shared_quiz: lock down to explicit grants only (no PUBLIC)
REVOKE EXECUTE ON FUNCTION public.get_shared_quiz(TEXT) FROM PUBLIC;
