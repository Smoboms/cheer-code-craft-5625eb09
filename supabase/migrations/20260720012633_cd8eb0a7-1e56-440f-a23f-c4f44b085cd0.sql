
-- 1) partners: drop anon column-wide read; expose safe columns via a view
DROP POLICY IF EXISTS "Public can view active approved partners" ON public.partners;

CREATE OR REPLACE VIEW public.partners_public AS
SELECT
  id, name, category, discount, discount_percent, distance,
  banner_url, profile_image_url, logo_url, is_member,
  description, address, city, phone, whatsapp, website, instagram,
  maps_link, opening_hours, display_order, status, is_active,
  cashback_enabled, cashback_percent, created_by, created_at
FROM public.partners
WHERE is_active = true
  AND (status IS NULL OR status = 'approved');

GRANT SELECT ON public.partners_public TO anon, authenticated;

-- Authenticated users need to keep browsing partners in some legacy code paths
-- indirectly; the view is the canonical public surface. Owners and admins keep
-- their existing table-level policies (unchanged).

-- 2) system_settings: restrict public read to the single key the frontend needs
DROP POLICY IF EXISTS system_settings_public_read ON public.system_settings;

CREATE POLICY system_settings_public_read
ON public.system_settings
FOR SELECT
TO anon, authenticated
USING (key = 'public_platform_enabled');
