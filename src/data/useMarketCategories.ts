import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE } from '@/lib/queryConfig';

export type MarketCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};
export type MarketSubcategory = {
  id: string;
  category_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

type MarketCategoriesData = {
  categories: MarketCategory[];
  subcategories: MarketSubcategory[];
};

export function useMarketCategories(onlyActive = true) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['market-categories', onlyActive],
    queryFn: async (): Promise<MarketCategoriesData> => {
      const [{ data: cats }, { data: subs }] = await Promise.all([
        supabase.from('market_categories' as any).select('*').order('sort_order').order('name'),
        supabase.from('market_subcategories' as any).select('*').order('sort_order').order('name'),
      ]);
      let c = (cats as any as MarketCategory[]) || [];
      let s = (subs as any as MarketSubcategory[]) || [];
      if (onlyActive) {
        c = c.filter((x) => x.is_active);
        s = s.filter((x) => x.is_active);
      }
      return { categories: c, subcategories: s };
    },
    ...CACHE.PUBLIC,
  });

  return {
    categories: data?.categories ?? [],
    subcategories: data?.subcategories ?? [],
    loading: isLoading,
    reload: () => qc.invalidateQueries({ queryKey: ['market-categories'] }),
  };
}
