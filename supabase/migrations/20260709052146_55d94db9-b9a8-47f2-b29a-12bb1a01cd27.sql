
-- has_role helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Admin allowlist trigger
CREATE OR REPLACE FUNCTION public.grant_admin_for_allowlist()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IN ('imobiliario454@gmail.com','rarquesmatriz@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin_allowlist ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_allowlist
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_allowlist();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email IN ('imobiliario454@gmail.com','rarquesmatriz@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS is_member BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS opening_hours TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.partner_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_categories TO anon, authenticated;
GRANT ALL ON public.partner_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.partner_categories TO authenticated;
ALTER TABLE public.partner_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read partner_categories" ON public.partner_categories FOR SELECT USING (true);
CREATE POLICY "admin manage partner_categories" ON public.partner_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.article_categories TO anon, authenticated;
GRANT ALL ON public.article_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.article_categories TO authenticated;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read article_categories" ON public.article_categories FOR SELECT USING (true);
CREATE POLICY "admin manage article_categories" ON public.article_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.journal_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_url TEXT,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.journal_articles TO anon, authenticated;
GRANT ALL ON public.journal_articles TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.journal_articles TO authenticated;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read journal_articles" ON public.journal_articles FOR SELECT USING (true);
CREATE POLICY "admin manage journal_articles" ON public.journal_articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
DROP TRIGGER IF EXISTS journal_articles_updated_at ON public.journal_articles;
CREATE TRIGGER journal_articles_updated_at BEFORE UPDATE ON public.journal_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  purchase_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  savings NUMERIC(12,2) NOT NULL DEFAULT 0,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON public.coupons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_partner ON public.coupons(partner_id);
CREATE INDEX IF NOT EXISTS idx_coupons_user ON public.coupons(user_id);
GRANT SELECT, INSERT ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own coupons" ON public.coupons FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "user creates own coupons" ON public.coupons FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  target_id TEXT,
  target_label TEXT,
  user_id UUID,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_type_time ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_target ON public.analytics_events(target_id);
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin reads events" ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.home_carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT,
  title TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  link TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_carousel_slides TO anon, authenticated;
GRANT ALL ON public.home_carousel_slides TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.home_carousel_slides TO authenticated;
ALTER TABLE public.home_carousel_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read slides" ON public.home_carousel_slides FOR SELECT USING (true);
CREATE POLICY "admin manage slides" ON public.home_carousel_slides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.public_home_banner (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  cta_label TEXT NOT NULL DEFAULT 'Saiba mais',
  cta_href TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.public_home_banner (id) VALUES (1) ON CONFLICT DO NOTHING;
GRANT SELECT ON public.public_home_banner TO anon, authenticated;
GRANT ALL ON public.public_home_banner TO service_role;
GRANT UPDATE ON public.public_home_banner TO authenticated;
ALTER TABLE public.public_home_banner ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read banner" ON public.public_home_banner FOR SELECT USING (true);
CREATE POLICY "admin update banner" ON public.public_home_banner FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.additional_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  holder_name TEXT NOT NULL,
  relationship TEXT,
  card_number TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.additional_cards TO authenticated;
GRANT ALL ON public.additional_cards TO service_role;
ALTER TABLE public.additional_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner or admin read additional_cards" ON public.additional_cards FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "admin manage additional_cards" ON public.additional_cards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

INSERT INTO public.partner_categories (name) VALUES
  ('Gastronomia'),('Bem-estar'),('Serviços'),('Varejo'),('Educação')
ON CONFLICT DO NOTHING;

INSERT INTO public.article_categories (name) VALUES
  ('Economia'),('Mercado'),('Negócios'),('Desenvolvimento Regional'),('Inovação')
ON CONFLICT DO NOTHING;

INSERT INTO public.journal_articles (title, category, excerpt, body, featured) VALUES
  ('O que o novo ciclo de juros muda para o varejo regional','Economia',
   'Uma leitura prática de como o custo do dinheiro afeta estoque, crédito ao consumidor e margem.',
   'A recente inflexão da política monetária redesenha o cenário de crédito no varejo regional. Empresas que dependem de giro rápido precisam recalibrar prazos com fornecedores e revisitar a política de parcelamento ao cliente final.',
   true),
  ('Consumo local em alta: o mapa das oportunidades','Mercado',
   'Setores que mais crescem na região e onde o dinheiro do consumidor está indo de fato.',
   'Dados de movimentação do trimestre mostram crescimento acima da média em três setores: gastronomia, bem-estar e serviços recorrentes.',
   false),
  ('Sucessão que não trava a empresa','Negócios',
   'Como preparar a próxima geração sem parar o motor que faz a operação girar hoje.',
   'A sucessão bem feita não é um evento, é um processo.',
   true),
  ('Infraestrutura logística e o próximo salto','Desenvolvimento Regional',
   'Obras em andamento e o impacto direto no custo de operar na região.',
   'Duas frentes de infraestrutura em execução prometem reduzir o custo logístico regional em até dois dígitos.',
   false),
  ('IA na pequena empresa: por onde começar sem queimar caixa','Inovação',
   'Três frentes de aplicação prática que já pagam o investimento no primeiro trimestre.',
   'Ignorar IA em 2026 é o equivalente a ignorar internet em 2005.',
   true)
ON CONFLICT DO NOTHING;
