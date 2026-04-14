import { ArrowLeft } from 'lucide-react';
import { PurchaseHistory } from '@/components/app/components/PurchaseHistory';

interface PurchaseHistoryPageProps {
  onBack: () => void;
}

export function PurchaseHistoryPage({ onBack }: PurchaseHistoryPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto min-h-screen bg-black">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-black via-black to-gray-950 text-white p-4 shadow-lg z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Histórico de Compras</h1>
              <p className="text-sm opacity-90">Suas economias registradas</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <PurchaseHistory />
        </div>
      </div>
    </div>
  );
}