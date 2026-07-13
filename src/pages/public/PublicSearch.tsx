import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Building2, Wrench, ShoppingBag, MapPin, Newspaper, Cloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { journalArticles } from '@/data/journalArticles';
import { useSeo } from '@/lib/useSeo';
import { trackEvent } from '@/lib/analytics';

type Partner = { id: string; name: string; category: string | null; description: string | null };
type Product = { id: string; name: string; category: string | null; price: number | null; images: string[] | null };
type Professional = { id: string; name: string; category: string | null; city: string | null };
type Lugar = { id: string; nome: string; tipo: string; categoria: string | null; descricao: string | null };

const TIPO_CHIPS = [
  { value: '', label: 'Tudo' },
  { value: 'empresa', label: 'Empresas' },
  { value: 'profissional', label: 'Profissionais' },
  { value: 'produto', label: 'Mercado' },
  { value: 'local', label: 'Locais' },
  { value: 'materia', label: 'R.Journal' },
];

export default function PublicSearch() {
  const [params, setParams] = useSearchParams();
  const q0 = params.get('q') || '';
  const type = params.get('type') || params.get('tipo') || '';
  const cat = params.get('cat') || '';
  const [query, setQuery] = useState(q0);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [profs, setProfs] = useState<Professional[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setQuery(params.get('q') || ''), [params]);

  useSeo({
    title: q0 ? `Busca: ${q0} — Rarques Uruaçu` : 'Busca — Rarques Uruaçu',
    description: 'Busca global em empresas, produtos, profissionais, locais e notícias de Uruaçu.',
    canonical: `${window.location.origin}/buscar`,
  });

  // Registra o termo pesquisado (debounced pelo próprio q0)
  useEffect(() => {
    const term = q0.trim();
    if (!term) return;
    const t = setTimeout(() => {
      trackEvent('search_query', term.toLowerCase().slice(0, 80), term, { type: type || null, cat: cat || null });
    }, 600);
    return () => clearTimeout(t);
  }, [q0, type, cat]);

  useEffect(() => {
    const q = q0.trim();
    setLoading(true);

    const run = async () => {
      const like = q ? `%${q}%` : null;

      const partnerP =
        type && type !== 'empresa'
          ? Promise.resolve({ data: [] as Partner[] })
          : (async () => {
              let qy: any = supabase.from('partners').select('id, name, category, description').eq('is_active', true).limit(20);
              if (like) qy = qy.or(`name.ilike.${like},category.ilike.${like},description.ilike.${like}`);
              if (cat && type === 'empresa') qy = qy.ilike('category', `%${cat}%`);
              return qy;
            })();

      const productP =
        type && type !== 'produto'
          ? Promise.resolve({ data: [] as Product[] })
          : (async () => {
              let qy: any = supabase
                .from('marketplace_products')
                .select('id, name, category, price, images')
                .eq('status', 'approved')
                .eq('is_active', true)
                .limit(20);
              if (like) qy = qy.or(`name.ilike.${like},category.ilike.${like},description.ilike.${like}`);
              return qy;
            })();

      const profP =
        type && type !== 'profissional'
          ? Promise.resolve({ data: [] as Professional[] })
          : (async () => {
              let qy: any = supabase
                .from('professionals')
                .select('id, name, category, city')
                .eq('status', 'approved')
                .eq('is_active', true)
                .limit(20);
              if (like) qy = qy.or(`name.ilike.${like},category.ilike.${like},description.ilike.${like}`);
              return qy;
            })();

      const lugarP =
        type && type !== 'local'
          ? Promise.resolve({ data: [] as Lugar[] })
          : (async () => {
              let qy: any = supabase.from('lugares').select('id, nome, tipo, categoria, descricao').eq('ativo', true).limit(20);
              if (like) qy = qy.or(`nome.ilike.${like},categoria.ilike.${like},descricao.ilike.${like}`);
              if (cat) qy = qy.eq('tipo', cat);
              return qy;
            })();

      const [pR, prR, prfR, luR] = await Promise.all([partnerP, productP, profP, lugarP]);
      setPartners((pR.data as any) || []);
      setProducts((prR.data as any) || []);
      setProfs((prfR.data as any) || []);
      setLugares((luR.data as any) || []);
      setLoading(false);
    };
    run();
  }, [q0, type, cat]);

  const articles = q0.trim() && (!type || type === 'materia')
    ? journalArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(q0.toLowerCase()) ||
          a.category.toLowerCase().includes(q0.toLowerCase()) ||
          a.excerpt.toLowerCase().includes(q0.toLowerCase())
      )
    : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (query) next.q = query;
    if (type) next.type = type;
    if (cat) next.cat = cat;
    setParams(next);
  };

  const setType = (t: string) => {
    const next: Record<string, string> = {};
    if (query) next.q = query;
    if (t) next.type = t;
    setParams(next);
  };

  const nothing =
    !loading && partners.length === 0 && products.length === 0 && profs.length === 0 && lugares.length === 0 && articles.length === 0;

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Busca Global</h2>
        <p className="text-gray-400 text-sm">Empresas, produtos, profissionais, lugares e notícias de Uruaçu</p>
      </div>

      <form onSubmit={submit} className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o que procura…"
          autoFocus
          className="w-full bg-gray-900 border border-gray-800 focus:border-yellow-500 outline-none text-white text-sm pl-9 pr-3 py-2.5 transition-colors"
        />
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1 scrollbar-hide">
        {TIPO_CHIPS.map((c) => (
          <button
            key={c.value}
            onClick={() => setType(c.value)}
            className={`shrink-0 text-xs px-3 py-1.5 border transition-colors ${
              type === c.value
                ? 'bg-yellow-500 text-black border-yellow-500'
                : 'border-gray-800 text-gray-300 hover:border-yellow-500/60'
            }`}
          >
            {c.label}
          </button>
        ))}
        <Link
          to="/clima-uruacu"
          className="shrink-0 text-xs px-3 py-1.5 border border-gray-800 text-gray-300 hover:border-yellow-500/60 inline-flex items-center gap-1"
        >
          <Cloud size={12} /> Clima
        </Link>
      </div>

      {loading && <p className="text-gray-500 text-sm">Buscando…</p>}

      {!loading && !q0 && !type && (
        <p className="text-gray-500 text-sm text-center py-8">Digite algo para buscar ou escolha um tipo.</p>
      )}

      {!loading && nothing && (q0 || type) && (
        <p className="text-gray-500 text-sm text-center py-8">Nenhum resultado encontrado.</p>
      )}

      {partners.length > 0 && (
        <Section icon={<Building2 size={14} />} title={`Empresas (${partners.length})`}>
          {partners.map((p) => (
            <Link key={p.id} to={`/empresas/${p.id}`} className="block bg-gray-900 border border-gray-800 hover:border-gray-700 p-3 transition-colors">
              <p className="text-white font-semibold text-sm">{p.name}</p>
              <p className="text-gray-400 text-xs">{p.category || 'Empresa parceira'}</p>
            </Link>
          ))}
        </Section>
      )}

      {profs.length > 0 && (
        <Section icon={<Wrench size={14} />} title={`Profissionais (${profs.length})`}>
          {profs.map((p) => (
            <Link key={p.id} to="/profissionais" className="block bg-gray-900 border border-gray-800 hover:border-gray-700 p-3 transition-colors">
              <p className="text-white font-semibold text-sm">{p.name}</p>
              <p className="text-gray-400 text-xs">{p.category}{p.city ? ` · ${p.city}` : ''}</p>
            </Link>
          ))}
        </Section>
      )}

      {products.length > 0 && (
        <Section icon={<ShoppingBag size={14} />} title={`Mercado (${products.length})`}>
          {products.map((p) => (
            <Link key={p.id} to="/mercado" className="block bg-gray-900 border border-gray-800 hover:border-gray-700 p-3 transition-colors">
              <p className="text-white font-semibold text-sm">{p.name}</p>
              <p className="text-gray-400 text-xs">
                {p.category || 'Produto'}
                {p.price != null && ` · R$ ${Number(p.price).toFixed(2).replace('.', ',')}`}
              </p>
            </Link>
          ))}
        </Section>
      )}

      {lugares.length > 0 && (
        <Section icon={<MapPin size={14} />} title={`Locais (${lugares.length})`}>
          {lugares.map((l) => (
            <div key={l.id} className="bg-gray-900 border border-gray-800 p-3">
              <p className="text-white font-semibold text-sm">{l.nome}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider">
                {l.tipo}{l.categoria ? ` · ${l.categoria}` : ''}
              </p>
              {l.descricao && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{l.descricao}</p>}
            </div>
          ))}
        </Section>
      )}

      {articles.length > 0 && (
        <Section icon={<Newspaper size={14} />} title={`R.Journal (${articles.length})`}>
          {articles.map((a) => (
            <Link key={a.id} to={`/journal/${a.id}`} className="block bg-gray-900 border border-gray-800 hover:border-gray-700 p-3 transition-colors">
              <p className="text-[10px] font-semibold tracking-wider text-yellow-400 mb-1">{a.category.toUpperCase()}</p>
              <p className="text-white font-semibold text-sm leading-snug">{a.title}</p>
            </Link>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <span className="text-yellow-400">{icon}</span>
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
