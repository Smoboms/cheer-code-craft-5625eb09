
CREATE TABLE public.agro_quotes (
  id uuid primary key default gen_random_uuid(),
  boi_gordo_avista numeric,
  boi_gordo_aprazo numeric,
  vaca_gorda_avista numeric,
  boi_source text,
  boi_updated_at date,
  soja_min numeric,
  soja_max numeric,
  soja_source text,
  soja_updated_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT ON public.agro_quotes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.agro_quotes TO authenticated;
GRANT ALL ON public.agro_quotes TO service_role;

ALTER TABLE public.agro_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read agro quotes"
  ON public.agro_quotes FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert agro quotes"
  ON public.agro_quotes FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update agro quotes"
  ON public.agro_quotes FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete agro quotes"
  ON public.agro_quotes FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_agro_quotes_updated_at
  BEFORE UPDATE ON public.agro_quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.agro_quotes (id) VALUES (gen_random_uuid());
