
DROP VIEW IF EXISTS public.public_companies;

DROP POLICY IF EXISTS "Anon can view public company listings" ON public.profiles;

REVOKE SELECT (id, company, segment, avatar_url, bio, is_active, is_public, created_at)
  ON public.profiles FROM anon;
