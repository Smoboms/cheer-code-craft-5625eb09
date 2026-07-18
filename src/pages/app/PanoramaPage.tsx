import { ArrowLeft, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE } from '@/lib/queryConfig';

interface Props { onBack: () => void; }

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  published_at: string;
}

export function PanoramaPage({ onBack }: Props) {
  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['journal-articles', 'panorama'],
    queryFn: async (): Promise<Post[]> => {
      const { data } = await supabase
        .from('journal_articles')
        .select('id,title,excerpt,body,cover_url,published_at')
        .eq('category', 'Panorama')
        .order('published_at', { ascending: false });
      return (data || []) as Post[];
    },
    ...CACHE.PUBLIC,
  });

  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-2 py-0.5 mb-2">
          <Globe size={11} className="text-white" />
          <p className="text-[10px] font-semibold tracking-wider text-white">PANORAMA · R.JOURNAL</p>
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
              {p.cover_url && (
                <img src={p.cover_url} alt={p.title} className="w-full aspect-video object-cover" loading="lazy" decoding="async" />
              )}
              <div className="p-4">
                <p className="text-[10px] text-gray-500 tracking-wider uppercase mb-1">
                  {new Date(p.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="text-white font-semibold text-lg mb-2">{p.title}</h3>
                {p.excerpt && <p className="text-gray-400 text-sm mb-2">{p.excerpt}</p>}
                {p.body && <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{p.body}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
