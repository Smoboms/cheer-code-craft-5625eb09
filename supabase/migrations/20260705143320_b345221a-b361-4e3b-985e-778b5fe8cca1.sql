
-- Profiles: restrict SELECT to owner + admin
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Ratings: restrict SELECT to owner + admin
DROP POLICY IF EXISTS "Ratings are viewable by authenticated users" ON public.ratings;
CREATE POLICY "Users can view their own ratings"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Talents: restrict SELECT to admin only
DROP POLICY IF EXISTS "Talents are viewable by authenticated users" ON public.talents;
CREATE POLICY "Only admins can view talents"
  ON public.talents FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- user_roles: recreate admin ALL policy with explicit WITH CHECK
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated.
-- has_role is invoked from RLS policies which run with definer privileges,
-- so revoking EXECUTE from client roles does not break RLS evaluation.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.auto_assign_admin() FROM anon, authenticated, public;
