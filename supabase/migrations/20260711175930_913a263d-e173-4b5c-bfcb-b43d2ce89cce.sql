
-- 1. cities table
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  uf text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cities TO anon, authenticated;
GRANT ALL ON public.cities TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.cities TO authenticated;

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active cities"
  ON public.cities FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage cities"
  ON public.cities FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. seed Uruaçu-GO
INSERT INTO public.cities (name, slug, uf, is_active)
VALUES ('Uruaçu', 'uruacu-go', 'GO', true);

-- 3. add city_id column to target tables
ALTER TABLE public.partners             ADD COLUMN city_id uuid REFERENCES public.cities(id);
ALTER TABLE public.professionals        ADD COLUMN city_id uuid REFERENCES public.cities(id);
ALTER TABLE public.marketplace_products ADD COLUMN city_id uuid REFERENCES public.cities(id);
ALTER TABLE public.journal_articles     ADD COLUMN city_id uuid REFERENCES public.cities(id);
ALTER TABLE public.home_carousel_slides ADD COLUMN city_id uuid REFERENCES public.cities(id);
ALTER TABLE public.public_home_banner   ADD COLUMN city_id uuid REFERENCES public.cities(id);

-- 4. backfill all existing rows to Uruaçu
UPDATE public.partners             SET city_id = (SELECT id FROM public.cities WHERE slug='uruacu-go');
UPDATE public.professionals        SET city_id = (SELECT id FROM public.cities WHERE slug='uruacu-go');
UPDATE public.marketplace_products SET city_id = (SELECT id FROM public.cities WHERE slug='uruacu-go');
UPDATE public.journal_articles     SET city_id = (SELECT id FROM public.cities WHERE slug='uruacu-go');
UPDATE public.home_carousel_slides SET city_id = (SELECT id FROM public.cities WHERE slug='uruacu-go');
UPDATE public.public_home_banner   SET city_id = (SELECT id FROM public.cities WHERE slug='uruacu-go');

-- 5. index city_id for future filters
CREATE INDEX idx_partners_city_id             ON public.partners(city_id);
CREATE INDEX idx_professionals_city_id        ON public.professionals(city_id);
CREATE INDEX idx_marketplace_products_city_id ON public.marketplace_products(city_id);
CREATE INDEX idx_journal_articles_city_id     ON public.journal_articles(city_id);
CREATE INDEX idx_home_carousel_slides_city_id ON public.home_carousel_slides(city_id);
CREATE INDEX idx_public_home_banner_city_id   ON public.public_home_banner(city_id);
