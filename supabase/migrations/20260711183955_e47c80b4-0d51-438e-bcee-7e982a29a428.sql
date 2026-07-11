
-- =========================================
-- Tabela: lugares
-- =========================================
CREATE TABLE public.lugares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  tipo text NOT NULL, -- 'utilidade' | 'hotel' | 'turismo' | 'servico' | 'outro'
  categoria text,
  descricao text,
  endereco text,
  telefone text,
  whatsapp text,
  site text,
  latitude numeric,
  longitude numeric,
  horario_funcionamento text,
  foto text,
  city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lugares_city_id ON public.lugares(city_id);
CREATE INDEX idx_lugares_tipo ON public.lugares(tipo);
CREATE INDEX idx_lugares_ativo ON public.lugares(ativo);

GRANT SELECT ON public.lugares TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lugares TO authenticated;
GRANT ALL ON public.lugares TO service_role;

ALTER TABLE public.lugares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active lugares"
  ON public.lugares FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admins can view all lugares"
  ON public.lugares FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert lugares"
  ON public.lugares FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update lugares"
  ON public.lugares FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lugares"
  ON public.lugares FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_lugares_updated_at
  BEFORE UPDATE ON public.lugares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Tabela: atalhos_da_casa
-- =========================================
CREATE TABLE public.atalhos_da_casa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  icone text,
  link text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_atalhos_ordem ON public.atalhos_da_casa(ordem);
CREATE INDEX idx_atalhos_ativo ON public.atalhos_da_casa(ativo);

GRANT SELECT ON public.atalhos_da_casa TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.atalhos_da_casa TO authenticated;
GRANT ALL ON public.atalhos_da_casa TO service_role;

ALTER TABLE public.atalhos_da_casa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active atalhos"
  ON public.atalhos_da_casa FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admins can view all atalhos"
  ON public.atalhos_da_casa FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert atalhos"
  ON public.atalhos_da_casa FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update atalhos"
  ON public.atalhos_da_casa FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete atalhos"
  ON public.atalhos_da_casa FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_atalhos_updated_at
  BEFORE UPDATE ON public.atalhos_da_casa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Seeds
-- =========================================
DO $$
DECLARE
  v_city uuid;
BEGIN
  SELECT id INTO v_city FROM public.cities WHERE slug = 'uruacu-go' LIMIT 1;

  INSERT INTO public.lugares (nome, slug, tipo, categoria, descricao, telefone, city_id) VALUES
    ('Polícia Militar', 'policia-militar-uruacu', 'utilidade', 'Segurança', 'Batalhão da Polícia Militar de Uruaçu', '190', v_city),
    ('SAMU', 'samu-uruacu', 'utilidade', 'Saúde', 'Serviço de Atendimento Móvel de Urgência', '192', v_city),
    ('Hospital Municipal', 'hospital-municipal-uruacu', 'utilidade', 'Saúde', 'Hospital Municipal de Uruaçu', NULL, v_city),
    ('Prefeitura de Uruaçu', 'prefeitura-uruacu', 'utilidade', 'Serviços Públicos', 'Prefeitura Municipal de Uruaçu', NULL, v_city),
    ('Rodoviária de Uruaçu', 'rodoviaria-uruacu', 'utilidade', 'Transporte', 'Terminal Rodoviário de Uruaçu', NULL, v_city);

  INSERT INTO public.atalhos_da_casa (titulo, icone, link, ordem) VALUES
    ('Empresas', 'Building2', '/empresas', 1),
    ('Mercado', 'ShoppingBag', '/mercado', 2),
    ('Profissionais', 'Wrench', '/profissionais', 3),
    ('R.Journal', 'Newspaper', '/journal', 4),
    ('Clima', 'Cloud', '/clima-uruacu', 5),
    ('Serviços Públicos', 'Landmark', '/buscar?type=local&cat=utilidade', 6),
    ('Turismo', 'MapPin', '/buscar?type=local&cat=turismo', 7),
    ('Hotéis', 'Hotel', '/buscar?type=local&cat=hotel', 8);
END $$;
