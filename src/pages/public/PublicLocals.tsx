import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Globe, Clock, X, Search } from 'lucide-react';
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
  horario_funcionamento: string | null;
  foto: string | null;
  latitude: number | null;
  longitude: number | null;
  ativo: boolean;
};

const TIPOS = [
  { value: 'Todos', label: 'Todos' },
  { value: 'utilidade', label: 'Serviços Públicos' },
  { value: 'hotel', label: 'Hotéis' },
  { value: 'turismo', label: 'Turismo' },
  { value: 'servico', label: 'Serviços' },
];

export default function PublicLocals() {
  const [params] = useSearchParams();
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState<string>(params.get('tipo') || 'Todos');
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState<Lugar | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('lugares')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      setLugares((data as Lugar[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return lugares.filter((l) => {
      if (tipo !== 'Todos' && l.tipo !== tipo) return false;
      if (!term) return true;
      return (
        l.nome.toLowerCase().includes(term) ||
        (l.categoria || '').toLowerCase().includes(term) ||
        (l.descricao || '').toLowerCase().includes(term)
      );
    });
  }, [lugares, tipo, query]);

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Locais</h2>
        <p className="text-gray-400 text-sm">Serviços públicos, hotéis, turismo e utilidades de Uruaçu</p>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar local..."
          className="w-full bg-gray-900 border border-gray-800 focus:border-gray-600 outline-none text-white text-sm pl-9 pr-3 py-2.5 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        {TIPOS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTipo(t.value)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs border transition-colors ${
              tipo === t.value
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-transparent text-gray-300 border-gray-700 hover:border-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm text-center py-8">Carregando…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
          {filtered.map((l) => (
            <button
              key={l.id}
              onClick={() => setSel(l)}
              className="h-full flex flex-col bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden text-left"
            >
              <div className="aspect-video bg-gray-800 shrink-0 flex items-center justify-center overflow-hidden">
                {l.foto ? (
                  <img src={l.foto} alt={l.nome} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <MapPin size={28} className="opacity-40 text-gray-500" />
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-white text-sm font-semibold mb-1 line-clamp-1">{l.nome}</p>
                {l.categoria && (
                  <p className="text-gray-400 text-xs mb-1 line-clamp-1">{l.categoria}</p>
                )}
                <p className="text-gray-500 text-xs line-clamp-2 mt-auto">
                  {l.endereco || 'Endereço não informado'}
                </p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center text-sm py-8 col-span-full">Nenhum local encontrado.</p>
          )}
        </div>
      )}

      {sel && <LocalDetailModal lugar={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function LocalDetailModal({ lugar, onClose }: { lugar: Lugar; onClose: () => void }) {
  const mapsHref =
    lugar.latitude && lugar.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${lugar.latitude},${lugar.longitude}`
      : lugar.endereco
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar.endereco)}`
      : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gray-950 border border-gray-800 w-[90%] max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {lugar.foto ? (
            <img src={lugar.foto} alt={lugar.nome} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-32 bg-gray-900 flex items-center justify-center">
              <MapPin size={40} className="text-gray-600" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-gray-500">
              {lugar.tipo}{lugar.categoria ? ` · ${lugar.categoria}` : ''}
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">{lugar.nome}</h2>
          </div>
          {lugar.descricao && <p className="text-sm text-gray-300">{lugar.descricao}</p>}
          <div className="space-y-2 text-sm">
            {lugar.endereco && (
              <div className="flex gap-2 text-gray-300"><MapPin size={16} className="text-gray-500 shrink-0 mt-0.5" /><span>{lugar.endereco}</span></div>
            )}
            {lugar.telefone && (
              <a href={`tel:${lugar.telefone}`} className="flex gap-2 text-gray-300 hover:text-white"><Phone size={16} className="text-gray-500 shrink-0 mt-0.5" />{lugar.telefone}</a>
            )}
            {lugar.horario_funcionamento && (
              <div className="flex gap-2 text-gray-300"><Clock size={16} className="text-gray-500 shrink-0 mt-0.5" /><span>{lugar.horario_funcionamento}</span></div>
            )}
            {lugar.site && (
              <a href={lugar.site} target="_blank" rel="noreferrer" className="flex gap-2 text-gray-300 hover:text-white"><Globe size={16} className="text-gray-500 shrink-0 mt-0.5" />{lugar.site}</a>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            {lugar.whatsapp && (
              <a
                href={`https://wa.me/${lugar.whatsapp.replace(/\D/g, '')}`}
                target="_blank" rel="noreferrer"
                className="flex-1 text-center bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-2.5"
              >WhatsApp</a>
            )}
            {mapsHref && (
              <a
                href={mapsHref} target="_blank" rel="noreferrer"
                className="flex-1 text-center bg-white text-black text-xs font-semibold py-2.5"
              >Ver no mapa</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
