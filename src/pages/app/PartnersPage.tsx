import { ArrowLeft } from 'lucide-react';
import { PartnersList } from '@/components/app/components/PartnersList';
import { PartnerDetailsModal } from '@/components/app/components/PartnerDetailsModal';
import { Partner } from '@/components/app/data/partnersData';
import { useState } from 'react';

interface PartnersPageProps {
  onBack: () => void;
}

export function PartnersPage({ onBack }: PartnersPageProps) {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto min-h-screen bg-black">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-black via-black to-gray-950 text-white p-4 shadow-lg z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Parceiros</h1>
              <p className="text-sm opacity-90">Descubra descontos próximos</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <PartnersList onPartnerClick={(partner) => setSelectedPartner(partner)} />
        </div>

        {/* Modal */}
        {selectedPartner && (
          <PartnerDetailsModal
            partner={selectedPartner}
            onClose={() => setSelectedPartner(null)}
          />
        )}
      </div>
    </div>
  );
}