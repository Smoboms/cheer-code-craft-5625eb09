import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Building2, Newspaper, Tags, Users, Ticket, BarChart3, Megaphone, ShoppingBag, ArrowLeft, Menu, X, Wrench, Layers, MapPin, LayoutGrid, Columns3, Building } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { to: '/admin/profissionais', label: 'Profissionais', icon: Wrench },
  { to: '/admin/mercado', label: 'Mercado', icon: ShoppingBag },
  { to: '/admin/mercado-categorias', label: 'Categorias do Mercado', icon: Layers },
  { to: '/admin/pilares', label: 'Pilares', icon: Columns3 },
  { to: '/admin/journal', label: 'R.Journal', icon: Newspaper },
  { to: '/admin/categorias', label: 'Categorias', icon: Tags },
  { to: '/admin/associados', label: 'Associados', icon: Users },
  { to: '/admin/cupons', label: 'Cupons', icon: Ticket },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/banners', label: 'Banners', icon: Megaphone },
  { to: '/admin/locais', label: 'Locais', icon: MapPin },
  { to: '/admin/atalhos', label: 'Atalhos da Home', icon: LayoutGrid },
  { to: '/admin/cidades', label: 'Cidades', icon: Building },
];

export default function AdminLayout() {
  const { isLoading, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-gray-400">Carregando…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-white text-2xl mb-3" style={{ fontFamily: 'UnifrakturCook, serif' }}>Rarques</h1>
          <p className="text-gray-300 mb-4">Acesso restrito. Entre com uma conta autorizada.</p>
          <button onClick={() => navigate('/app')} className="bg-yellow-500 text-black px-4 py-2 text-sm font-semibold">Ir para o login</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-white text-2xl mb-3" style={{ fontFamily: 'UnifrakturCook, serif' }}>Rarques</h1>
          <p className="text-gray-300 mb-4">Você não tem permissão para acessar o Painel Administrativo.</p>
          <button onClick={() => navigate('/app')} className="bg-yellow-500 text-black px-4 py-2 text-sm font-semibold">Voltar para a plataforma</button>
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
        <nav className="flex-1 py-3">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm border-l-2 ${isActive ? 'border-yellow-500 bg-white/5 text-white' : 'border-transparent text-gray-300 hover:bg-white/5'}`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
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
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm border-l-2 ${isActive ? 'border-yellow-500 bg-white/5 text-white' : 'border-transparent text-gray-300'}`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
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
