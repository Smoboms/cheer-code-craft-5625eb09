
-- 1) Recreate policies that referenced public.has_role to use private.has_role
DROP POLICY IF EXISTS "admin manage additional_cards" ON public.additional_cards;
DROP POLICY IF EXISTS "owner or admin read additional_cards" ON public.additional_cards;
CREATE POLICY "admin manage additional_cards" ON public.additional_cards
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner or admin read additional_cards" ON public.additional_cards
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id OR private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin reads events" ON public.analytics_events;
CREATE POLICY "admin reads events" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin manage article_categories" ON public.article_categories;
CREATE POLICY "admin manage article_categories" ON public.article_categories
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "user reads own coupons" ON public.coupons;
DROP POLICY IF EXISTS "admin manage coupons" ON public.coupons;
CREATE POLICY "user reads own coupons" ON public.coupons
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin manage slides" ON public.home_carousel_slides;
CREATE POLICY "admin manage slides" ON public.home_carousel_slides
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin manage journal_articles" ON public.journal_articles;
CREATE POLICY "admin manage journal_articles" ON public.journal_articles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin manage partner_categories" ON public.partner_categories;
CREATE POLICY "admin manage partner_categories" ON public.partner_categories
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin update banner" ON public.public_home_banner;
CREATE POLICY "admin update banner" ON public.public_home_banner
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- 2) Tighten analytics_events insert policy (no more WITH CHECK true)
DROP POLICY IF EXISTS "anyone insert events" ON public.analytics_events;
CREATE POLICY "insert own events" ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 3) Revoke EXECUTE on SECURITY DEFINER functions in public schema from anon/authenticated/PUBLIC
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_admin_for_allowlist() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_assign_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 4) Tighten storage avatars SELECT policy to owner folder only (bucket remains public for direct URLs)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Users can read their own avatar"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
