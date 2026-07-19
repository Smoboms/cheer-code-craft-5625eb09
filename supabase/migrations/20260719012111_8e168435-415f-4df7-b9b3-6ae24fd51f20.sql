ALTER POLICY "Admins manage cities" ON public.cities TO authenticated;

ALTER POLICY "Anyone can view active cities" ON public.cities
TO public
USING (is_active = true);

ALTER POLICY "market_categories admin manage" ON public.market_categories TO authenticated;
ALTER POLICY "market_subcategories admin manage" ON public.market_subcategories TO authenticated;

ALTER POLICY "Admins can delete products" ON public.marketplace_products TO authenticated;
ALTER POLICY "Admins can insert products" ON public.marketplace_products TO authenticated;
ALTER POLICY "Admins can update products" ON public.marketplace_products TO authenticated;
ALTER POLICY "Admins can view all products" ON public.marketplace_products TO authenticated;

ALTER POLICY "Admins manage categories" ON public.professional_categories TO authenticated;
ALTER POLICY "Admins manage professionals" ON public.professionals TO authenticated;