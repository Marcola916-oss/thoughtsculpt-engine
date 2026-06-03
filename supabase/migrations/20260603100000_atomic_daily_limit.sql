-- Atomic check-and-increment for daily_limits.
-- Replaces the previous 3-statement SELECT/INSERT/UPDATE sequence in
-- src/lib/limits.server.ts which had a race condition: two concurrent
-- requests could both pass the limit check and both increment.

CREATE OR REPLACE FUNCTION public.check_and_increment_daily_limit(
  p_user_id    uuid,
  p_field      text,   -- 'generations_count' | 'calendars_count' | 'pdfs_count'
  p_max        integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today     date := current_date;
  v_new_value integer;
BEGIN
  -- Enforce that the caller can only act on their own counter.
  -- This keeps the SECURITY DEFINER function safe to grant to authenticated
  -- without giving any user the ability to bump another user's counter.
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_field NOT IN ('generations_count', 'calendars_count', 'pdfs_count') THEN
    RAISE EXCEPTION 'INVALID_FIELD' USING ERRCODE = '22023';
  END IF;

  -- Ensure the row exists for today (no-op if it already does).
  INSERT INTO public.daily_limits (user_id, date)
  VALUES (p_user_id, v_today)
  ON CONFLICT (user_id, date) DO NOTHING;

  -- Atomically increment the requested counter if it is still under the cap.
  -- The WHERE clause is evaluated under the row lock acquired by UPDATE,
  -- so concurrent callers are serialized and the cap is never exceeded.
  UPDATE public.daily_limits
  SET
    generations_count = CASE WHEN p_field = 'generations_count' THEN generations_count + 1 ELSE generations_count END,
    calendars_count   = CASE WHEN p_field = 'calendars_count'   THEN calendars_count   + 1 ELSE calendars_count   END,
    pdfs_count        = CASE WHEN p_field = 'pdfs_count'        THEN pdfs_count        + 1 ELSE pdfs_count        END
  WHERE user_id = p_user_id
    AND date    = v_today
    AND (
      (p_field = 'generations_count' AND generations_count < p_max) OR
      (p_field = 'calendars_count'   AND calendars_count   < p_max) OR
      (p_field = 'pdfs_count'        AND pdfs_count        < p_max)
    )
  RETURNING
    CASE p_field
      WHEN 'generations_count' THEN generations_count
      WHEN 'calendars_count'   THEN calendars_count
      WHEN 'pdfs_count'        THEN pdfs_count
    END
  INTO v_new_value;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DAILY_LIMIT_REACHED' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_new_value;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_increment_daily_limit(uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_increment_daily_limit(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_daily_limit(uuid, text, integer) TO service_role;

