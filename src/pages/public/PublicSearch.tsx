import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { mockPartners } from '@/data/partnersData';
import { journalArticles } from '@/data/journalArticles';

export default function PublicSearch() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');

  useEffect(() => {
    setQuery(params.get('q') || '');
  }, [params]);

  const q = query.trim().toLowerCase();
  const companies = q
    ? mockPartners.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    : [];
  const articles = q
    ? journalArticles.filter(
        (a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
      )
    : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(query ? { q: query } : {});
  };

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Buscar</h2>
        <p className="text-gray-400 text-sm">Empresas e notícias Rarques</p>
      </div>

      <form onSubmit={submit} className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          autoFocus
          className="w-full bg-gray-900 border border-gray-800 focus:border-gray-600 outline-none text-white text-sm pl-9 pr-3 py-2.5 transition-colors"
        />
      </form>

      {q ? (
        <>
          <div className="mb-6">
            <h3 className="text-white font-semibold text-sm mb-3">Empresas encontradas ({companies.length})</h3>
            <div className="space-y-3">
              {companies.map((p) => (
                <Link
                  key={p.id}
                  to={`/empresas/${p.id}`}
                  className="block bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors p-3"
                >
                  <p className="text-white font-semibold text-sm">{p.name}</p>
                  <p className="text-gray-400 text-xs">{p.category} · {p.distance}</p>
                </Link>
              ))}
              {companies.length === 0 && <p className="text-gray-500 text-sm">Nenhuma empresa encontrada.</p>}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Notícias relacionadas ({articles.length})</h3>
            <div className="space-y-3">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  to={`/journal/${a.id}`}
                  className="block bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors p-3"
                >
                  <p className="text-[10px] font-semibold tracking-wider text-yellow-400 mb-1">{a.category.toUpperCase()}</p>
                  <p className="text-white font-semibold text-sm leading-snug">{a.title}</p>
                </Link>
              ))}
              {articles.length === 0 && <p className="text-gray-500 text-sm">Nenhuma matéria encontrada.</p>}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm text-center py-8">Digite algo para buscar.</p>
      )}
    </div>
  );
}
