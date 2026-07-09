import { X } from 'lucide-react';
import logoRCard from '@/assets/e88c6454816224d16b0c3ab8438f10bfae44646a.png';

interface DigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberCompany: string;
  memberNumber: string;
  memberPhoto?: string | null;
}

export function DigitalCardModal({ isOpen, onClose, memberName, memberCompany, memberNumber, memberPhoto }: DigitalCardModalProps) {
  if (!isOpen) return null;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-gradient-to-br from-black via-gray-900 to-black border-2 border-white/80 shadow-2xl relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-2 right-2 w-8 h-8 bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
        >
          <X size={16} className="text-white" />
        </button>

        <div className="relative p-5">
          {/* R-CARD logo top */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 px-2 py-0.5">
              <p className="text-[10px] font-semibold tracking-wider text-yellow-400">MEMBRO ATIVO</p>
            </div>
            <img src={logoRCard} alt="R-CARD" className="h-10 w-auto opacity-80" />
          </div>

          {/* Photo + name */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center border-2 border-white overflow-hidden flex-shrink-0">
              {memberPhoto ? (
                <img src={memberPhoto} alt={memberName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-black">{getInitials(memberName)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-base truncate">{memberName}</p>
              <p className="text-gray-400 text-xs truncate">{memberCompany}</p>
            </div>
          </div>

          {/* Card number */}
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-[10px] tracking-widest mb-1">NÚMERO DO CARTÃO</p>
            <p className="text-white text-base sm:text-lg font-mono tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis">
              {memberNumber}
            </p>
          </div>

          {/* Brand strip */}
          <div className="mt-4 border border-white/40 p-2 text-center">
            <p className="text-white text-[11px] tracking-wider font-semibold">
              RARQUES ASSOCIATION · R-CARD
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 bg-white hover:bg-gray-200 text-black font-semibold py-2.5 text-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
