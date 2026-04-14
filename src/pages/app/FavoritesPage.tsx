import { ArrowLeft } from 'lucide-react';
import { FavoritesList } from '@/components/app/FavoritesList';

interface FavoritesPageProps {
  onBack: () => void;
}

export function FavoritesPage({ onBack }: FavoritesPageProps) {
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
              <h1 className="text-xl font-bold">Favoritos</h1>
              <p className="text-sm opacity-90">Seus parceiros preferidos</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <FavoritesList />
        </div>
      </div>
    </div>
  );
}