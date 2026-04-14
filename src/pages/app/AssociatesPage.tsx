import { ArrowLeft } from 'lucide-react';
import { AssociatesList } from '@/components/app/components/AssociatesList';

interface AssociatesPageProps {
  onBack: () => void;
}

export function AssociatesPage({ onBack }: AssociatesPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50">
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
              <h1 className="text-xl font-bold">Associados</h1>
              <p className="text-sm opacity-90">Sua rede de indicações</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <AssociatesList />
        </div>
      </div>
    </div>
  );
}
