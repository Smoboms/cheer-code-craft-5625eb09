
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS card_tier TEXT NOT NULL DEFAULT 'standard';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_card_tier_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_card_tier_check
      CHECK (card_tier IN ('standard','executive'));
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.protect_card_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.card_tier IS DISTINCT FROM OLD.card_tier THEN
    IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
      NEW.card_tier := OLD.card_tier;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_card_tier ON public.profiles;
CREATE TRIGGER trg_protect_card_tier
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_card_tier();

DROP FUNCTION IF EXISTS public.get_public_card_by_code(text);

CREATE OR REPLACE FUNCTION public.get_public_card_by_code(_code text)
RETURNS TABLE(name text, avatar_url text, card_number text, card_code text, is_active boolean, user_id uuid, card_tier text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.name, p.avatar_url, p.card_number, p.card_code, p.is_active, p.user_id, p.card_tier
  FROM public.profiles p
  WHERE p.account_type = 'client'
    AND p.card_code = upper(regexp_replace(coalesce(_code,''), '[^0-9A-Za-z]', '', 'g'))
  LIMIT 1;
$$;
