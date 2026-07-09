import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { journalArticles } from '@/data/journalArticles';

export default function PublicJournalArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = journalArticles.find((a) => a.id === Number(id));

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

  // Paywall: mostra apenas o primeiro parágrafo/preview
  const preview = article.body.split('. ').slice(0, 2).join('. ') + '.';

  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={() => navigate('/journal')} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>
      <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 mb-2">
        <p className="text-[10px] font-semibold tracking-wider text-yellow-400">{article.category.toUpperCase()}</p>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{article.title}</h2>
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-950 mb-4" />
      <p className="text-gray-200 leading-relaxed text-[15px] mb-6">{preview}</p>

      {/* Paywall */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-black" />
        <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/40 p-5 text-center">
          <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center mx-auto mb-3">
            <Lock size={16} className="text-yellow-400" />
          </div>
          <p className="text-white font-semibold mb-1">Conteúdo exclusivo para Associados</p>
          <p className="text-gray-400 text-sm mb-4">
            Torne-se um Associado Rarques e leia todas as matérias completas do Journal.
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
