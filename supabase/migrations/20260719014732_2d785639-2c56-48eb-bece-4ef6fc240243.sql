
CREATE OR REPLACE FUNCTION public.has_company_profile(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND account_type = 'company'
  );
$$;

REVOKE ALL ON FUNCTION public.has_company_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_company_profile(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users can insert own partner" ON public.partners;
CREATE POLICY "Users can insert own partner"
ON public.partners
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by AND public.has_company_profile(auth.uid()));

DROP POLICY IF EXISTS "Users can update own partner" ON public.partners;
CREATE POLICY "Users can update own partner"
ON public.partners
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by AND public.has_company_profile(auth.uid()))
WITH CHECK (auth.uid() = created_by AND public.has_company_profile(auth.uid()));
