import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE } from '@/lib/queryConfig';

export interface DirectoryPartner {
  id: string;
  name: string;
  category: string | null;
  discount: string | null;
  discount_percent: number | null;
  distance: string | null;
  banner_url: string | null;
  profile_image_url: string | null;
  logo_url: string | null;
  is_member: boolean | null;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  maps_link: string | null;
  opening_hours: string | null;
  responsible: string | null;
  display_order: number | null;
}

/**
 * Single source of truth for partner companies used across:
 * - Área do Associado / Benefícios (R-CARD)
 * - Página pública Empresas
 * - Painel ADM
 */
// Colunas seguras para exibição pública/associado — NUNCA incluir cnpj, email, legal_name,
// responsible ou rejection_reason (dados internos / PII).
const PUBLIC_PARTNER_COLUMNS =
  'id, name, category, discount, discount_percent, distance, banner_url, profile_image_url, logo_url, is_member, description, address, city, phone, whatsapp, website, instagram, maps_link, opening_hours, display_order, status';

export function useActivePartners() {
  const { data, isLoading } = useQuery({
    queryKey: ['partners', 'active'],
    queryFn: async (): Promise<DirectoryPartner[]> => {
      const { data, error } = await supabase
        .from('partners')
        .select(PUBLIC_PARTNER_COLUMNS)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('is_member', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) {
        console.error('partners fetch error', error);
        return [];
      }
      return ((data || []) as any[]).filter((p: any) => !p.status || p.status === 'approved') as any;
    },
    ...CACHE.PUBLIC,
  });

  return { partners: data ?? [], loading: isLoading };
}
