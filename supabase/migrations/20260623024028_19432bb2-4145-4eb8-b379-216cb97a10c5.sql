
-- ============================================================
-- Fase D1 — Orders + Stripe events
-- ============================================================

-- Enum status
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending','paid','failed','expired','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1) orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.quiz_leads(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  stripe_payment_intent text,
  status public.order_status NOT NULL DEFAULT 'pending',
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL,
  bumps jsonb NOT NULL DEFAULT '[]'::jsonb,
  customer_email text,
  paid_at timestamptz,
  raw_event jsonb,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_lead_id_idx ON public.orders(lead_id);
CREATE INDEX orders_status_idx ON public.orders(status);
CREATE INDEX orders_created_at_idx ON public.orders(created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.orders TO service_role;
GRANT ALL ON public.orders TO postgres;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy para anon/authenticated:
-- leitura é feita via RPC SECURITY DEFINER (get_order_status).

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) stripe_events (idempotência)
CREATE TABLE public.stripe_events (
  event_id text PRIMARY KEY,
  type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.stripe_events TO service_role;
GRANT ALL ON public.stripe_events TO postgres;

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- Sem policies — só service_role escreve, ninguém lê do client.

-- 3) RPC para o /obrigado consultar estado sem expor a linha inteira
CREATE OR REPLACE FUNCTION public.get_order_status(_id uuid)
RETURNS TABLE(status public.order_status, lead_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status, lead_id
  FROM public.orders
  WHERE id = _id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_status(uuid) TO anon, authenticated, service_role;
