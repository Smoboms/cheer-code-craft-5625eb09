import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DirectoryPartner {
  id: string;
  name: string;
  category: string | null;
  discount: string | null;
  distance: string | null;
  banner_url: string | null;
  profile_image_url: string | null;
  logo_url: string | null;
  is_member: boolean | null;
  description: string | null;
  address: string | null;
  city: string | null;
}

/**
 * Reads real companies registered as benefit partners (public.partners).
 * Same source used by the R-CARD/Benefits area of the Associate app.
 */
export function useActivePartners() {
  const [partners, setPartners] = useState<DirectoryPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('id,name,category,discount,distance,banner_url,profile_image_url,logo_url,is_member,description,address,city,status,is_active')
        .eq('is_active', true)
        .order('is_member', { ascending: false })
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) console.error('partners fetch error', error);
      const rows = (data || []).filter((p: any) => !p.status || p.status === 'approved');
      setPartners(rows as any);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { partners, loading };
}
