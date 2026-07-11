import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [categories, setCategories] = useState<ProfessionalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('professional_categories')
        .select('*')
        .order('name');
      if (cancelled) return;
      if (error) console.error(error);
      setCategories((data as any) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);
  return { categories, loading };
}

export function useApprovedProfessionals(categorySlug?: string) {
  const [items, setItems] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = (supabase as any)
        .from('professionals')
        .select('*')
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (categorySlug) q = q.eq('category_slug', categorySlug);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) console.error(error);
      setItems((data as any) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [categorySlug]);
  return { items, loading };
}
