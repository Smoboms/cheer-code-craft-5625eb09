import logoImage from '@/assets/5e7ebd15b35a38fb59d8739e5d44ab9c2a0e359f.png';

interface MembershipCardProps {
  name: string;
  cardNumber: string;
  savings: number;
  partners: number;
  benefits: number;
  photo?: string | null;
}

export function MembershipCard({ name, cardNumber, savings, partners, benefits, photo }: MembershipCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-gradient-to-br from-black via-black to-gray-950 text-white shadow-xl aspect-[1.586/1] flex flex-col justify-between p-8 relative overflow-hidden border-2 border-gray-400/40">
      {/* R-CARD Logo - absolute top right */}
      <div className="absolute top-4 right-6 text-right z-10">
        <p className="text-3xl font-bold tracking-wider opacity-40" style={{ fontFamily: 'Cormorant Garamond, serif' }}>R-CARD</p>
        <p className="text-sm opacity-30 mt-1">Benefícios</p>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 relative z-10">
        {/* User Photo/Initial */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#FFFFFF] to-[#E0E0E0] flex items-center justify-center border-2 border-[#FFFFFF] flex-shrink-0 overflow-hidden">
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-black">{getInitials(name)}</span>
          )}
        </div>
        <div className="inline-block bg-[#9b59b6] px-4 py-2">
          <p className="text-sm font-semibold tracking-wide">MEMBRO ATIVO</p>
        </div>
      </div>

      {/* Middle - Name and Card Number */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <p className="text-lg tracking-wider mb-3 font-medium">{name}</p>
        <p className="text-base sm:text-xl tracking-[0.15em] font-mono whitespace-nowrap">{cardNumber}</p>
      </div>

      {/* Bottom - Stats */}
      <div className="relative z-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm opacity-70 mb-2">ECONOMIA TOTAL</p>
            <p className="text-2xl font-bold text-green-400">R$ {savings.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-70 mb-2">BENEFÍCIOS</p>
            <p className="text-2xl font-bold">+{benefits}</p>
          </div>
        </div>
      </div>
    </div>
  );
}