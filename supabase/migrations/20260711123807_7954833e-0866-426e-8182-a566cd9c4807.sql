
CREATE OR REPLACE VIEW public.public_companies
WITH (security_invoker = off) AS
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
