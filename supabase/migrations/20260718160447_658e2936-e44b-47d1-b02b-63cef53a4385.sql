
ALTER TABLE public.pilar_conteudos
  ADD COLUMN IF NOT EXISTS publicado boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS banner_url text;

-- Palestrantes
CREATE TABLE IF NOT EXISTS public.pilar_palestrantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilar_conteudo_id uuid NOT NULL REFERENCES public.pilar_conteudos(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cargo text,
  bio text,
  foto_url text,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pilar_palestrantes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pilar_palestrantes TO authenticated;
GRANT ALL ON public.pilar_palestrantes TO service_role;
ALTER TABLE public.pilar_palestrantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view palestrantes of active" ON public.pilar_palestrantes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pilar_conteudos c WHERE c.id = pilar_conteudo_id AND c.ativo));
CREATE POLICY "Admins manage palestrantes" ON public.pilar_palestrantes FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_pilar_palestrantes_conteudo ON public.pilar_palestrantes(pilar_conteudo_id);
CREATE TRIGGER update_pilar_palestrantes_updated_at BEFORE UPDATE ON public.pilar_palestrantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Empresas participantes
CREATE TABLE IF NOT EXISTS public.pilar_empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilar_conteudo_id uuid NOT NULL REFERENCES public.pilar_conteudos(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  nome text NOT NULL,
  logo_url text,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pilar_empresas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pilar_empresas TO authenticated;
GRANT ALL ON public.pilar_empresas TO service_role;
ALTER TABLE public.pilar_empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view empresas of active" ON public.pilar_empresas FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pilar_conteudos c WHERE c.id = pilar_conteudo_id AND c.ativo));
CREATE POLICY "Admins manage pilar_empresas" ON public.pilar_empresas FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_pilar_empresas_conteudo ON public.pilar_empresas(pilar_conteudo_id);

-- Galeria
CREATE TABLE IF NOT EXISTS public.pilar_galeria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilar_conteudo_id uuid NOT NULL REFERENCES public.pilar_conteudos(id) ON DELETE CASCADE,
  imagem_url text NOT NULL,
  legenda text,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pilar_galeria TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pilar_galeria TO authenticated;
GRANT ALL ON public.pilar_galeria TO service_role;
ALTER TABLE public.pilar_galeria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view galeria of active" ON public.pilar_galeria FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pilar_conteudos c WHERE c.id = pilar_conteudo_id AND c.ativo));
CREATE POLICY "Admins manage galeria" ON public.pilar_galeria FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_pilar_galeria_conteudo ON public.pilar_galeria(pilar_conteudo_id);

-- Cronograma
CREATE TABLE IF NOT EXISTS public.pilar_cronograma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilar_conteudo_id uuid NOT NULL REFERENCES public.pilar_conteudos(id) ON DELETE CASCADE,
  horario text NOT NULL,
  titulo text NOT NULL,
  descricao text,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pilar_cronograma TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pilar_cronograma TO authenticated;
GRANT ALL ON public.pilar_cronograma TO service_role;
ALTER TABLE public.pilar_cronograma ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view cronograma of active" ON public.pilar_cronograma FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pilar_conteudos c WHERE c.id = pilar_conteudo_id AND c.ativo));
CREATE POLICY "Admins manage cronograma" ON public.pilar_cronograma FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_pilar_cronograma_conteudo ON public.pilar_cronograma(pilar_conteudo_id);

CREATE INDEX IF NOT EXISTS idx_pilar_conteudos_pilar_tipo ON public.pilar_conteudos(pilar, tipo, ordem);
