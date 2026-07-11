import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Globe, Clock, X, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Lugar = {
  id: string;
  nome: string;
  slug: string;
  tipo: string;
  categoria: string | null;
  descricao: string | null;
  endereco: string | null;
  telefone: string | null;
  whatsapp: string | null;
  site: string | null;
  latitude: number | null;
  longitude: number | null;
  horario_funcionamento: string | null;
  foto: string | null;
  ativo: boolean;
};

const TIPO_LABEL: Record<string, string> = {
  utilidade: 'Serviços Públicos',
  hotel: 'Hotéis',
  turismo: 'Turismo',
  servico: 'Serviços',
  outro: 'Outros',
};

const TIPOS = ['', 'utilidade', 'hotel', 'turismo', 'servico', 'outro'];

export default function PublicLocais() {
  const [params, setParams] = useSearchParams();
  const tipo = params.get('tipo') || '';
  const cat = params.get('cat') || '';

  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lugar | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q: any = supabase.from('lugares').select('*').eq('ativo', true).order('nome');
      if (tipo) q = q.eq('tipo', tipo);
      if (cat) q = q.ilike('categoria', `%${cat}%`);
      const { data } = await q;
      setLugares((data as Lugar[]) || []);
      setLoading(false);
    })();
  }, [tipo, cat]);

  const categorias = useMemo(
    () => Array.from(new Set(lugares.map((l) => l.categoria).filter(Boolean))) as string[],
    [lugares]
  );

  const setTipo = (t: string) => {
    const next: Record<string, string> = {};
    if (t) next.tipo = t;
    setParams(next);
  };

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Locais de Uruaçu</h1>
        <p className="text-gray-400 text-sm">Serviços públicos, hotéis, turismo e utilidades da cidade</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1 scrollbar-hide">
        {TIPOS.map((t) => (
          <button
            key={t || 'all'}
            onClick={() => setTipo(t)}
            className={`shrink-0 text-xs px-3 py-1.5 border transition-colors ${
              tipo === t
                ? 'bg-yellow-500 text-black border-yellow-500'
                : 'border-gray-800 text-gray-300 hover:border-yellow-500/60'
            }`}
          >
            {t ? TIPO_LABEL[t] || t : 'Todos'}
          </button>
        ))}
      </div>

      {cat && (
        <p className="text-xs text-gray-400 mb-3">
          Categoria: <span className="text-yellow-400">{cat}</span>
        </p>
      )}
      {!cat && categorias.length > 0 && (
        <p className="text-xs text-gray-500 mb-3">
          {categorias.length} {categorias.length === 1 ? 'categoria' : 'categorias'} · {lugares.length} {lugares.length === 1 ? 'local' : 'locais'}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Carregando…</p>
      ) : lugares.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Nenhum local encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lugares.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelected(l)}
              className="text-left bg-gray-900 border border-gray-800 hover:border-yellow-500/60 p-3 transition-colors"
            >
              <div className="flex gap-3">
                {l.foto ? (
                  <img src={l.foto} alt={l.nome} className="w-16 h-16 object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-gray-800 flex items-center justify-center shrink-0">
                    <Building2 size={24} className="text-gray-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm truncate">{l.nome}</p>
                  <p className="text-[10px] text-yellow-400 uppercase tracking-wider mt-0.5">
                    {TIPO_LABEL[l.tipo] || l.tipo}
                    {l.categoria && <> · {l.categoria}</>}
                  </p>
                  {l.endereco && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-1 flex items-center gap-1">
                      <MapPin size={10} /> {l.endereco}
                    </p>
                  )}
                  {l.telefone && (
                    <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                      <Phone size={10} /> {l.telefone}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && <DetailModal lugar={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DetailModal({ lugar, onClose }: { lugar: Lugar; onClose: () => void }) {
  const mapsUrl =
    lugar.latitude != null && lugar.longitude != null
      ? `https://www.google.com/maps?q=${lugar.latitude},${lugar.longitude}`
      : lugar.endereco
        ? `https://www.google.com/maps?q=${encodeURIComponent(lugar.endereco)}`
        : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {lugar.foto ? (
            <img src={lugar.foto} alt={lugar.nome} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-32 bg-gray-800 flex items-center justify-center">
              <Building2 size={40} className="text-gray-600" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/70 text-white p-2 hover:bg-black"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-[10px] text-yellow-400 uppercase tracking-wider mb-1">
            {TIPO_LABEL[lugar.tipo] || lugar.tipo}
            {lugar.categoria && <> · {lugar.categoria}</>}
          </p>
          <h2 className="text-white text-xl font-bold mb-3">{lugar.nome}</h2>

          {lugar.descricao && <p className="text-gray-300 text-sm mb-4">{lugar.descricao}</p>}

          <div className="space-y-2 text-sm">
            {lugar.endereco && (
              <InfoRow icon={<MapPin size={14} />} label="Endereço">
                {mapsUrl ? (
                  <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-yellow-400 hover:underline">
                    {lugar.endereco}
                  </a>
                ) : (
                  <span className="text-gray-300">{lugar.endereco}</span>
                )}
              </InfoRow>
            )}
            {lugar.telefone && (
              <InfoRow icon={<Phone size={14} />} label="Telefone">
                <a href={`tel:${lugar.telefone}`} className="text-gray-300 hover:text-yellow-400">
                  {lugar.telefone}
                </a>
              </InfoRow>
            )}
            {lugar.whatsapp && (
              <InfoRow icon={<Phone size={14} />} label="WhatsApp">
                <a
                  href={`https://wa.me/${lugar.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-400 hover:underline"
                >
                  {lugar.whatsapp}
                </a>
              </InfoRow>
            )}
            {lugar.site && (
              <InfoRow icon={<Globe size={14} />} label="Site">
                <a href={lugar.site} target="_blank" rel="noreferrer" className="text-yellow-400 hover:underline break-all">
                  {lugar.site}
                </a>
              </InfoRow>
            )}
            {lugar.horario_funcionamento && (
              <InfoRow icon={<Clock size={14} />} label="Horário">
                <span className="text-gray-300">{lugar.horario_funcionamento}</span>
              </InfoRow>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-yellow-400 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
