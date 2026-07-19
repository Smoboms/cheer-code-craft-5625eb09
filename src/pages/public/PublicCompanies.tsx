import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useActivePartners } from '@/data/usePartners';
import { useSeo } from '@/lib/useSeo';



export default function PublicCompanies() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const initialCat = params.get('cat') || 'Todas';
  const [category, setCategory] = useState(initialCat);
  const { partners, loading } = useActivePartners();

  useSeo({
    title: category && category !== 'Todas'
      ? `${category} em Uruaçu — Empresas Rarques`
      : 'Empresas em Uruaçu — Rarques Association',
    description: 'Diretório de empresas parceiras e associadas da Rarques em Uruaçu. Encontre serviços, comércios e benefícios exclusivos.',
    canonical: `${window.location.origin}/empresas`,
  });

  useEffect(() => {
    const c = params.get('cat');
    if (c) setCategory(c);
  }, [params]);

  const categories = useMemo(() => {
    const set = new Set(partners.map((p) => p.category).filter(Boolean) as string[]);
    const list = ['Todas', ...Array.from(set)];
    if (category !== 'Todas' && !list.includes(category)) list.push(category);
    return list;
  }, [partners, category]);

  const filtered = partners.filter((p) => {
    const matchesCat =
      category === 'Todas' ||
      p.category === category ||
      (p.category || '').toLowerCase().includes(category.toLowerCase());
    const q = query.toLowerCase();
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const changeCategory = (c: string) => {
    setCategory(c);
    if (c === 'Todas') {
      const next = new URLSearchParams(params);
      next.delete('cat');
      setParams(next, { replace: true });
    } else {
      setParams({ cat: c }, { replace: true });
    }
  };


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
            onClick={() => changeCategory(c)}
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

      {loading ? (
        <div className="py-6"><CardGridSkeleton items={6} /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
          {filtered.map((p) => {
            const logo = p.logo_url || p.profile_image_url || p.banner_url;
            const address = [p.address, p.city].filter(Boolean).join(' - ');
            return (
              <Link
                key={p.id}
                to={`/empresas/${p.id}`}
                className="h-full flex flex-col bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden"
              >
                <div className="aspect-video bg-gray-800 shrink-0 flex items-center justify-center overflow-hidden">
                  {logo ? (
                    <img src={logo} alt={p.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <img src="/placeholder.svg" alt="" className="w-12 h-12 opacity-40" />
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  {p.is_member && (
                    <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 px-1.5 py-0.5 mb-1 self-start">
                      <p className="text-[9px] font-semibold tracking-wider text-yellow-400">EMPRESA MEMBRO</p>
                    </div>
                  )}
                  <p className="text-white text-sm font-semibold mb-1 line-clamp-1">{p.name}</p>
                  {p.category && (
                    <p className="text-gray-400 text-xs mb-1 line-clamp-1">{p.category}</p>
                  )}
                  <p className="text-gray-500 text-xs line-clamp-2 mt-auto">
                    {address || 'Endereço não informado'}
                  </p>
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center text-sm py-8 col-span-full">Nenhuma empresa encontrada.</p>
          )}
        </div>
      )}
    </div>
  );
}
