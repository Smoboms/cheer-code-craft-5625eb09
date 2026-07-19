
-- TAREFA 2: bloquear INSERT direto em coupons (issue_coupon é SECURITY DEFINER e ignora RLS)
DROP POLICY IF EXISTS "user creates own coupons" ON public.coupons;
DROP POLICY IF EXISTS "partner owner creates coupons" ON public.coupons;

-- TAREFA 1: revogar EXECUTE indevido em SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.create_secondary_profile(text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_secondary_profile(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.protect_card_tier() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_partner_curation_fields() FROM anon, authenticated, PUBLIC;

-- get_public_card_by_code permanece público (rota /cartao/:code sem login)
