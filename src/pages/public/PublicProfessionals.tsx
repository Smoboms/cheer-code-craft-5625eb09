import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, Search, MapPin, Plus } from 'lucide-react';
import { useApprovedProfessionals, useProfessionalCategories } from '@/data/useProfessionals';
import { useSeo } from '@/lib/useSeo';
import { trackEvent } from '@/lib/analytics';

function waLink(phone: string, message: string) {
  const clean = phone.replace(/\D/g, '');
  const withCountry = clean.startsWith('55') ? clean : `55${clean}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export default function PublicProfessionals() {
  const { categoria } = useParams<{ categoria?: string }>();
  const { categories } = useProfessionalCategories();
  const currentSlug = categoria?.replace(/-uruacu$/, '') || undefined;
  const { items, loading } = useApprovedProfessionals(currentSlug);
  const [query, setQuery] = useState('');

  const currentCategory = useMemo(
    () => categories.find((c) => c.slug === currentSlug) || null,
    [categories, currentSlug],
  );

  useSeo({
    title: currentCategory
      ? `${currentCategory.name} em Uruaçu — Profissionais Rarques`
      : 'Profissionais em Uruaçu — Rarques Association',
    description: currentCategory
      ? `Encontre um ${currentCategory.name.toLowerCase()} em Uruaçu. Diretório aberto de profissionais autônomos verificados.`
      : 'Diretório aberto de profissionais autônomos de Uruaçu — eletricista, encanador, dentista, pintor e muito mais.',
    canonical: `${window.location.origin}/profissionais${currentSlug ? `/${currentSlug}-uruacu` : ''}`,
  });

  const filtered = items.filter(
    (p) =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(query.toLowerCase()) ||
      (p.neighborhood || '').toLowerCase().includes(query.toLowerCase()),
  );

  const grouped = useMemo(() => {
    if (currentSlug) return null;
    const map = new Map<string, typeof filtered>();
    filtered.forEach((p) => {
      const key = p.category || 'Outros';
      const arr = map.get(key) || [];
      arr.push(p);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [filtered, currentSlug]);

  return (
    <div className="animate-fadeUp pb-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {currentCategory ? `${currentCategory.name} em Uruaçu` : 'Profissionais'}
          </h1>
          <p className="text-gray-400 text-sm">
            {currentCategory
              ? `Encontre um ${currentCategory.name.toLowerCase()} próximo de você.`
              : 'Diretório aberto de profissionais autônomos da região.'}
          </p>
        </div>
        <Link
          to="/profissionais/cadastro"
          className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] font-semibold px-3 py-2 inline-flex items-center gap-1"
        >
          <Plus size={12} /> Cadastrar
        </Link>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, cidade ou bairro..."
          className="w-full bg-gray-900 border border-gray-800 focus:border-gray-600 outline-none text-white text-sm pl-9 pr-3 py-2.5"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        <Link
          to="/profissionais"
          className={`whitespace-nowrap px-3 py-1.5 text-xs border transition-colors ${
            !currentSlug
              ? 'bg-white text-black border-white font-semibold'
              : 'bg-transparent text-gray-300 border-gray-700 hover:border-gray-500'
          }`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/profissionais/${c.slug}-uruacu`}
            className={`whitespace-nowrap px-3 py-1.5 text-xs border transition-colors ${
              currentSlug === c.slug
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-transparent text-gray-300 border-gray-700 hover:border-gray-500'
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm text-center py-8">Carregando…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 p-8 text-center">
          <p className="text-gray-400 text-sm mb-3">Nenhum profissional cadastrado ainda nesta categoria.</p>
          <Link
            to="/profissionais/cadastro"
            className="inline-block bg-yellow-500 text-black text-xs font-semibold px-4 py-2"
          >
            Seja o primeiro a cadastrar
          </Link>
        </div>
      ) : currentSlug || !grouped ? (
        <ProGrid items={filtered} />
      ) : (
        <div className="space-y-6">
          {grouped.map(([cat, arr]) => (
            <div key={cat}>
              <h2 className="text-white font-semibold mb-3 text-sm tracking-wide">{cat.toUpperCase()}</h2>
              <ProGrid items={arr} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProGrid({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
      {items.map((p) => (
        <div
          key={p.id}
          className="h-full flex flex-col bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden"
        >
          <div className="aspect-video bg-gray-800 shrink-0 flex items-center justify-center overflow-hidden">
            {p.photo_url ? (
              <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <img src="/placeholder.svg" alt="" className="w-10 h-10 opacity-40" />
            )}
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <p className="text-white text-sm font-semibold mb-1 line-clamp-1">{p.name}</p>
            <p className="text-gray-400 text-xs mb-1 line-clamp-1">{p.category}</p>
            {(p.city || p.neighborhood) && (
              <p className="text-gray-500 text-xs line-clamp-1 flex items-center gap-1">
                <MapPin size={10} /> {[p.neighborhood, p.city].filter(Boolean).join(' - ')}
              </p>
            )}
            <a
              href={waLink(p.whatsapp, `Olá ${p.name}, encontrei seu contato no diretório Rarques.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 bg-green-600 hover:bg-green-500 text-white text-[11px] font-semibold px-2 py-1.5 inline-flex items-center justify-center gap-1"
            >
              <MessageCircle size={12} /> Falar no WhatsApp
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
