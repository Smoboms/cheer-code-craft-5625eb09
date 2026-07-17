
-- 1) Tighten SELECT on partner_photos: only rows for active + approved partners
DROP POLICY IF EXISTS "Photos are viewable by authenticated users" ON public.partner_photos;
CREATE POLICY "Photos viewable for approved partners"
ON public.partner_photos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.partners p
    WHERE p.id = partner_photos.partner_id
      AND p.is_active = true
      AND (p.status IS NULL OR p.status = 'approved')
  )
);

-- 2) Tighten SELECT on partner_benefits: only rows for active + approved partners
DROP POLICY IF EXISTS "Benefits are viewable by authenticated users" ON public.partner_benefits;
CREATE POLICY "Benefits viewable for approved partners"
ON public.partner_benefits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.partners p
    WHERE p.id = partner_benefits.partner_id
      AND p.is_active = true
      AND (p.status IS NULL OR p.status = 'approved')
  )
);

-- 3) Prevent partners from mutating curation fields on their own products
CREATE OR REPLACE FUNCTION public.protect_marketplace_product_curation_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins may change anything
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  -- Non-admins cannot change curation-controlled columns; force previous values
  NEW.status := OLD.status;
  NEW.is_featured := OLD.is_featured;
  NEW.rejection_reason := OLD.rejection_reason;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_marketplace_curation ON public.marketplace_products;
CREATE TRIGGER trg_protect_marketplace_curation
BEFORE UPDATE ON public.marketplace_products
FOR EACH ROW
EXECUTE FUNCTION public.protect_marketplace_product_curation_fields();
