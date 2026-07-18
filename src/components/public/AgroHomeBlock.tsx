import { Link } from 'react-router-dom';
import { Sprout, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AgroQuote = {
  boi_gordo_avista: number | null;
  soja_min: number | null;
  soja_max: number | null;
};

const brl = (n: number | null) =>
  n == null ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function AgroHomeBlock() {
  const [data, setData] = useState<AgroQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from('agro_quotes')
        .select('boi_gordo_avista, soja_min, soja_max')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setData((data as any) || null);
      setLoading(false);
    })();
  }, []);

  const soja = data?.soja_min ?? data?.soja_max ?? null;

  return (
    <div className="bg-gray-900 border border-gray-800 px-3 py-2.5 mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <Sprout size={22} className="text-yellow-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 leading-none">Agro (CEPEA)</p>
          {loading ? (
            <p className="text-gray-300 text-xs mt-1">Carregando…</p>
          ) : (
            <p className="text-white text-sm font-semibold leading-tight mt-0.5 truncate">
              Boi R$ {brl(data?.boi_gordo_avista ?? null)}/@
              <span className="text-gray-400 font-normal"> · Soja R$ {brl(soja)}/sc</span>
            </p>
          )}
        </div>
      </div>
      <Link
        to="/agro"
        className="shrink-0 text-[11px] text-yellow-400 hover:text-yellow-300 font-semibold inline-flex items-center gap-1"
      >
        Ver cotações completas <ArrowRight size={11} />
      </Link>
    </div>
  );
}
