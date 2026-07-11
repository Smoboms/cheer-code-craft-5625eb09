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
}

/** Reads real, active partners from the database. */
export function useActivePartners() {
  const [partners, setPartners] = useState<DirectoryPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('partners')
        .select('id,name,category,discount,distance,banner_url,profile_image_url,logo_url,is_member,description,status,is_active')
        .eq('is_active', true)
        .order('is_member', { ascending: false })
        .order('created_at', { ascending: false });
      const rows = (data || []).filter((p: any) => !p.status || p.status === 'approved');
      setPartners(rows as any);
      setLoading(false);
    })();
  }, []);

  return { partners, loading };
}
