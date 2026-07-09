import { CreditCard, Newspaper, LayoutGrid, TrendingUp, Users } from 'lucide-react';
import type { TabType } from '@/components/app/PremiumBottomNav';
import type { MoreSection } from '@/pages/app/MorePage';

interface Props {
  userName: string;
  onNavigate: (tab: TabType) => void;
  onOpenMore: (section: MoreSection) => void;
}

export function HomePage({ userName, onNavigate, onOpenMore }: Props) {
  const firstName = userName.split(' ')[0] || 'Associado';
  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-6">
        <p className="text-gray-400 text-sm">Bem-vindo,</p>
        <h2 className="text-2xl font-bold text-white">{firstName}</h2>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-4 mb-4">
        <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 mb-2">
          <p className="text-[10px] font-semibold tracking-wider text-yellow-400">MEMBRO ATIVO</p>
        </div>
        <p className="text-white text-sm mb-3">Acesse sua carteirinha e economize com os parceiros Rarques.</p>
        <button onClick={() => onNavigate('rcard')} className="bg-white text-black px-3 py-2 text-xs font-semibold inline-flex items-center gap-2">
          <CreditCard size={14} /> Abrir R-CARD
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button onClick={() => onNavigate('journal')} className="bg-gray-900 border border-gray-800 p-4 text-left hover:border-gray-600 transition-colors">
          <Newspaper size={22} className="text-white mb-2" />
          <p className="text-white font-semibold text-sm">Journal</p>
          <p className="text-gray-400 text-xs">Novas matérias</p>
        </button>
        <button onClick={() => onOpenMore('nexus')} className="bg-gray-900 border border-gray-800 p-4 text-left hover:border-gray-600 transition-colors">
          <Users size={22} className="text-yellow-400 mb-2" />
          <p className="text-white font-semibold text-sm">Nexus</p>
          <p className="text-gray-400 text-xs">Próximos encontros</p>
        </button>
        <button onClick={() => onOpenMore('crescer')} className="bg-gray-900 border border-gray-800 p-4 text-left hover:border-gray-600 transition-colors">
          <TrendingUp size={22} className="text-green-400 mb-2" />
          <p className="text-white font-semibold text-sm">Crescer</p>
          <p className="text-gray-400 text-xs">Diagnóstico</p>
        </button>
        <button onClick={() => onNavigate('mais')} className="bg-gray-900 border border-gray-800 p-4 text-left hover:border-gray-600 transition-colors">
          <LayoutGrid size={22} className="text-white mb-2" />
          <p className="text-white font-semibold text-sm">Explorar</p>
          <p className="text-gray-400 text-xs">Todos os pilares</p>
        </button>
      </div>
    </div>
  );
}
