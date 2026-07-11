
DROP POLICY IF EXISTS "Admins can delete products" ON public.marketplace_products;
CREATE POLICY "Admins can delete products" ON public.marketplace_products
  FOR DELETE USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert products" ON public.marketplace_products;
CREATE POLICY "Admins can insert products" ON public.marketplace_products
  FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update products" ON public.marketplace_products;
CREATE POLICY "Admins can update products" ON public.marketplace_products
  FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all products" ON public.marketplace_products;
CREATE POLICY "Admins can view all products" ON public.marketplace_products
  FOR SELECT USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "market_subcategories admin manage" ON public.market_subcategories;
CREATE POLICY "market_subcategories admin manage" ON public.market_subcategories
  FOR ALL USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage categories" ON public.professional_categories;
CREATE POLICY "Admins manage categories" ON public.professional_categories
  FOR ALL USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage professionals" ON public.professionals;
CREATE POLICY "Admins manage professionals" ON public.professionals
  FOR ALL USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "market_categories admin manage" ON public.market_categories;
CREATE POLICY "market_categories admin manage" ON public.market_categories
  FOR ALL USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view active cities" ON public.cities;
CREATE POLICY "Anyone can view active cities" ON public.cities
  FOR SELECT USING (is_active = true OR private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage cities" ON public.cities;
CREATE POLICY "Admins manage cities" ON public.cities
  FOR ALL USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
