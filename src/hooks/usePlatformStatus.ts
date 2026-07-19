import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * usePlatformStatus — leitura global do interruptor da Área Pública.
 * Chave: `public_platform_enabled` na tabela `system_settings`.
 * Cache 5 minutos (React Query). Fail-open: em erro, considera ativa.
 */
export function usePlatformStatus() {
  const q = useQuery({
    queryKey: ['system_settings', 'public_platform_enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'public_platform_enabled')
        .maybeSingle();
      if (error) throw error;
      // value é jsonb → boolean
      const v = (data?.value as unknown);
      return v === false ? false : true;
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return {
    enabled: q.data !== false, // fail-open
    isLoading: q.isLoading,
    refetch: q.refetch,
  };
}
