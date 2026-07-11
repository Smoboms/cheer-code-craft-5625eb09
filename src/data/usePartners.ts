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
 * Reads real companies registered by Associates (profiles.company) via the
 * secure public_companies view. Only safe fields are exposed publicly.
 */
export function useActivePartners() {
  const [partners, setPartners] = useState<DirectoryPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('public_companies')
        .select('id,name,category,logo_url,description')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error('public_companies fetch error', error);
        setPartners([]);
      } else {
        setPartners(
          (data || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            discount: null,
            distance: null,
            banner_url: null,
            profile_image_url: null,
            logo_url: r.logo_url,
            is_member: true,
            description: r.description,
            address: null,
            city: null,
          })),
        );
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { partners, loading };
}
