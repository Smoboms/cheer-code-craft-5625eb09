import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { mockPartners } from '@/data/partnersData';
import { journalArticles } from '@/data/journalArticles';

export default function PublicHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [slide, setSlide] = useState(0);

  const featuredCompanies = mockPartners.slice(0, 5);
  const featuredArticles = journalArticles.filter((a) => a.featured);

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
      {/* Banner institucional */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-5 mb-5">
        <p className="text-yellow-400 text-[10px] font-semibold tracking-wider mb-2">RARQUES ASSOCIATION</p>
        <h1 className="text-white text-2xl font-bold leading-tight mb-3">
          Conectando empresários e profissionais
        </h1>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Uma rede regional que aproxima quem faz negócio acontecer — com benefícios, conteúdo editorial e encontros que geram valor real.
        </p>
        <div className="flex gap-2">
          <Link
            to="/app"
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            Seja Associado <ArrowRight size={12} />
          </Link>
          <Link
            to="/empresas"
            className="border border-white/60 text-white hover:bg-white/10 px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            Empresas
          </Link>
        </div>
      </div>

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
