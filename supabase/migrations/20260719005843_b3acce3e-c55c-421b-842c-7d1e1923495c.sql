
-- 1) Trigger: prevent partner owners from self-approving / self-unlocking
CREATE OR REPLACE FUNCTION public.protect_partner_curation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;
  NEW.status := OLD.status;
  NEW.is_active := OLD.is_active;
  NEW.cashback_feature_unlocked := OLD.cashback_feature_unlocked;
  NEW.products_feature_unlocked := OLD.products_feature_unlocked;
  NEW.cashback_percent := OLD.cashback_percent;
  NEW.discount_percent := OLD.discount_percent;
  NEW.rejection_reason := OLD.rejection_reason;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_partner_curation_fields ON public.partners;
CREATE TRIGGER trg_protect_partner_curation_fields
BEFORE UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.protect_partner_curation_fields();

-- 2) Remove partner direct write access on cashback balances.
-- issue_coupon() is SECURITY DEFINER and bypasses RLS, so cashback still accrues normally.
DROP POLICY IF EXISTS "partner owner updates balances" ON public.client_cashback_balances;
DROP POLICY IF EXISTS "partner owner writes balances" ON public.client_cashback_balances;
