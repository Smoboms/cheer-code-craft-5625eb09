
DROP VIEW IF EXISTS public.partners_public;

-- Re-add the public read policy for browsing benefits (anon + authenticated).
CREATE POLICY "Public can view active approved partners"
ON public.partners
FOR SELECT
TO anon, authenticated
USING (is_active = true AND (status IS NULL OR status = 'approved'));

-- Column-level lockdown for anon: revoke row-wide SELECT and grant only safe columns.
REVOKE SELECT ON public.partners FROM anon;

GRANT SELECT (
  id, name, category, discount, discount_percent, distance,
  banner_url, profile_image_url, logo_url, is_member,
  description, address, city, phone, whatsapp, website, instagram,
  maps_link, opening_hours, display_order, status, is_active,
  cashback_enabled, cashback_percent, created_by, created_at
) ON public.partners TO anon;
