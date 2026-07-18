
CREATE TABLE public.platform_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  target INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_goals TO authenticated;
GRANT ALL ON public.platform_goals TO service_role;

ALTER TABLE public.platform_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage platform_goals"
  ON public.platform_goals
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER platform_goals_updated_at BEFORE UPDATE ON public.platform_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.platform_goals (key, label, target, sort_order) VALUES
  ('associados', 'Associados', 500, 1),
  ('empresas_select', 'Empresas Select', 50, 2),
  ('rcard_ativos', 'Clientes com R-CARD ativo', 300, 3),
  ('produtos_publicados', 'Produtos publicados', 100, 4);
