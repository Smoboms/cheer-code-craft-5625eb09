
-- Recreate view using invoker security so it respects the caller's policies and column grants
DROP VIEW IF EXISTS public.public_companies;

CREATE VIEW public.public_companies
WITH (security_invoker = on) AS
SELECT
  p.id,
  p.company AS name,
  p.segment AS category,
  p.avatar_url AS logo_url,
  p.bio AS description,
  p.created_at
FROM public.profiles p
WHERE p.company IS NOT NULL
  AND btrim(p.company) <> ''
  AND (p.is_active IS NULL OR p.is_active = true)
  AND (p.is_public IS NULL OR p.is_public = true);

GRANT SELECT ON public.public_companies TO anon, authenticated;

-- Column-level grant: anon can read ONLY these safe columns from profiles (used by the view)
GRANT SELECT (id, company, segment, avatar_url, bio, is_active, is_public, created_at)
  ON public.profiles TO anon;

-- Row-level policy: anon can only see rows that qualify as public listings
DROP POLICY IF EXISTS "Anon can view public company listings" ON public.profiles;
CREATE POLICY "Anon can view public company listings"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (
    company IS NOT NULL
    AND btrim(company) <> ''
    AND (is_active IS NULL OR is_active = true)
    AND (is_public IS NULL OR is_public = true)
  );
