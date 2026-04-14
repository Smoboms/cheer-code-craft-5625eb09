import { ArrowLeft } from 'lucide-react';
import { BecomePartner } from '@/components/app/BecomePartner';

interface BecomePartnerPageProps {
  onBack: () => void;
}

export function BecomePartnerPage({ onBack }: BecomePartnerPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto min-h-screen bg-black">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black text-white p-4 shadow-lg z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Seja Parceiro</h1>
              <p className="text-sm opacity-90">Cadastre seu negócio</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <BecomePartner />
        </div>
      </div>
    </div>
  );
}