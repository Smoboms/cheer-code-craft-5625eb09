
-- Professional categories
CREATE TABLE public.professional_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.professional_categories TO anon, authenticated;
GRANT ALL ON public.professional_categories TO service_role;
ALTER TABLE public.professional_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.professional_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.professional_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.professional_categories (name, slug) VALUES
  ('Eletricista','eletricista'),('Encanador','encanador'),('Pedreiro','pedreiro'),
  ('Moto Táxi','mototaxi'),('Pintor','pintor'),('Jardineiro','jardineiro'),
  ('Diarista','diarista'),('Marceneiro','marceneiro'),('Chaveiro','chaveiro'),
  ('Manicure','manicure'),('Cabeleireiro','cabeleireiro'),('Costureira','costureira');

-- Professionals
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_slug TEXT,
  whatsapp TEXT NOT NULL,
  city TEXT,
  neighborhood TEXT,
  description TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.professionals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professionals TO authenticated;
GRANT ALL ON public.professionals TO service_role;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved & active
CREATE POLICY "Public reads approved professionals" ON public.professionals
  FOR SELECT USING (status = 'approved' AND is_active = true);

-- Anyone (including anonymous visitors) can submit a new professional; forced pending
CREATE POLICY "Anyone can submit professional" ON public.professionals
  FOR INSERT WITH CHECK (status = 'pending');

-- Admins can do everything
CREATE POLICY "Admins manage professionals" ON public.professionals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_professionals_status ON public.professionals(status);
CREATE INDEX idx_professionals_category_slug ON public.professionals(category_slug);
