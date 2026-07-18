
CREATE OR REPLACE FUNCTION public.protect_partner_feature_flags()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;
  NEW.cashback_feature_unlocked := OLD.cashback_feature_unlocked;
  NEW.products_feature_unlocked := OLD.products_feature_unlocked;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_marketplace_product_curation_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;
  NEW.status := OLD.status;
  NEW.is_featured := OLD.is_featured;
  NEW.rejection_reason := OLD.rejection_reason;
  RETURN NEW;
END;
$function$;
