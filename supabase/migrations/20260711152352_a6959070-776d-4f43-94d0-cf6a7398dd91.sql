
-- 1) Categorias do Mercado
CREATE TABLE public.market_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.market_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_categories TO authenticated;
GRANT ALL ON public.market_categories TO service_role;
ALTER TABLE public.market_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_categories public read" ON public.market_categories FOR SELECT USING (true);
CREATE POLICY "market_categories admin manage" ON public.market_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_market_categories_updated_at BEFORE UPDATE ON public.market_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Subcategorias
CREATE TABLE public.market_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.market_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, name)
);
GRANT SELECT ON public.market_subcategories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_subcategories TO authenticated;
GRANT ALL ON public.market_subcategories TO service_role;
ALTER TABLE public.market_subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_subcategories public read" ON public.market_subcategories FOR SELECT USING (true);
CREATE POLICY "market_subcategories admin manage" ON public.market_subcategories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_market_subcategories_updated_at BEFORE UPDATE ON public.market_subcategories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_market_subcategories_category ON public.market_subcategories(category_id);

-- 3) Vincular produtos
ALTER TABLE public.marketplace_products
  ADD COLUMN IF NOT EXISTS market_category_id uuid REFERENCES public.market_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS market_subcategory_id uuid REFERENCES public.market_subcategories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mp_market_category ON public.marketplace_products(market_category_id);
CREATE INDEX IF NOT EXISTS idx_mp_market_subcategory ON public.marketplace_products(market_subcategory_id);

-- 4) Seed das categorias e subcategorias
WITH ins AS (
  INSERT INTO public.market_categories (name, slug, sort_order) VALUES
    ('Alimentação','alimentacao',1),
    ('Beleza','beleza',2),
    ('Saúde','saude',3),
    ('Varejo','varejo',4),
    ('Construção','construcao',5),
    ('Automotivo','automotivo',6),
    ('Esporte','esporte',7),
    ('Domésticos','domesticos',8),
    ('Educação','educacao',9),
    ('Pets','pets',10),
    ('Postos de Combustível','postos-combustivel',11)
  RETURNING id, slug
)
INSERT INTO public.market_subcategories (category_id, name, sort_order)
SELECT ins.id, sub.name, sub.ord FROM ins
JOIN LATERAL (
  VALUES
  -- Alimentação
  ('alimentacao','Restaurante',1),('alimentacao','Pizzaria',2),('alimentacao','Lanchonete',3),
  ('alimentacao','Hamburgueria',4),('alimentacao','Padaria',5),('alimentacao','Confeitaria',6),
  ('alimentacao','Sorveteria',7),('alimentacao','Bar / Pub',8),('alimentacao','Açougue',9),
  ('alimentacao','Hortifruti',10),('alimentacao','Buffet',11),('alimentacao','Marmitaria',12),
  ('alimentacao','Cafeteria',13),('alimentacao','Doces',14),('alimentacao','Bebidas',15),
  -- Beleza
  ('beleza','Salão de Beleza',1),('beleza','Barbearia',2),('beleza','Manicure',3),
  ('beleza','Pedicure',4),('beleza','Estética',5),('beleza','Maquiagem',6),
  ('beleza','Cosméticos',7),('beleza','Perfumaria',8),('beleza','Cabeleireiro',9),
  -- Saúde
  ('saude','Clínica',1),('saude','Consultório',2),('saude','Farmácia',3),('saude','Laboratório',4),
  ('saude','Dentista',5),('saude','Psicólogo',6),('saude','Nutricionista',7),
  ('saude','Fisioterapia',8),('saude','Academia',9),
  -- Varejo
  ('varejo','Loja de Roupas',1),('varejo','Calçados',2),('varejo','Papelaria',3),
  ('varejo','Presentes',4),('varejo','Utilidades',5),('varejo','Informática',6),
  ('varejo','Eletrônicos',7),('varejo','Móveis',8),('varejo','Decoração',9),
  -- Construção
  ('construcao','Material de Construção',1),('construcao','Ferragens',2),('construcao','Hidráulica',3),
  ('construcao','Elétrica',4),('construcao','Pisos',5),('construcao','Tintas',6),
  ('construcao','Madeiras',7),('construcao','Vidraçaria',8),('construcao','Marmoraria',9),
  -- Automotivo
  ('automotivo','Oficina Mecânica',1),('automotivo','Auto Peças',2),('automotivo','Borracharia',3),
  ('automotivo','Lava Jato',4),('automotivo','Funilaria',5),('automotivo','Mecânica',6),
  ('automotivo','Elétrica Automotiva',7),('automotivo','Som Automotivo',8),('automotivo','Guincho',9),
  ('automotivo','Pneus',10),
  -- Esporte
  ('esporte','Academia',1),('esporte','Bicicletas',2),('esporte','Artigos Esportivos',3),
  ('esporte','Suplementos',4),('esporte','Personal Trainer',5),
  -- Domésticos
  ('domesticos','Eletrodomésticos',1),('domesticos','Móveis',2),('domesticos','Utensílios Domésticos',3),
  ('domesticos','Colchões',4),('domesticos','Jardinagem',5),('domesticos','Decoração',6),
  -- Educação
  ('educacao','Escola',1),('educacao','Faculdade',2),('educacao','Curso Profissionalizante',3),
  ('educacao','Idiomas',4),('educacao','Reforço Escolar',5),('educacao','Informática',6),
  -- Pets
  ('pets','Pet Shop',1),('pets','Clínica Veterinária',2),('pets','Banho e Tosa',3),
  ('pets','Rações',4),('pets','Acessórios',5),('pets','Hotel para Pets',6),('pets','Adestramento',7),
  -- Postos
  ('postos-combustivel','Posto de Gasolina',1),('postos-combustivel','Diesel',2),
  ('postos-combustivel','Etanol',3),('postos-combustivel','GNV',4),
  ('postos-combustivel','Troca de Óleo',5),('postos-combustivel','Conveniência',6),
  ('postos-combustivel','Lava Rápido',7),('postos-combustivel','Calibragem',8),
  ('postos-combustivel','Recarga Elétrica (veículos elétricos)',9)
) AS sub(slug, name, ord) ON sub.slug = ins.slug;
