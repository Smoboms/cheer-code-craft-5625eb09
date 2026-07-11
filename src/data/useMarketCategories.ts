import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useMarketCategories(onlyActive = true) {
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [subcategories, setSubcategories] = useState<MarketSubcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
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
    setCategories(c);
    setSubcategories(s);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [onlyActive]);

  return { categories, subcategories, loading, reload: load };
}
