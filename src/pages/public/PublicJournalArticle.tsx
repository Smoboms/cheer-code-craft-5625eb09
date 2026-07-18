import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';

type Article = {
  id: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  published_at: string;
};

export default function PublicJournalArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase
        .from('journal_articles')
        .select('id,title,category,excerpt,body,cover_url,published_at')
        .eq('id', id)
        .maybeSingle();
      setArticle((data as any) || null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-fadeUp pb-4">
        <p className="text-gray-400 text-sm">Carregando…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="animate-fadeUp pb-4">
        <button onClick={() => navigate('/journal')} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
          <ArrowLeft size={18} /> Voltar
        </button>
        <p className="text-gray-400">Matéria não encontrada.</p>
      </div>
    );
  }

  const body = article.body || '';
  const preview = body.split('. ').slice(0, 2).join('. ') + (body ? '.' : '');
  const category = article.category || 'Geral';

  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={() => navigate('/journal')} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>
      <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 mb-2">
        <p className="text-[10px] font-semibold tracking-wider text-yellow-400">{category.toUpperCase()}</p>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{article.title}</h2>
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-950 mb-4 overflow-hidden">
        {article.cover_url && (
          <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>
      {article.excerpt && <p className="text-gray-300 leading-relaxed text-[15px] mb-3 italic">{article.excerpt}</p>}
      <p className="text-gray-200 leading-relaxed text-[15px] mb-6 whitespace-pre-wrap">{preview}</p>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-black" />
        <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/40 p-5 text-center">
          <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center mx-auto mb-3">
            <Lock size={16} className="text-yellow-400" />
          </div>
          <p className="text-white font-semibold mb-1">Conteúdo exclusivo para Associados</p>
          <p className="text-gray-400 text-sm mb-4">
            Torne-se um Associado Rarques e leia todas as matérias completas do R.Journal.
          </p>
          <Link
            to="/app"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 text-sm transition-colors"
          >
            Acessar Área do Associado
          </Link>
        </div>
      </div>
    </div>
  );
}
