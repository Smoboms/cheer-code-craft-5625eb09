import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Building2, ShoppingBag, LogIn, Wrench, Sun, Moon } from 'lucide-react';
import rarquesLogo from '@/assets/rarques-logo.png.asset.json';

const navTabs = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/journal', label: 'R.Journal', icon: Newspaper },
  { to: '/empresas', label: 'Empresas', icon: Building2 },
  { to: '/mercado', label: 'Mercado', icon: ShoppingBag },
  { to: '/profissionais', label: 'Profissionais', icon: Wrench },
];

const PUBLIC_THEME_KEY = 'rarques.publicTheme';

function usePublicTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      return localStorage.getItem(PUBLIC_THEME_KEY) === 'light' ? 'light' : 'dark';
    } catch { return 'dark'; }
  });

  useEffect(() => {
    document.body.setAttribute('data-associate-theme', theme);
    return () => {
      // Só remove se ainda for o valor atual (evita conflito com AssociateThemeProvider)
      if (document.body.getAttribute('data-associate-theme') === theme) {
        document.body.removeAttribute('data-associate-theme');
      }
    };
  }, [theme]);

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    try { localStorage.setItem(PUBLIC_THEME_KEY, t); } catch {}
  };

  return { theme, setTheme };
}

export function PublicHeader() {
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));
  const { theme, setTheme } = usePublicTheme();

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            title={theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
            className="text-gray-300 hover:text-white transition-colors p-1.5 border border-gray-700 hover:border-gray-500"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link
            to="/app"
            state={{ from: pathname }}
            className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] lg:text-xs font-semibold px-3 lg:px-4 py-1.5 lg:py-2 tracking-wide transition-colors inline-flex items-center gap-1.5"
          >
            <LogIn size={14} className="hidden lg:inline" />
            ÁREA DO MEMBRO
          </Link>
        </div>
      </div>
    </div>
  );
}
