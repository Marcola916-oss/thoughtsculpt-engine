-- Add access_level and theme to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'active' CHECK (access_level IN ('active','grace','locked','revoked')),
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light'));

-- Create daily_limits table for 1-year plan anti-abuse
CREATE TABLE IF NOT EXISTS public.daily_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  generations_count integer NOT NULL DEFAULT 0,
  calendars_count integer NOT NULL DEFAULT 0,
  pdfs_count integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read/write their own daily limits
CREATE POLICY "limits_own" ON public.daily_limits
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Grant permissions to authenticated and service role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_limits TO authenticated;
GRANT ALL ON public.daily_limits TO service_role;
