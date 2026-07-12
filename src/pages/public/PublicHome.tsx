import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Search, ArrowRight, MapPin, X } from 'lucide-react';
import { journalArticles } from '@/data/journalArticles';
import { usePublicBanner } from '@/data/publicBanner';
import { useActivePartners } from '@/data/usePartners';
import { useApprovedProfessionals } from '@/data/useProfessionals';
import { CardCarousel } from '@/components/public/CardCarousel';
import { trackEvent } from '@/lib/analytics';
import { WeatherHomeBlock } from '@/components/public/WeatherHomeBlock';
import { supabase } from '@/integrations/supabase/client';

type Atalho = { id: string; titulo: string; icone: string | null; link: string; ordem: number };
type Produto = { id: string; name: string; price: number | null; images: string[] | null; category: string | null };

const QUICK_CHIPS = [
  { label: 'Empresas', to: '/empresas' },
  { label: 'Profissionais', to: '/profissionais' },
  { label: 'Mercado', to: '/mercado' },
  { label: 'Locais', to: '/locais' },
];

const DEMAIS_CATEGORIAS = [
  { label: 'Alimentação', to: '/empresas?cat=Alimenta%C3%A7%C3%A3o', icon: 'UtensilsCrossed' },
  { label: 'Saúde e Bem-Estar', to: '/empresas?cat=Sa%C3%BAde', icon: 'HeartPulse' },
  { label: 'Educação', to: '/empresas?cat=Educa%C3%A7%C3%A3o', icon: 'GraduationCap' },
  { label: 'Automotivo', to: '/empresas?cat=Automotivo', icon: 'Car' },
  { label: 'Casa e Construção', to: '/mercado?cat=Constru%C3%A7%C3%A3o', icon: 'Hammer' },
  { label: 'Serviços', to: '/profissionais', icon: 'Wrench' },
];

function LucideIcon({ name, size = 22, className = '' }: { name?: string | null; size?: number; className?: string }) {
  const key = (name || 'Circle') as keyof typeof Icons;
  const Cmp = (Icons as any)[key] || Icons.Circle;
  return <Cmp size={size} className={className} />;
}

