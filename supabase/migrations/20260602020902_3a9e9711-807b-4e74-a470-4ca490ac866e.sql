
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.archetype AS ENUM ('AO', 'SS', 'EA', 'HI');
CREATE TYPE public.plan_kind AS ENUM ('p30d', 'p6m', 'p1y');
CREATE TYPE public.sub_status AS ENUM ('incomplete', 'active', 'past_due', 'canceled', 'expired');
CREATE TYPE public.share_channel AS ENUM ('whatsapp', 'x', 'facebook', 'copy', 'other');

-- =========================================================
-- updated_at trigger fn
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =========================================================
-- profiles
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  lang TEXT NOT NULL DEFAULT 'en',
  country TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, lang)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'lang', 'en')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- quiz_leads
-- =========================================================
CREATE TABLE public.quiz_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  display_name TEXT,
  email TEXT,
  lang TEXT NOT NULL DEFAULT 'en',
  country TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  winner public.archetype,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_leads_user ON public.quiz_leads(user_id);
CREATE INDEX idx_quiz_leads_token ON public.quiz_leads(share_token);
CREATE INDEX idx_quiz_leads_email ON public.quiz_leads(lower(email));

GRANT SELECT, INSERT, UPDATE ON public.quiz_leads TO authenticated;
GRANT INSERT ON public.quiz_leads TO anon;
GRANT ALL ON public.quiz_leads TO service_role;

ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can create a lead (public quiz)
CREATE POLICY "quiz_leads_insert_anyone" ON public.quiz_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Owners can view their own
CREATE POLICY "quiz_leads_select_own" ON public.quiz_leads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Owners can update their own (e.g. when claiming a lead after signup)
CREATE POLICY "quiz_leads_update_own" ON public.quiz_leads
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_quiz_leads_updated_at
  BEFORE UPDATE ON public.quiz_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public share function (no email leak)
CREATE OR REPLACE FUNCTION public.get_shared_quiz(_token TEXT)
RETURNS TABLE (
  display_name TEXT,
  lang TEXT,
  winner public.archetype,
  scores JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT display_name, lang, winner, scores, created_at
  FROM public.quiz_leads
  WHERE share_token = _token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_quiz(TEXT) TO anon, authenticated;

-- =========================================================
-- subscriptions
-- =========================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.plan_kind NOT NULL,
  currency TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status public.sub_status NOT NULL DEFAULT 'incomplete',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subs_user ON public.subscriptions(user_id);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subs_select_own" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_subs_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- viral_shares
-- =========================================================
CREATE TABLE public.viral_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.quiz_leads(id) ON DELETE CASCADE,
  share_token TEXT,
  channel public.share_channel NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_viral_lead ON public.viral_shares(lead_id);
CREATE INDEX idx_viral_token ON public.viral_shares(share_token);

GRANT INSERT ON public.viral_shares TO anon, authenticated;
GRANT SELECT ON public.viral_shares TO authenticated;
GRANT ALL ON public.viral_shares TO service_role;

ALTER TABLE public.viral_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "viral_insert_anyone" ON public.viral_shares
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "viral_select_owner" ON public.viral_shares
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.quiz_leads l
      WHERE l.id = viral_shares.lead_id AND l.user_id = auth.uid()
    )
  );
