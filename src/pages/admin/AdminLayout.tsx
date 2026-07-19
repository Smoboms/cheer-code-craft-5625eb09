import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Building2, Newspaper, Tags, Users, Ticket, BarChart3, Megaphone, ShoppingBag, ArrowLeft, Menu, X, Wrench, Layers, MapPin, LayoutGrid, Columns3, Building, Target, DollarSign, ChevronDown, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

// Fase 6 · T2 — Prefetch inteligente. Ao passar o mouse sobre um item do menu,
// aciona o mesmo `import()` que o React.lazy usa em App.tsx. O chunk é baixado
// e cacheado pelo browser; a navegação subsequente renderiza sem espera de rede.
// Cada factory é chamada no máximo uma vez por sessão (flag `prefetched`).
const PREFETCH: Record<string, { load: () => Promise<unknown>; prefetched?: boolean }> = {
  '/admin': { load: () => import('./AdminDashboard') },
  '/admin/empresas': { load: () => import('./AdminEmpresas') },
  '/admin/associados': { load: () => import('./AdminAssociados') },
  '/admin/profissionais': { load: () => import('./AdminProfissionais') },
  '/admin/journal': { load: () => import('./AdminJournal') },
  '/admin/categorias': { load: () => import('./AdminCategorias') },
  '/admin/banners': { load: () => import('./AdminBanners') },
  '/admin/atalhos': { load: () => import('./AdminHomeAtalhos') },
  '/admin/pilares': { load: () => import('./AdminPilares') },
  '/admin/mercado': { load: () => import('./AdminMercado') },
  '/admin/mercado-categorias': { load: () => import('./AdminMercadoCategorias') },
  '/admin/locais': { load: () => import('./AdminLocals') },
  '/admin/cidades': { load: () => import('./AdminCidades') },
  '/admin/analytics': { load: () => import('./AdminAnalytics') },
  '/admin/cupons': { load: () => import('./AdminCupons') },
  '/admin/metas': { load: () => import('./AdminMetas') },
  '/admin/financeiro': { load: () => import('./AdminFinanceiro') },
};

function prefetchRoute(to: string) {
  const entry = PREFETCH[to];
  if (!entry || entry.prefetched) return;
  entry.prefetched = true;
  entry.load().catch(() => { entry.prefetched = false; });
}

const NAV_GROUPS: { title: string; items: { to: string; label: string; icon: any; end?: boolean }[] }[] = [
  {
    title: 'Gestão',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
      { to: '/admin/associados', label: 'Associados', icon: Users },
      { to: '/admin/profissionais', label: 'Profissionais', icon: Wrench },
    ],
  },
  {
    title: 'Conteúdo',
    items: [
      { to: '/admin/journal', label: 'R.Journal', icon: Newspaper },
      { to: '/admin/categorias', label: 'Categorias', icon: Tags },
      { to: '/admin/banners', label: 'Banners', icon: Megaphone },
      { to: '/admin/atalhos', label: 'Atalhos da Home', icon: LayoutGrid },
    ],
  },
  {
    title: 'Ecossistema',
    items: [
      { to: '/admin/pilares', label: 'Pilares', icon: Columns3 },
      { to: '/admin/mercado', label: 'Mercado', icon: ShoppingBag },
      { to: '/admin/mercado-categorias', label: 'Categorias do Mercado', icon: Layers },
      { to: '/admin/locais', label: 'Locais', icon: MapPin },
      { to: '/admin/cidades', label: 'Cidades', icon: Building },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/admin/cupons', label: 'Cupons', icon: Ticket },
      { to: '/admin/metas', label: 'Metas', icon: Target },
      { to: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
    ],
  },
];

export default function AdminLayout() {
  const { isLoading, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_GROUPS.map(g => [g.title, true]))
  );
  const toggleGroup = (title: string) =>
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));

  if (isLoading) {
    // Skeleton em vez de tela vazia enquanto auth resolve
    // (mantém fundo escuro para não haver flash branco)
    // eslint-disable-next-line
    const { DashboardSkeleton } = require('@/components/ui/skeleton');
    return (
      <div className="min-h-screen bg-[#0a0f1e] p-4 md:p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="max-w-lg text-center border border-yellow-500/40 bg-[#070c19] p-8">
          <ShieldAlert className="mx-auto text-yellow-500 mb-4" size={44} />
          <div className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/80 mb-2">Acesso Negado</div>
          <h1 className="text-white text-2xl mb-4" style={{ fontFamily: 'UnifrakturCook, serif' }}>Rarques</h1>
          <p className="text-gray-200 text-sm leading-relaxed mb-6 uppercase tracking-wider">
            Espaço protegido pela Equipe de Especialização Tática da Rarques.
          </p>
          <p className="text-gray-500 text-xs mb-6">
            Qualquer tentativa de acesso não autorizado é registrada e bloqueada automaticamente.
          </p>
          <button onClick={() => navigate('/app')} className="bg-yellow-500 text-black px-5 py-2 text-sm font-semibold tracking-wider">
            VOLTAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-60 flex-col border-r border-white/10 bg-[#070c19]">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-2xl text-yellow-500" style={{ fontFamily: 'UnifrakturCook, serif' }}>Rarques</div>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 mt-1">Painel Adm</div>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_GROUPS.map(group => {
            const isOpen = openGroups[group.title];
            return (
              <div key={group.title} className="mb-2">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-gray-300"
                >
                  <span>{group.title}</span>
                  <ChevronDown size={12} className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </button>
                {isOpen && group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onMouseEnter={() => prefetchRoute(item.to)}
                    onFocus={() => prefetchRoute(item.to)}
                    onTouchStart={() => prefetchRoute(item.to)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 text-sm border-l-2 ${isActive ? 'border-yellow-500 bg-white/5 text-white' : 'border-transparent text-gray-300 hover:bg-white/5'}`
                    }
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
        <button onClick={() => navigate('/app')} className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400 hover:text-white border-t border-white/10">
          <ArrowLeft size={14} /> Voltar para a plataforma
        </button>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#070c19] border-b border-white/10 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(v => !v)} className="text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="text-xl text-yellow-500" style={{ fontFamily: 'UnifrakturCook, serif' }}>Rarques</div>
          <span className="text-[10px] uppercase tracking-widest text-gray-400">Adm</span>
        </div>
        <button onClick={() => navigate('/app')} className="text-xs text-gray-300"><ArrowLeft size={14} className="inline" /> Voltar</button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bottom-0 z-40 bg-[#070c19] overflow-y-auto">
          {NAV_GROUPS.map(group => {
            const isOpen = openGroups[group.title];
            return (
              <div key={group.title} className="mb-2">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest text-gray-500"
                >
                  <span>{group.title}</span>
                  <ChevronDown size={12} className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </button>
                {isOpen && group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    onTouchStart={() => prefetchRoute(item.to)}
                    onFocus={() => prefetchRoute(item.to)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm border-l-2 ${isActive ? 'border-yellow-500 bg-white/5 text-white' : 'border-transparent text-gray-300'}`
                    }
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <main className="flex-1 min-w-0 md:pt-0 pt-14">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
