
-- Tabela
CREATE TABLE public.pdf_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.quiz_leads(id) ON DELETE CASCADE,
  archetype public.archetype NOT NULL,
  lang text NOT NULL,
  content_hash text NOT NULL,
  storage_path text,
  signed_url text,
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  attempts jsonb NOT NULL DEFAULT '[]'::jsonb,
  error text,
  cost_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pdf_generations_lookup_idx
  ON public.pdf_generations (lead_id, archetype, lang, content_hash);
CREATE INDEX pdf_generations_hash_idx
  ON public.pdf_generations (content_hash);

GRANT ALL ON public.pdf_generations TO service_role;

ALTER TABLE public.pdf_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role manages pdf_generations"
  ON public.pdf_generations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_pdf_generations_updated_at
  BEFORE UPDATE ON public.pdf_generations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies (bucket 'diagnoses' já criado)
CREATE POLICY "service role reads diagnoses"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'diagnoses');

CREATE POLICY "service role writes diagnoses"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'diagnoses');

CREATE POLICY "service role updates diagnoses"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'diagnoses');

CREATE POLICY "service role deletes diagnoses"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'diagnoses');
