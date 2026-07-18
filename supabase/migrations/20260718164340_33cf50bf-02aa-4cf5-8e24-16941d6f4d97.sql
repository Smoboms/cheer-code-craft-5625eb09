
-- TAREFA 1: revogar EXECUTE desnecessário
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
-- has_role é chamado apenas por policies/triggers rodando como owner; service_role mantém acesso implicitamente.

-- Garantir que triggers/handlers não sejam executáveis por clientes
REVOKE EXECUTE ON FUNCTION public.auto_assign_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_allowlist() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_marketplace_product_curation_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_partner_feature_flags() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- TAREFA 4: remover tabela obsoleta (dados já migrados para journal_articles)
DROP TABLE IF EXISTS public.panorama_publicacoes CASCADE;

-- TAREFA 6: índice composto para consultas de cupons por parceiro/período
CREATE INDEX IF NOT EXISTS idx_coupons_partner_created_at
  ON public.coupons (partner_id, created_at DESC);
