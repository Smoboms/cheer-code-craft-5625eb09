import { X } from 'lucide-react';
import logoRCard from '@/assets/e88c6454816224d16b0c3ab8438f10bfae44646a.png';

interface DigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberCompany: string;
  memberNumber: string;
  memberPhoto?: string | null;
  cardTier?: 'standard' | 'executive';
  /** Exibir subtítulo da empresa (apenas contas Empresa). Cliente puro não deve ver "Empresa Associada". */
  showCompany?: boolean;
}

export function DigitalCardModal({ isOpen, onClose, memberName, memberCompany, memberNumber, memberPhoto, cardTier = 'standard', showCompany = false }: DigitalCardModalProps) {
  if (!isOpen) return null;

  const isExec = cardTier === 'executive';

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const shellClass = isExec
    ? 'w-full max-w-sm bg-gradient-to-br from-[#1a1204] via-black to-[#1a1204] border-2 border-yellow-500/70 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.6)] relative'
    : 'w-full max-w-sm bg-gradient-to-br from-black via-gray-900 to-black border-2 border-white/80 shadow-2xl relative';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
    >
      <div onClick={(e) => e.stopPropagation()} className={shellClass}>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-2 right-2 w-8 h-8 bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
        >
          <X size={16} className="text-white" />
        </button>

        <div className="relative p-5">
          {isExec && (
            <div className="absolute top-3 right-12 text-[9px] tracking-[0.25em] font-semibold text-yellow-400 border border-yellow-500/60 px-2 py-0.5">
              EXECUTIVO
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-block px-2 py-0.5 border ${isExec ? 'bg-yellow-500/30 border-yellow-400/80' : 'bg-yellow-500/20 border-yellow-500/50'}`}>
              <p className={`text-[10px] font-semibold tracking-wider ${isExec ? 'text-yellow-300' : 'text-yellow-400'}`}>MEMBRO ATIVO</p>
            </div>
            {!isExec && <img src={logoRCard} alt="R-CARD" className="h-10 w-auto opacity-80" />}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className={`w-14 h-14 flex items-center justify-center overflow-hidden flex-shrink-0 ${isExec ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-yellow-400' : 'bg-gradient-to-br from-white to-gray-200 border-2 border-white'}`}>
              {memberPhoto ? (
                <img src={memberPhoto} alt={memberName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-black">{getInitials(memberName)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className={`font-semibold text-base truncate ${isExec ? 'text-yellow-100' : 'text-white'}`}>{memberName}</p>
              <p className={`text-xs truncate ${isExec ? 'text-yellow-500/80' : 'text-gray-400'}`}>{memberCompany}</p>
            </div>
          </div>

          <div className={`border-t pt-4 ${isExec ? 'border-yellow-500/30' : 'border-gray-700'}`}>
            <p className={`text-[10px] tracking-widest mb-1 ${isExec ? 'text-yellow-500/80' : 'text-gray-400'}`}>NÚMERO DO CARTÃO</p>
            <p className={`text-base sm:text-lg font-mono tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis ${isExec ? 'text-yellow-100' : 'text-white'}`}>
              {memberNumber}
            </p>
          </div>

          <div className={`mt-4 border p-2 text-center ${isExec ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/40'}`}>
            <p className={`text-[11px] tracking-wider font-semibold ${isExec ? 'text-yellow-300' : 'text-white'}`}>
              RARQUES ASSOCIATION · R-CARD{isExec ? ' EXECUTIVO' : ''}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`w-full mt-4 font-semibold py-2.5 text-sm transition-colors ${isExec ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-white hover:bg-gray-200 text-black'}`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
