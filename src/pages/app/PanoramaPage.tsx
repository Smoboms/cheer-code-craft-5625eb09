import { useEffect, useState } from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props { onBack: () => void; }

interface Post {
  id: string;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  data_publicacao: string;
}

export function PanoramaPage({ onBack }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('panorama_publicacoes')
        .select('id,titulo,resumo,conteudo,imagem_url,data_publicacao')
        .eq('status', 'published')
        .order('ordem')
        .order('data_publicacao', { ascending: false });
      setPosts((data || []) as Post[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-2 py-0.5 mb-2">
          <Globe size={11} className="text-white" />
          <p className="text-[10px] font-semibold tracking-wider text-white">PANORAMA</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Panorama</h2>
        <p className="text-gray-400 text-sm">Análise econômica com tradução prática para o empresário local</p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Carregando…</div>
      ) : !posts.length ? (
        <div className="bg-gray-900 border border-gray-800 p-4 text-gray-400 text-sm">
          Nenhuma publicação disponível no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <article key={p.id} className="bg-gray-900 border border-gray-800 overflow-hidden">
              {p.imagem_url && (
                <img src={p.imagem_url} alt={p.titulo} className="w-full aspect-video object-cover" loading="lazy" decoding="async" />
              )}
              <div className="p-4">
                <p className="text-[10px] text-gray-500 tracking-wider uppercase mb-1">
                  {new Date(p.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="text-white font-semibold text-lg mb-2">{p.titulo}</h3>
                {p.resumo && <p className="text-gray-400 text-sm mb-2">{p.resumo}</p>}
                {p.conteudo && <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{p.conteudo}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
