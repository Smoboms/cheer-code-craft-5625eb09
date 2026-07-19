-- Respect profile privacy on public card lookup RPC.
-- Membership-active + is_public. Field default already true; no data backfill needed.
CREATE OR REPLACE FUNCTION public.get_public_card_by_code(_code text)
RETURNS TABLE(name text, avatar_url text, card_number text, card_code text, is_active boolean, user_id uuid, card_tier text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.name, p.avatar_url, p.card_number, p.card_code, p.is_active, p.user_id, p.card_tier
  FROM public.profiles p
  WHERE p.account_type = 'client'
    AND COALESCE(p.is_public, true) = true
    AND p.card_code = upper(regexp_replace(coalesce(_code,''), '[^0-9A-Za-z]', '', 'g'))
  LIMIT 1;
$function$;