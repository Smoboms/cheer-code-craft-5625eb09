import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Building2, ShoppingBag, LogIn, Wrench } from 'lucide-react';
import rarquesLogo from '@/assets/rarques-logo.png.asset.json';

const navTabs = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/journal', label: 'Journal', icon: Newspaper },
  { to: '/empresas', label: 'Empresas', icon: Building2 },
  { to: '/mercado', label: 'Mercado', icon: ShoppingBag },
  { to: '/profissionais', label: 'Profissionais', icon: Wrench },
];

export function PublicHeader() {
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <div className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-50">
      <div className="max-w-md lg:max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-6">
        <Link to="/" className="shrink-0">
          <img src={rarquesLogo.url} alt="Rarques" className="h-9 w-auto object-contain" />
        </Link>

        {/* Desktop horizontal nav */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {navTabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={`text-sm tracking-wide transition-colors ${
                isActive(t.to)
                  ? 'text-white font-semibold border-b-2 border-yellow-500 pb-1'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/app"
          state={{ from: pathname }}
          className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] lg:text-xs font-semibold px-3 lg:px-4 py-1.5 lg:py-2 tracking-wide transition-colors inline-flex items-center gap-1.5"
        >
          <LogIn size={14} className="hidden lg:inline" />
          ÁREA DO ASSOCIADO
        </Link>
      </div>
    </div>
  );
}
