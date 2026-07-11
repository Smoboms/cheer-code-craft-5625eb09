import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Building2, ShoppingBag, LogIn } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/journal', label: 'Journal', icon: Newspaper },
  { to: '/empresas', label: 'Empresas', icon: Building2 },
  { to: '/mercado', label: 'Mercado', icon: ShoppingBag },
  { to: '/app', label: 'Associado', icon: LogIn },
];

export function PublicBottomNav() {
  const { pathname } = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50 lg:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around py-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active =
            t.to === '/' ? pathname === '/' : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className="flex flex-col items-center gap-1 px-2 py-1 transition-all"
            >
              <Icon
                size={22}
                className={active ? 'text-white' : 'text-gray-400'}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={`text-[11px] ${active ? 'text-white font-semibold' : 'text-gray-400'}`}>
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