export default function PublicHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const banner = usePublicBanner();
  const { partners, loading: loadingPartners } = useActivePartners();
  const { items: professionals } = useApprovedProfessionals();
  const [atalhos, setAtalhos] = useState<Atalho[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    trackEvent('page_view', 'home', 'Início');
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('atalhos_da_casa')
        .select('id, titulo, icone, link, ordem')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      setAtalhos((data as any) || []);
    })();
    (async () => {
      const { data } = await (supabase as any)
        .from('marketplace_products')
        .select('id, name, price, images, category')
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8);
      setProdutos((data as any) || []);
    })();
  }, []);

  const featuredCompanies = partners.slice(0, 8);
  const featuredArticles = journalArticles.filter((a) => a.featured);
  const featuredProfs = professionals.slice(0, 8);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="animate-fadeUp pb-4">
      {/* Bloco institucional RARQUES ASSOCIATION — compacto, no topo */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 px-3 py-2 mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-1.5 py-0.5">
            <p className="text-[9px] font-semibold tracking-wider text-yellow-400">RARQUES</p>
          </div>
          <p className="text-white text-[11px] leading-snug truncate">
            Conectando empresários e profissionais.
          </p>
        </div>
        <Link
          to="/app"
          className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black px-2 py-1 text-[10px] font-semibold inline-flex items-center gap-1"
        >
          Ser Membro <ArrowRight size={10} />
        </Link>
      </div>

      {/* Banner do Admin — entre RARQUES e o título Uruaçu */}
      {banner.active && (banner.imageUrl || banner.title || banner.text) && (
        <a
          href={banner.ctaHref || '#'}
          target={banner.ctaHref?.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="relative block overflow-hidden border border-yellow-500/40 hover:border-yellow-400 transition-colors mb-4 aspect-[32/9] lg:aspect-[48/9] bg-[#0b1a3a]"
        >
          {banner.imageUrl && (
            <img src={banner.imageUrl} alt={banner.title || ''} className="absolute inset-0 w-full h-full object-cover" />
          )}
          {(banner.title || banner.text || banner.ctaLabel) && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-1.5">
              {banner.title && <p className="text-white text-[11px] font-semibold leading-tight">{banner.title}</p>}
              {banner.text && <p className="text-gray-200 text-[10px] leading-snug mt-0.5 line-clamp-1">{banner.text}</p>}
              {banner.ctaLabel && banner.ctaHref && (
                <span className="mt-1 bg-yellow-500 text-black text-[10px] font-semibold px-2 py-0.5 inline-flex items-center gap-1">
                  {banner.ctaLabel} <ArrowRight size={9} />
                </span>
              )}
            </div>
          )}
        </a>
      )}

      {/* Destaque cidade: Uruaçu — GO */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-yellow-400">
          <MapPin size={16} />
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Portal da Cidade</span>
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-bold mt-1 leading-tight">
          Uruaçu <span className="text-yellow-500">— GO</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Tudo o que acontece na cidade em um só lugar — empresas, serviços, notícias e utilidades.
        </p>
      </div>


      {/* Clima */}
      <WeatherHomeBlock />

      {/* Serviços Mais Procurados — ícones circulares dos atalhos_da_casa */}
      {atalhos.length > 0 && (
        <div className="mb-6 mt-4">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Serviços Mais Procurados</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {atalhos.map((a) => {
              const external = /^https?:\/\//.test(a.link);
              const inner = (
                <>
                  <div className="w-14 h-14 rounded-full bg-gray-900 border border-gray-800 group-hover:border-yellow-500/60 flex items-center justify-center transition-colors">
                    <LucideIcon name={a.icone} size={22} className="text-yellow-400" />
                  </div>
                  <span className="text-[11px] text-gray-300 group-hover:text-white text-center leading-tight line-clamp-2">
                    {a.titulo}
                  </span>
                </>
              );
              return external ? (
                <a key={a.id} href={a.link} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-1.5">
                  {inner}
                </a>
              ) : (
                <Link key={a.id} to={a.link} className="group flex flex-col items-center gap-1.5">
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Demais Categorias — cards retangulares com deep-link para páginas oficiais */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Demais Categorias</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {DEMAIS_CATEGORIAS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="bg-gray-900 border border-gray-800 hover:border-yellow-500/60 transition-colors p-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-black/40 border border-gray-800 flex items-center justify-center">
                <LucideIcon name={c.icon} size={18} className="text-yellow-400" />
              </div>
              <span className="text-white text-sm font-medium">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Empresas em Destaque */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Empresas em Destaque</h2>
          <Link to="/empresas" className="text-gray-400 hover:text-white text-xs">Ver tudo →</Link>
        </div>
        {loadingPartners ? (
          <p className="text-gray-500 text-sm">Carregando…</p>
        ) : featuredCompanies.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 p-6 text-center">
            <p className="text-gray-400 text-sm">Ainda não há empresas cadastradas.</p>
          </div>
        ) : (
          <CardCarousel
            items={featuredCompanies}
            itemClassName="w-[46%] md:w-[31%] lg:w-[23.5%]"
            renderItem={(p) => {
              const img = p.logo_url || p.profile_image_url || p.banner_url;
              return (
                <button
                  type="button"
                  onClick={() => navigate(`/empresas/${p.id}`)}
                  className="w-full h-full text-left bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden flex flex-col"
                >
                  <div className="aspect-video bg-gray-800 shrink-0 flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Icons.Building2 className="w-10 h-10 opacity-30 text-gray-500" />
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    {p.is_member && (
                      <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 px-1.5 py-0.5 mb-1 self-start">
                        <p className="text-[9px] font-semibold tracking-wider text-yellow-400">EMPRESA MEMBRO</p>
                      </div>
                    )}
                    <p className="text-white text-sm font-semibold mb-1 line-clamp-1">{p.name}</p>
                    <p className="text-gray-400 text-xs line-clamp-2">
                      {p.category || p.description || 'Empresa parceira'}
                    </p>
                  </div>
                </button>
              );
            }}
          />
        )}
      </div>

      {/* Profissionais em Destaque */}
      {featuredProfs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Profissionais em Destaque</h2>
            <Link to="/profissionais" className="text-gray-400 hover:text-white text-xs">Ver tudo →</Link>
          </div>
          <CardCarousel
            items={featuredProfs}
            itemClassName="w-[46%] md:w-[31%] lg:w-[23.5%]"
            renderItem={(p) => (
              <Link
                to="/profissionais"
                className="block w-full h-full bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden flex flex-col"
              >
                <div className="aspect-video bg-gray-800 shrink-0 flex items-center justify-center overflow-hidden">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Icons.Wrench className="w-10 h-10 opacity-30 text-gray-500" />
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-white text-sm font-semibold mb-1 line-clamp-1">{p.name}</p>
                  <p className="text-gray-400 text-xs line-clamp-1">{p.category}</p>
                  {p.city && <p className="text-gray-500 text-[11px] mt-1 line-clamp-1">{p.city}</p>}
                </div>
              </Link>
            )}
          />
        </div>
      )}

      {/* Mercado */}
      {produtos.length > 0 && (
        <div className="mb-6">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Mercado</h2>
            <Link to="/mercado" className="text-gray-400 hover:text-white text-xs">Ver tudo →</Link>
          </div>
          <CardCarousel
            items={produtos}
            itemClassName="w-[46%] md:w-[31%] lg:w-[23.5%]"
            renderItem={(p) => {
              const img = p.images?.[0];
              return (
                <Link
                  to="/mercado"
                  className="block w-full h-full bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden flex flex-col"
                >
                  <div className="aspect-video bg-gray-800 shrink-0 flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Icons.ShoppingBag className="w-10 h-10 opacity-30 text-gray-500" />
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-white text-sm font-semibold mb-1 line-clamp-2">{p.name}</p>
                    {p.category && <p className="text-gray-500 text-[11px] line-clamp-1">{p.category}</p>}
                    {p.price != null && (
                      <p className="text-yellow-400 text-sm font-semibold mt-1">
                        R$ {Number(p.price).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>
                </Link>
              );
            }}
          />
        </div>
      )}

      {/* Destaques Journal */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Destaques R.Journal</h2>
          <Link to="/journal" className="text-gray-400 hover:text-white text-xs">Ver tudo →</Link>
        </div>
        <CardCarousel
          items={featuredArticles}
          renderItem={(a) => (
            <Link
              to={`/journal/${a.id}`}
              className="block w-full h-full bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden flex flex-col"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-950 shrink-0" />
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-[10px] font-semibold tracking-wider text-yellow-400 mb-1">
                  {a.category.toUpperCase()} · DESTAQUE
                </p>
                <p className="text-white text-sm font-semibold mb-1 line-clamp-2">{a.title}</p>
                <p className="text-gray-400 text-xs line-clamp-2">{a.excerpt}</p>
              </div>
            </Link>
          )}
        />
      </div>

      {/* Rodapé */}
      <div className="border-t border-gray-800 pt-4 text-center">
        <p className="text-white font-semibold text-sm mb-1">Rarques Association · Uruaçu — GO</p>
        <p className="text-gray-500 text-[11px]">© {new Date().getFullYear()} · Conectando empresários e profissionais</p>
      </div>
    </div>
  );
}
