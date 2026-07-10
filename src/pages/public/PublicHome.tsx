import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { mockPartners } from '@/data/partnersData';
import { journalArticles } from '@/data/journalArticles';
import { usePublicBanner } from '@/data/publicBanner';
import { trackEvent } from '@/lib/analytics';



export default function PublicHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [slide, setSlide] = useState(0);
  const banner = usePublicBanner();



  const featuredCompanies = mockPartners.slice(0, 5);
  const featuredArticles = journalArticles.filter((a) => a.featured);

  useEffect(() => { trackEvent('page_view', 'home', 'Início'); }, []);

  useEffect(() => {
    if (featuredCompanies.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % featuredCompanies.length), 4500);
    return () => clearInterval(id);
  }, [featuredCompanies.length]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="animate-fadeUp pb-4">
      {/* Banner institucional (compacto) */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-3 mb-3">
        <p className="text-yellow-400 text-[9px] font-semibold tracking-wider mb-1">RARQUES ASSOCIATION</p>
        <h1 className="text-white text-lg font-bold leading-tight mb-1.5">
          Conectando empresários e profissionais
        </h1>
        <p className="text-gray-300 text-xs leading-snug mb-2.5">
          Rede regional com benefícios, conteúdo editorial e encontros que geram valor real.
        </p>
        <div className="flex gap-2">
          <Link
            to="/app"
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
          >
            Seja Associado <ArrowRight size={11} />
          </Link>
          <Link
            to="/empresas"
            className="border border-white/60 text-white hover:bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
          >
            Empresas
          </Link>
        </div>
      </div>

      {/* Banner de aviso / anúncio (controlado pelo Admin) — imagem em tela cheia */}
      {banner.active && (banner.imageUrl || banner.title || banner.text) && (
        <a
          href={banner.ctaHref || '#'}
          target={banner.ctaHref?.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="relative block overflow-hidden border border-yellow-500/40 hover:border-yellow-400 transition-colors mb-4 aspect-[16/9] bg-[#0b1a3a]"
        >
          {banner.imageUrl && (
            <img
              src={banner.imageUrl}
              alt={banner.title || ''}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {(banner.title || banner.text || banner.ctaLabel) && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3">
              {banner.title && (
                <p className="text-white text-sm font-semibold leading-tight">{banner.title}</p>
              )}
              {banner.text && (
                <p className="text-gray-200 text-xs leading-snug mt-0.5">{banner.text}</p>
              )}
              {banner.ctaLabel && banner.ctaHref && (
                <span className="mt-2 bg-yellow-500 text-black text-[11px] font-semibold px-2.5 py-1.5 inline-flex items-center gap-1">
                  {banner.ctaLabel} <ArrowRight size={11} />
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

      {/* Empresas em Destaque */}
      <div className="mb-6">
        <h2 className="text-white font-bold text-lg mb-3">Empresas em Destaque</h2>
        <div className="relative overflow-hidden bg-gray-900 border border-gray-800">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            {featuredCompanies.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate(`/empresas/${p.id}`)}
                className="min-w-full text-left"
              >
                <div
                  className="aspect-[16/9] bg-cover bg-center bg-gray-800"
                  style={p.bannerImage ? { backgroundImage: `url(${p.bannerImage})` } : undefined}
                />
                <div className="p-4">
                  <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 px-2 py-0.5 mb-2">
                    <p className="text-[9px] font-semibold tracking-wider text-yellow-400">EMPRESA MEMBRO</p>
                  </div>
                  <p className="text-white font-semibold">{p.name}</p>
                  <p className="text-gray-400 text-xs">{p.category} · {p.distance}</p>
                  <p className="text-white text-xs mt-2 underline">Ver Perfil →</p>
                </div>
              </button>
            ))}
          </div>
          {featuredCompanies.length > 1 && (
            <div className="flex justify-center gap-1.5 pb-3">
              {featuredCompanies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Empresa ${i + 1}`}
                  className={`h-1.5 transition-all ${i === slide ? 'w-4 bg-yellow-400' : 'w-1.5 bg-gray-600'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Destaques Journal */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Destaques Rarques Journal</h2>
          <Link to="/journal" className="text-gray-400 hover:text-white text-xs">Ver tudo →</Link>
        </div>
        <div className="space-y-3">
          {featuredArticles.map((a) => (
            <Link
              key={a.id}
              to={`/journal/${a.id}`}
              className="block bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-gray-800 to-gray-950" />
              <div className="p-4">
                <p className="text-[10px] font-semibold tracking-wider text-yellow-400 mb-1">
                  {a.category.toUpperCase()} · DESTAQUE
                </p>
                <p className="text-white font-semibold leading-snug">{a.title}</p>
                <p className="text-gray-400 text-sm mt-1">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Rodapé institucional */}
      <div className="border-t border-gray-800 pt-4 text-center">
        <p className="text-white font-semibold text-sm mb-1">Rarques Association</p>
        <p className="text-gray-500 text-[11px]">© {new Date().getFullYear()} · Conectando empresários e profissionais</p>
      </div>
    </div>
  );
}
