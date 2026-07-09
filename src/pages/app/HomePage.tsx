import { useEffect, useState } from 'react';
import { CreditCard, Newspaper, LayoutGrid, TrendingUp, Users, Sparkles, Calendar, Gift } from 'lucide-react';
import type { TabType } from '@/components/app/PremiumBottomNav';
import type { MoreSection } from '@/pages/app/MorePage';

interface Props {
  userName: string;
  onNavigate: (tab: TabType) => void;
  onOpenMore: (section: MoreSection) => void;
}

type BannerAction = { type: 'tab'; value: TabType } | { type: 'more'; value: MoreSection };

interface Banner {
  icon: typeof Sparkles;
  title: string;
  text: string;
  cta: string;
  action: BannerAction;
  accent: string;
}

const BANNERS: Banner[] = [
  {
    icon: Sparkles,
    title: 'NOVIDADE',
    text: 'Novas matérias no Journal desta semana.',
    cta: 'Ler agora',
    action: { type: 'tab', value: 'journal' },
    accent: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  },
  {
    icon: Calendar,
    title: 'PRÓXIMO ENCONTRO',
    text: 'Nexus deste mês com inscrições abertas.',
    cta: 'Ver Nexus',
    action: { type: 'more', value: 'nexus' },
    accent: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  },
  {
    icon: Gift,
    title: 'BENEFÍCIO EM DESTAQUE',
    text: 'Aproveite os parceiros Rarques desta semana.',
    cta: 'Ver benefícios',
    action: { type: 'more', value: 'beneficios' },
    accent: 'text-green-400 border-green-500/40 bg-green-500/10',
  },
];

export function HomePage({ userName, onNavigate, onOpenMore }: Props) {
  const firstName = userName.split(' ')[0] || 'Associado';
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % BANNERS.length), 4500);
    return () => clearInterval(id);
  }, []);

  const handleBanner = (action: BannerAction) => {
    if (action.type === 'tab') onNavigate(action.value);
    else onOpenMore(action.value);
  };

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <p className="text-gray-400 text-sm">Bem-vindo,</p>
        <h2 className="text-2xl font-bold text-white">{firstName}</h2>
      </div>

      {/* Carrossel de banners */}
      <div className="mb-3 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {BANNERS.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="min-w-full p-3">
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${b.accent} mb-2`}>
                  <Icon size={11} />
                  <p className="text-[10px] font-semibold tracking-wider">{b.title}</p>
                </div>
                <p className="text-white text-sm mb-2 leading-snug">{b.text}</p>
                <button
                  onClick={() => handleBanner(b.action)}
                  className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold inline-flex items-center gap-1"
                >
                  {b.cta} →
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-1.5 pb-2">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 transition-all ${i === slide ? 'w-4 bg-yellow-400' : 'w-1.5 bg-gray-600'}`}
            />
          ))}
        </div>
      </div>

      {/* Card MEMBRO ATIVO compacto */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-3 mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-1.5 py-0.5 mb-1">
            <p className="text-[9px] font-semibold tracking-wider text-yellow-400">MEMBRO ATIVO</p>
          </div>
          <p className="text-white text-xs leading-snug">Acesse sua carteirinha e economize com os parceiros.</p>
        </div>
        <button
          onClick={() => onNavigate('rcard')}
          className="shrink-0 bg-white text-black px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1.5"
        >
          <CreditCard size={12} /> R-CARD
        </button>
      </div>

      {/* Grade compacta */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onNavigate('journal')} className="bg-gray-900 border border-gray-800 p-3 text-left hover:border-gray-600 transition-colors">
          <Newspaper size={18} className="text-white mb-1.5" />
          <p className="text-white font-semibold text-xs">Journal</p>
          <p className="text-gray-400 text-[10px]">Novas matérias</p>
        </button>
        <button onClick={() => onOpenMore('nexus')} className="bg-gray-900 border border-gray-800 p-3 text-left hover:border-gray-600 transition-colors">
          <Users size={18} className="text-yellow-400 mb-1.5" />
          <p className="text-white font-semibold text-xs">Nexus</p>
          <p className="text-gray-400 text-[10px]">Próximos encontros</p>
        </button>
        <button onClick={() => onOpenMore('crescer')} className="bg-gray-900 border border-gray-800 p-3 text-left hover:border-gray-600 transition-colors">
          <TrendingUp size={18} className="text-green-400 mb-1.5" />
          <p className="text-white font-semibold text-xs">Crescer</p>
          <p className="text-gray-400 text-[10px]">Diagnóstico</p>
        </button>
        <button onClick={() => onNavigate('mais')} className="bg-gray-900 border border-gray-800 p-3 text-left hover:border-gray-600 transition-colors">
          <LayoutGrid size={18} className="text-white mb-1.5" />
          <p className="text-white font-semibold text-xs">Explorar</p>
          <p className="text-gray-400 text-[10px]">Todos os pilares</p>
        </button>
      </div>
    </div>
  );
}
