import { useEffect, useMemo, useState } from 'react';
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
  { value: '', label: 'Todos' },
  { value: 'utilidade', label: 'Serviços Públicos' },
  { value: 'hotel', label: 'Hotéis' },
  { value: 'turismo', label: 'Turismo' },
  { value: 'servico', label: 'Serviços' },
];

export default function PublicLocals() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('');
  const [q, setQ] = useState('');
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
    const term = q.trim().toLowerCase();
    return lugares.filter((l) => {
      if (tipo && l.tipo !== tipo) return false;
      if (!term) return true;
      return (
        l.nome.toLowerCase().includes(term) ||
        (l.categoria || '').toLowerCase().includes(term) ||
        (l.descricao || '').toLowerCase().includes(term)
      );
    });
  }, [lugares, tipo, q]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Locais em Uruaçu</h1>
        <p className="text-sm text-gray-400">
          Serviços públicos, hotéis, turismo e utilidades da cidade.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar local..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-600"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TIPOS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTipo(t.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              tipo === t.value
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-gray-300 border-gray-700 hover:border-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Carregando…</div>
      ) : !filtered.length ? (
        <div className="text-gray-400 text-sm py-8 text-center">Nenhum local encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((l) => (
            <button
              key={l.id}
              onClick={() => setSel(l)}
              className="text-left bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-600 transition-colors flex gap-3"
            >
              {l.foto ? (
                <img src={l.foto} alt={l.nome} className="w-16 h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                  <MapPin size={22} className="text-gray-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-white font-medium text-sm truncate">{l.nome}</div>
                <div className="text-[11px] uppercase tracking-wider text-gray-500 mt-0.5">
                  {l.tipo}{l.categoria ? ` · ${l.categoria}` : ''}
                </div>
                {l.endereco && (
                  <div className="text-xs text-gray-400 truncate mt-1">{l.endereco}</div>
                )}
              </div>
            </button>
          ))}
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
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end lg:items-center justify-center p-0 lg:p-6" onClick={onClose}>
      <div
        className="bg-gray-950 border border-gray-800 rounded-t-2xl lg:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {lugar.foto ? (
            <img src={lugar.foto} alt={lugar.nome} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <MapPin size={40} className="text-gray-600" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
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
                className="flex-1 text-center bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-2.5 rounded-lg"
              >WhatsApp</a>
            )}
            {mapsHref && (
              <a
                href={mapsHref} target="_blank" rel="noreferrer"
                className="flex-1 text-center bg-white text-black text-sm font-medium py-2.5 rounded-lg"
              >Ver no mapa</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
