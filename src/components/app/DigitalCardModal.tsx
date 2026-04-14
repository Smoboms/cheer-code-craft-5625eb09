import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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

  const qrData = `RARQUES-${memberNumber}`;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-gradient-to-br from-black via-gray-900 to-black border-2 border-[#FFFFFF] relative overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#FFFFFF]/30"></div>
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[#FFFFFF]/30"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[#FFFFFF]/30"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#FFFFFF]/30"></div>

        <div className="relative p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-white" />
          </button>

          {/* Logo Rarques */}
          <div className="text-center mb-6">
            <h2 className="text-5xl text-white mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              R<span className="text-[#FFFFFF]">.</span>
            </h2>
            <p className="text-[#FFFFFF] text-xs tracking-widest">RARQUES ASSOCIATION</p>
          </div>

          {/* Company */}
          <div className="text-center mb-6 pb-6 border-b border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-1">{memberCompany}</h3>
            <p className="text-gray-400 text-sm">Empresa Associada</p>
          </div>

          {/* Member info with photo */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-xs mb-2">MEMBRO</p>
            {/* Member Photo */}
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFFFFF] to-[#E0E0E0] flex items-center justify-center border-2 border-[#FFFFFF] overflow-hidden">
                {memberPhoto ? (
                  <img src={memberPhoto} alt={memberName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-black">{getInitials(memberName)}</span>
                )}
              </div>
            </div>
            <p className="text-white text-xl font-semibold mb-3">{memberName}</p>
            <p className="text-gray-400 text-xs mb-1">NÚMERO DE ASSOCIADO</p>
            <p className="text-[#FFFFFF] text-lg font-mono tracking-wider">{memberNumber}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4">
              <QRCodeSVG value={qrData} size={160} level="H" />
            </div>
          </div>

          {/* Badge */}
          <div className="bg-gradient-to-r from-[#FFFFFF]/20 to-transparent border border-[#FFFFFF] p-3 text-center mb-6">
            <p className="text-[#FFFFFF] text-sm font-semibold">
              ★ MEMBRO ATIVO — RARQUES ASSOCIATION
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full bg-[#FFFFFF] hover:bg-[#E0E0E0] text-black font-bold py-3 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
