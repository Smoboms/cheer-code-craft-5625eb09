
CREATE TABLE IF NOT EXISTS public.panorama_publicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  resumo TEXT,
  conteudo TEXT,
  imagem_url TEXT,
  data_publicacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  ordem INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.panorama_publicacoes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.panorama_publicacoes TO authenticated;
GRANT ALL ON public.panorama_publicacoes TO service_role;

ALTER TABLE public.panorama_publicacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published panorama" ON public.panorama_publicacoes;
CREATE POLICY "Public can read published panorama"
  ON public.panorama_publicacoes FOR SELECT
  USING (status = 'published' OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage panorama" ON public.panorama_publicacoes;
CREATE POLICY "Admins manage panorama"
  ON public.panorama_publicacoes FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS trg_panorama_updated_at ON public.panorama_publicacoes;
CREATE TRIGGER trg_panorama_updated_at
  BEFORE UPDATE ON public.panorama_publicacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_panorama_status_ordem
  ON public.panorama_publicacoes (status, ordem, data_publicacao DESC);
