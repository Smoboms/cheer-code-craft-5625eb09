
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS cashback_feature_unlocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS products_feature_unlocked boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.protect_partner_feature_flags()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;
  NEW.cashback_feature_unlocked := OLD.cashback_feature_unlocked;
  NEW.products_feature_unlocked := OLD.products_feature_unlocked;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_partner_feature_flags ON public.partners;
CREATE TRIGGER trg_protect_partner_feature_flags
BEFORE UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.protect_partner_feature_flags();
