
-- Create a private schema that is NOT exposed by the Data API
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

-- Recreate has_role in the private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- Recreate all policies that referenced public.has_role, now pointing to private.has_role

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- partners
DROP POLICY IF EXISTS "Admins can manage partners" ON public.partners;
CREATE POLICY "Admins can manage partners" ON public.partners
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- partner_benefits
DROP POLICY IF EXISTS "Admins can manage benefits" ON public.partner_benefits;
CREATE POLICY "Admins can manage benefits" ON public.partner_benefits
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- partner_photos
DROP POLICY IF EXISTS "Admins can manage photos" ON public.partner_photos;
CREATE POLICY "Admins can manage photos" ON public.partner_photos
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- ratings
DROP POLICY IF EXISTS "Users can view their own ratings" ON public.ratings;
CREATE POLICY "Users can view their own ratings" ON public.ratings
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can manage all ratings" ON public.ratings;
CREATE POLICY "Admins can manage all ratings" ON public.ratings
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- purchases
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
CREATE POLICY "Admins can view all purchases" ON public.purchases
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- talents
DROP POLICY IF EXISTS "Admins can manage talents" ON public.talents;
CREATE POLICY "Admins can manage talents" ON public.talents
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Only admins can view talents" ON public.talents;
CREATE POLICY "Only admins can view talents" ON public.talents
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- referrals
DROP POLICY IF EXISTS "Admins can view all referrals" ON public.referrals;
CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- diagnostic_results
DROP POLICY IF EXISTS "Admins can view all diagnostics" ON public.diagnostic_results;
CREATE POLICY "Admins can view all diagnostics" ON public.diagnostic_results
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- storage.objects policies referencing has_role
DROP POLICY IF EXISTS "Admins can upload partner images" ON storage.objects;
CREATE POLICY "Admins can upload partner images" ON storage.objects
  FOR INSERT TO public
  WITH CHECK ((bucket_id = 'partner-images'::text) AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update partner images" ON storage.objects;
CREATE POLICY "Admins can update partner images" ON storage.objects
  FOR UPDATE TO public
  USING ((bucket_id = 'partner-images'::text) AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete partner images" ON storage.objects;
CREATE POLICY "Admins can delete partner images" ON storage.objects
  FOR DELETE TO public
  USING ((bucket_id = 'partner-images'::text) AND private.has_role(auth.uid(), 'admin'::public.app_role));

-- Now drop the publicly-exposed function
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
