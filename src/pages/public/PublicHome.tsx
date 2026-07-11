import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { journalArticles } from '@/data/journalArticles';
import { usePublicBanner } from '@/data/publicBanner';
import { useActivePartners } from '@/data/usePartners';
import { CardCarousel } from '@/components/public/CardCarousel';
import { trackEvent } from '@/lib/analytics';

export default function PublicHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const banner = usePublicBanner();
  const { partners, loading } = useActivePartners();

  const featuredCompanies = partners.slice(0, 8);
  const featuredArticles = journalArticles.filter((a) => a.featured);

  useEffect(() => {
    trackEvent('page_view', 'home', 'Início');
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="animate-fadeUp pb-4">
      {/* Banner institucional compacto */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-3 mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-1.5 py-0.5 mb-1">
            <p className="text-[9px] font-semibold tracking-wider text-yellow-400">RARQUES ASSOCIATION</p>
          </div>
          <p className="text-white text-xs leading-snug">
            Conectando empresários e profissionais da região.
          </p>
        </div>
        <Link
          to="/app"
          className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1"
        >
          Associar <ArrowRight size={11} />
        </Link>
      </div>

      {/* Banner de anúncio (controlado pelo Admin) — ainda mais compacto */}
      {banner.active && (banner.imageUrl || banner.title || banner.text) && (
        <a
          href={banner.ctaHref || '#'}
          target={banner.ctaHref?.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="relative block overflow-hidden border border-yellow-500/40 hover:border-yellow-400 transition-colors mb-4 aspect-[32/9] lg:aspect-[48/9] bg-[#0b1a3a]"
        >
          {banner.imageUrl && (
            <img
              src={banner.imageUrl}
              alt={banner.title || ''}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {(banner.title || banner.text || banner.ctaLabel) && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-1.5">
              {banner.title && (
                <p className="text-white text-[11px] font-semibold leading-tight">{banner.title}</p>
              )}
              {banner.text && (
                <p className="text-gray-200 text-[10px] leading-snug mt-0.5 line-clamp-1">{banner.text}</p>
              )}
              {banner.ctaLabel && banner.ctaHref && (
                <span className="mt-1 bg-yellow-500 text-black text-[10px] font-semibold px-2 py-0.5 inline-flex items-center gap-1">
                  {banner.ctaLabel} <ArrowRight size={9} />
                </span>
              )}
            </div>
          )}
        </a>
      )}

      {/* Busca */}
      <form onSubmit={submitSearch} className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar empresas, matérias..."
          className="w-full bg-gray-900 border border-gray-800 focus:border-gray-600 outline-none text-white text-sm pl-9 pr-3 py-2.5 transition-colors"
        />
      </form>

      {/* Empresas em Destaque — carrossel */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Empresas em Destaque</h2>
          <Link to="/empresas" className="text-gray-400 hover:text-white text-xs">Ver tudo →</Link>
        </div>
        {loading ? (
          <p className="text-gray-500 text-sm">Carregando…</p>
        ) : featuredCompanies.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 p-6 text-center">
            <p className="text-gray-400 text-sm">Ainda não há empresas cadastradas.</p>
          </div>
        ) : (
          <CardCarousel
            items={featuredCompanies}
            renderItem={(p) => (
              <button
                type="button"
                onClick={() => navigate(`/empresas/${p.id}`)}
                className="w-full h-full text-left bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden flex flex-col"
              >
                <div
                  className="aspect-video bg-cover bg-center bg-gradient-to-br from-gray-800 to-gray-950 shrink-0"
                  style={p.banner_url ? { backgroundImage: `url(${p.banner_url})` } : undefined}
                />
                <div className="p-3 flex-1 flex flex-col">
                  {p.is_member && (
                    <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 px-1.5 py-0.5 mb-1 self-start">
                      <p className="text-[9px] font-semibold tracking-wider text-yellow-400">EMPRESA MEMBRO</p>
                    </div>
                  )}
                  <p className="text-white text-sm font-semibold mb-1 line-clamp-1">{p.name}</p>
                  <p className="text-gray-400 text-xs line-clamp-2">
                    {p.description || `${p.category || 'Empresa parceira'}${p.distance ? ' · ' + p.distance : ''}`}
                  </p>
                </div>
              </button>
            )}
          />
        )}
      </div>

      {/* Destaques Journal — carrossel */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Destaques Rarques Journal</h2>
          <Link to="/journal" className="text-gray-400 hover:text-white text-xs">Ver tudo →</Link>
        </div>
        <CardCarousel
          items={featuredArticles}
          renderItem={(a) => (
            <Link
              to={`/journal/${a.id}`}
              className="block w-full bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-950" />
              <div className="p-3">
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

      {/* Rodapé institucional */}
      <div className="border-t border-gray-800 pt-4 text-center">
        <p className="text-white font-semibold text-sm mb-1">Rarques Association</p>
        <p className="text-gray-500 text-[11px]">© {new Date().getFullYear()} · Conectando empresários e profissionais</p>
      </div>
    </div>
  );
}
