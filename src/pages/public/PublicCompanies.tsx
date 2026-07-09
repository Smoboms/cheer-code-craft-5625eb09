import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { mockPartners } from '@/data/partnersData';

export default function PublicCompanies() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');

  const categories = useMemo(() => {
    const set = new Set(mockPartners.map((p) => p.category));
    return ['Todas', ...Array.from(set)];
  }, []);

  const filtered = mockPartners.filter((p) => {
    const matchesCat = category === 'Todas' || p.category === category;
    const matchesQuery = !query || p.name.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Empresas</h2>
        <p className="text-gray-400 text-sm">Diretório aberto de empresas parceiras</p>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar empresa..."
          className="w-full bg-gray-900 border border-gray-800 focus:border-gray-600 outline-none text-white text-sm pl-9 pr-3 py-2.5 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs border transition-colors ${
              category === c
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-transparent text-gray-300 border-gray-700 hover:border-gray-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/empresas/${p.id}`}
            className="block bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="flex">
              <div
                className="w-24 h-24 bg-cover bg-center bg-gray-800 flex-shrink-0"
                style={p.bannerImage ? { backgroundImage: `url(${p.bannerImage})` } : undefined}
              />
              <div className="flex-1 p-3 min-w-0">
                <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 px-1.5 py-0.5 mb-1">
                  <p className="text-[9px] font-semibold tracking-wider text-yellow-400">EMPRESA MEMBRO</p>
                </div>
                <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                <p className="text-gray-400 text-xs truncate">{p.category} · {p.distance}</p>
                <p className="text-yellow-400 text-xs mt-1 font-semibold">{p.discount}</p>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center text-sm py-8">Nenhuma empresa encontrada.</p>
        )}
      </div>
    </div>
  );
}
