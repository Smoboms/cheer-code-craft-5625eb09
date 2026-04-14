import { X, MessageCircle } from 'lucide-react';
import { Member } from '@/data/mockData';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export function MemberProfileModal({ isOpen, onClose, member }: MemberProfileModalProps) {
  if (!isOpen || !member) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Olá ${member.name}, vi seu perfil na Rarques!`);
    window.open(`https://wa.me/${member.phone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-black border border-gray-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-white font-bold">Perfil do Membro</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FFFFFF] to-[#E0E0E0] flex items-center justify-center">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-black">{getInitials(member.name)}</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="text-center mb-6">
            <h3 className="text-white text-2xl font-bold mb-1">{member.name}</h3>
            <p className="text-[#FFFFFF] text-sm mb-1">{member.company}</p>
            <p className="text-gray-400 text-sm">{member.segment}</p>
          </div>

          {/* Bio */}
          <div className="mb-6 pb-6 border-b border-gray-800">
            <p className="text-gray-300 text-sm text-center">{member.bio}</p>
          </div>

          {/* What I Offer */}
          <div className="mb-4 p-4 bg-gradient-to-r from-green-900/30 to-transparent border-l-4 border-green-600">
            <p className="text-green-400 text-xs font-semibold mb-2 uppercase tracking-wide">O que ofereço</p>
            <p className="text-white text-sm">{member.whatIOffer}</p>
          </div>

          {/* What I Seek */}
          <div className="mb-6 p-4 bg-gradient-to-r from-[#FFFFFF]/20 to-transparent border-l-4 border-[#FFFFFF]">
            <p className="text-[#FFFFFF] text-xs font-semibold mb-2 uppercase tracking-wide">O que busco na rede</p>
            <p className="text-white text-sm">{member.whatISeek}</p>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle size={20} />
            <span>Entrar em Contato via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
