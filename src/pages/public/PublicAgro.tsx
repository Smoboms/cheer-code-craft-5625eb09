import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Beef, Wheat, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { useSeo } from '@/lib/useSeo';
import { formatBRL } from '@/lib/utils';

type AgroQuote = {
  id: string;
  boi_gordo_avista: number | null;
  boi_gordo_aprazo: number | null;
  vaca_gorda_avista: number | null;
  boi_source: string | null;
  boi_updated_at: string | null;
  soja_min: number | null;
  soja_max: number | null;
  soja_source: string | null;
  soja_updated_at: string | null;
};

function formatDate(d: string | null) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function PublicAgro() {
  const [data, setData] = useState<AgroQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Cotações Agro em Uruaçu — Boi Gordo e Soja | Rarques',
    description: 'Cotações regionais de Boi Gordo, Vaca Gorda e Soja em Uruaçu-GO, atualizadas manualmente pela equipe Rarques.',
    canonical: `${window.location.origin}/agro`,
  });

  useEffect(() => {
    trackEvent('page_view', 'agro', 'Cotações Agro');
    (async () => {
      const { data } = await (supabase as any)
        .from('agro_quotes')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setData((data as any) || null);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="animate-fadeUp pb-4">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-1">Cotações Agro</h1>
        <p className="text-gray-400 text-sm">Valores regionais de referência — Uruaçu e região</p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Carregando cotações…
        </div>
      )}

      {!loading && (
        <>
          {/* Boi Gordo */}
          <div className="bg-gradient-to-br from-[#0b1a3a] to-black border border-yellow-500/30 p-5 mb-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-yellow-400 text-[11px] font-semibold tracking-widest mb-1">BOI GORDO · INDICADOR CEPEA/ESALQ</p>
                <p className="text-gray-300 text-xs">Referência nacional — R$ por arroba (@)</p>
              </div>
              <Beef size={44} className="text-yellow-400 opacity-80" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <AgroValor label="À vista (Indicador)" value={data?.boi_gordo_avista} />
              <AgroValor label="A prazo — Média SP" value={data?.boi_gordo_aprazo} />
              <AgroValor label="Vaca Gorda · Regional" value={data?.vaca_gorda_avista} />
            </div>
            <p className="text-[11px] text-gray-400 mt-4">
              Fonte: {data?.boi_source?.trim() || 'CEPEA/ESALQ'} · Atualizado em {formatDate(data?.boi_updated_at ?? null)}
            </p>
          </div>

          {/* Soja */}
          <div className="bg-gradient-to-br from-[#0b1a3a] to-black border border-yellow-500/30 p-5 mb-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-yellow-400 text-[11px] font-semibold tracking-widest mb-1">SOJA · INDICADOR CEPEA/ESALQ</p>
                <p className="text-gray-300 text-xs">Referência nacional — R$ por saca de 60kg (Paranaguá)</p>
              </div>
              <Wheat size={44} className="text-yellow-400 opacity-80" />
            </div>
            <div className="bg-black/30 border border-white/10 px-3 py-3">
              <div className="text-gray-400 text-[10px] tracking-wide mb-1">Indicador CEPEA/ESALQ — Paranaguá</div>
              <div className="text-white text-xl font-semibold">
                {data?.soja_min != null && data?.soja_max != null && data.soja_min !== data.soja_max
                  ? `${formatBRL(data.soja_min)} – ${formatBRL(data.soja_max)}`
                  : data?.soja_min != null
                  ? formatBRL(data.soja_min)
                  : '—'}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-4">
              Fonte: {data?.soja_source?.trim() || 'CEPEA/ESALQ'} · Atualizado em {formatDate(data?.soja_updated_at ?? null)}
            </p>
          </div>

          <p className="text-[10px] text-gray-500 mt-2 text-center">
            Valores-base do Indicador CEPEA/ESALQ (referência nacional), atualizados automaticamente.
            Não representam preço fechado exclusivo da região de Uruaçu.
          </p>
        </>
      )}
    </div>
  );
}

function AgroValor({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="bg-black/30 border border-white/10 px-3 py-3">
      <div className="text-gray-400 text-[10px] tracking-wide">{label}</div>
      <div className="text-white text-lg font-semibold mt-0.5">
        {value != null ? formatBRL(value) : '—'}
      </div>
    </div>
  );
}
