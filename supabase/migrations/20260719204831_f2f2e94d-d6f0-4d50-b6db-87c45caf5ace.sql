
-- Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated/PUBLIC.
-- Trigger-invoked and internal helpers do not need direct callability via PostgREST.
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_allowlist() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_assign_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_marketplace_product_curation_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_partner_feature_flags() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_partner_curation_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_card_tier() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_unique_card_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_unique_card_code() FROM PUBLIC, anon, authenticated;

-- Restrict anon on RPCs that require authentication (keep authenticated access).
REVOKE EXECUTE ON FUNCTION public.issue_coupon(uuid, uuid, numeric, numeric, numeric, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.lookup_client_for_partner(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_secondary_profile(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_company_profile(uuid) FROM PUBLIC, anon;

-- get_public_card_by_code remains callable by anon (intentional — public R-CARD lookup).
