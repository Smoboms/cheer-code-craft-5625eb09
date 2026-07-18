import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE } from '@/lib/queryConfig';

export interface Professional {
  id: string;
  name: string;
  category: string;
  category_slug: string | null;
  whatsapp: string;
  city: string | null;
  neighborhood: string | null;
  description: string | null;
  photo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  created_at: string;
}

export interface ProfessionalCategory {
  id: string;
  name: string;
  slug: string;
}

export function useProfessionalCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['professional-categories'],
    queryFn: async (): Promise<ProfessionalCategory[]> => {
      const { data, error } = await (supabase as any)
        .from('professional_categories')
        .select('*')
        .order('name');
      if (error) console.error(error);
      return (data as any) || [];
    },
    ...CACHE.PUBLIC,
  });
  return { categories: data ?? [], loading: isLoading };
}

export function useApprovedProfessionals(categorySlug?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['professionals', 'approved', categorySlug ?? null],
    queryFn: async (): Promise<Professional[]> => {
      let q = (supabase as any)
        .from('professionals')
        .select('*')
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (categorySlug) q = q.eq('category_slug', categorySlug);
      const { data, error } = await q;
      if (error) console.error(error);
      return (data as any) || [];
    },
    ...CACHE.PUBLIC,
  });
  return { items: data ?? [], loading: isLoading };
}
