
CREATE TABLE IF NOT EXISTS public.panorama_publicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  resumo TEXT,
  conteudo TEXT,
  imagem_url TEXT,
  data_publicacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'draft',
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.panorama_publicacoes TO authenticated;
GRANT ALL ON public.panorama_publicacoes TO service_role;

ALTER TABLE public.panorama_publicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read published panorama"
ON public.panorama_publicacoes FOR SELECT
TO authenticated
USING (status = 'published');

CREATE POLICY "Admins manage panorama"
ON public.panorama_publicacoes FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_panorama_publicacoes_updated_at
BEFORE UPDATE ON public.panorama_publicacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
