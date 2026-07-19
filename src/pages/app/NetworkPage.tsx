import { useEffect, useState } from 'react';
import { IdCard, TrendingUp } from 'lucide-react';
import { DigitalCardModal } from '@/components/app/DigitalCardModal';
import { SavingsCalculator } from '@/components/app/SavingsCalculator';
import { getTotalBenefitsCount } from '@/data/partnersData';
import { supabase } from '@/integrations/supabase/client';
import { formatBRL } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import logoRCard from '@/assets/e88c6454816224d16b0c3ab8438f10bfae44646a.png';

interface NetworkPageProps {
  currentUser: {
    name: string;
    company: string;
    memberNumber: string;
    bio: string;
    photo?: string | null;
  };
  isCompany?: boolean;
}

export function NetworkPage({ currentUser, isCompany = false }: NetworkPageProps) {
  const { user } = useAuth();
  const [showCardModal, setShowCardModal] = useState(false);
  const [totalSavings, setTotalSavings] = useState(0);
  const [cardTier, setCardTier] = useState<'standard' | 'executive'>('standard');

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase.from('profiles').select('card_tier').eq('user_id', user.id).eq('account_type', 'client').maybeSingle();
      if (active && data?.card_tier === 'executive') setCardTier('executive');
    })();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setTotalSavings(0);
      return;
    }
    let active = true;

    const loadSavings = async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('discount_amount')
        .eq('user_id', user.id);

      if (!active) return;
      if (error) {
        console.error('Erro ao carregar economia:', error);
        setTotalSavings(0);
        return;
      }
      const total = (data || []).reduce(
        (sum, row: any) => sum + Number(row.discount_amount || 0),
        0,
      );
      setTotalSavings(total);
    };

    void loadSavings();

    const channel = supabase
      .channel(`purchases-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchases', filter: `user_id=eq.${user.id}` },
        () => { void loadSavings(); },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="animate-fadeUp">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Rede</h2>
            <p className="text-gray-400 text-sm">50+ empresários conectados</p>
          </div>
        </div>
      </div>

      {/* Membership Card - Black Edition Style */}
      <button
        type="button"
        onClick={() => setShowCardModal(true)}
        className="w-full text-left bg-gradient-to-br from-black via-gray-900 to-black text-white shadow-2xl aspect-[1.586/1] flex flex-col justify-between p-3 sm:p-6 relative overflow-hidden border-2 border-gray-400/40 mb-8"
      >
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-20">
          <svg viewBox="0 0 400 250" className="w-full h-full">
            <defs>
              <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" />
              </pattern>
            </defs>
            <path d="M 100 50 Q 150 30 200 50 T 300 50 L 300 150 Q 250 170 200 150 T 100 150 Z" fill="url(#dots)" />
            <path d="M 150 80 Q 180 70 210 80 T 270 80 L 270 130 Q 240 140 210 130 T 150 130 Z" fill="url(#dots)" />
          </svg>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <img src={logoRCard} alt="R-CARD Benefícios" className="h-16 sm:h-32 w-auto opacity-40" style={{ filter: 'brightness(0.8)' }} />
        </div>

        <div className="flex items-start justify-between relative z-10 gap-2">
          <div className="relative min-w-0">
            <div className="inline-block bg-[#9b59b6] px-2 py-0.5 mb-2">
              <p className="text-[10px] font-semibold tracking-wide">MEMBRO ATIVO</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFFFFF] to-[#E0E0E0] flex items-center justify-center border-2 border-[#FFFFFF] flex-shrink-0 overflow-hidden">
              {currentUser.photo ? (
                <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-black">{getInitials(currentUser.name)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center relative z-10 min-w-0">
          <p className="text-xs sm:text-base tracking-wider mb-1 sm:mb-2 font-medium truncate">{currentUser.name}</p>
          <p className="text-[11px] sm:text-base tracking-[0.1em] sm:tracking-[0.15em] font-mono truncate">{currentUser.memberNumber}</p>
          <p className="text-[9px] sm:text-[10px] opacity-70 mt-1 uppercase truncate">{currentUser.company}</p>
        </div>

        <div className="relative z-10">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs opacity-70 mb-0.5 sm:mb-1">ECONOMIA TOTAL</p>
              <p className="text-base sm:text-xl font-bold text-green-400 truncate">{formatBRL(totalSavings)}</p>
            </div>
            <div className="text-right min-w-0">
              <p className="text-[10px] sm:text-xs opacity-70 mb-0.5 sm:mb-1">BENEFÍCIOS</p>
              <p className="text-base sm:text-xl font-bold">+{getTotalBenefitsCount()}</p>
            </div>
          </div>
        </div>
      </button>


      {/* Total Savings Card - Compressed */}
      <div className="mb-8 bg-gradient-to-br from-green-500 to-green-600 p-3">
        <div className="flex items-center gap-3">
          <TrendingUp size={24} className="text-white flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white/90 text-xs font-semibold">Economia Total</p>
            <p className="text-white text-2xl font-bold">{formatBRL(totalSavings)}</p>
          </div>
        </div>
        <p className="text-white/95 text-xs mt-2">
          Continue usando seus benefícios para aumentar sua economia!
        </p>
      </div>

      {/* Savings Calculator */}
      <SavingsCalculator />

      {/* Digital Card Button - moved to the end and compacted */}
      <button
        onClick={() => setShowCardModal(true)}
        className="w-full bg-black hover:bg-gray-950 border border-white/80 text-white font-semibold py-2.5 text-sm flex items-center justify-center gap-2 transition-colors mt-6"
      >
        <IdCard size={16} />
        Ver Minha Carteirinha
      </button>

      {/* Modals */}
      <DigitalCardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        memberName={currentUser.name}
        memberCompany={currentUser.company}
        memberNumber={currentUser.memberNumber}
        memberPhoto={currentUser.photo}
        cardTier={cardTier}
      />
    </div>
  );
}
