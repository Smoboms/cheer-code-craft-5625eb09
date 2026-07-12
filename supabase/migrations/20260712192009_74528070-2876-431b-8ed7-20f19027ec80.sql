
-- Enum de pilar
DO $$ BEGIN
  CREATE TYPE public.pilar_kind AS ENUM ('nexus','elas','magna');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pilar_tipo AS ENUM ('evento','premiacao','conteudo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.pilar_conteudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilar public.pilar_kind NOT NULL,
  tipo public.pilar_tipo NOT NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  descricao TEXT,
  imagem_url TEXT,
  data_evento TIMESTAMPTZ,
  local TEXT,
  link TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pilar_conteudos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pilar_conteudos TO authenticated;
GRANT ALL ON public.pilar_conteudos TO service_role;

ALTER TABLE public.pilar_conteudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active pilar_conteudos" ON public.pilar_conteudos
  FOR SELECT USING (ativo = true);
CREATE POLICY "Admins manage pilar_conteudos" ON public.pilar_conteudos
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_pilar_conteudos_updated_at BEFORE UPDATE ON public.pilar_conteudos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Categoria em atalhos
ALTER TABLE public.atalhos_da_casa ADD COLUMN IF NOT EXISTS categoria TEXT;

-- Google Maps URL em lugares
ALTER TABLE public.lugares ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
