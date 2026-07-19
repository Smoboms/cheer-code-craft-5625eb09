import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  pilar: 'nexus' | 'elas' | 'magna';
  title: string;
  subtitle: string;
  badge: { label: string; icon?: React.ReactNode; className: string };
  onBack: () => void;
}

interface Item {
  id: string;
  tipo: 'evento' | 'premiacao' | 'conteudo';
  titulo: string;
  subtitulo: string | null;
  descricao: string | null;
  imagem_url: string | null;
  data_evento: string | null;
  local: string | null;
  link: string | null;
}

export function PilarView({ pilar, title, subtitle, badge, onBack }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('pilar_conteudos')
        .select('id,tipo,titulo,subtitulo,descricao,imagem_url,data_evento,local,link')
        .eq('pilar', pilar)
        .eq('ativo', true)
        .eq('publicado', true)
        .order('ordem', { ascending: true })
        .order('data_evento', { ascending: true });
      setItems((data as Item[]) || []);
      setLoading(false);
    })();
  }, [pilar]);

  const eventos = items.filter(i => i.tipo === 'evento');
  const conteudos = items.filter(i => i.tipo === 'conteudo');
  const premiacoes = items.filter(i => i.tipo === 'premiacao');

  const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const fmtTime = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-6">
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 mb-2 ${badge.className}`}>
          {badge.icon}
          <p className="text-[10px] font-semibold tracking-wider">{badge.label}</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>

      {loading ? (
        <CardGridSkeleton items={3} />
      ) : (
        <>
          {eventos.length > 0 && (
            <>
              <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">PRÓXIMOS ENCONTROS</h3>
              <div className="space-y-3 mb-8">
                {eventos.map(e => (
                  <div key={e.id} className="bg-gray-900 border border-gray-800 p-4">
                    <p className="text-white font-semibold mb-2">{e.titulo}</p>
                    {e.subtitulo && <p className="text-gray-400 text-xs mb-2">{e.subtitulo}</p>}
                    <div className="space-y-1 text-xs text-gray-400">
                      {e.data_evento && <div className="flex items-center gap-2"><Calendar size={14} /> {fmtDate(e.data_evento)}</div>}
                      {e.data_evento && <div className="flex items-center gap-2"><Clock size={14} /> {fmtTime(e.data_evento)}</div>}
                      {e.local && <div className="flex items-center gap-2"><MapPin size={14} /> {e.local}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {conteudos.length > 0 && (
            <>
              <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">CONTEÚDOS</h3>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {conteudos.map(c => (
                  <div key={c.id} className="bg-gray-900 border border-gray-800 overflow-hidden">
                    {c.imagem_url ? (
                      <img src={c.imagem_url} alt={c.titulo} loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-950" />
                    )}
                    <div className="p-3">
                      <p className="text-white text-sm font-semibold mb-1">{c.titulo}</p>
                      {c.descricao && <p className="text-gray-400 text-xs line-clamp-3">{c.descricao}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {premiacoes.length > 0 && (
            <>
              <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">RECONHECIMENTOS</h3>
              <div className="space-y-3">
                {premiacoes.map(p => (
                  <div key={p.id} className="bg-gray-900 border border-gray-800 p-4">
                    <p className="text-white font-semibold">{p.titulo}</p>
                    {p.subtitulo && <p className="text-yellow-400 text-xs mb-1">{p.subtitulo}</p>}
                    {p.descricao && <p className="text-gray-400 text-sm">{p.descricao}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {!eventos.length && !conteudos.length && !premiacoes.length && (
            <div className="text-gray-500 text-sm">Nenhum conteúdo publicado ainda.</div>
          )}
        </>
      )}
    </div>
  );
}
