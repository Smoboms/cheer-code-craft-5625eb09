import { Heart, MapPin, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface FavoritePartner {
  id: number;
  name: string;
  category: string;
  discount: string;
  distance: string;
  rating: number;
  lastVisit?: string;
}

const initialFavorites: FavoritePartner[] = [
  {
    id: 1,
    name: 'Restaurante Sabor da Terra',
    category: 'Alimentação',
    discount: '15% OFF',
    distance: '0.8 km',
    rating: 4.8,
    lastVisit: '3 dias atrás'
  },
  {
    id: 3,
    name: 'Academia Fitness Pro',
    category: 'Bem-estar',
    discount: '20% OFF',
    distance: '2.0 km',
    rating: 4.9,
    lastVisit: '1 semana atrás'
  },
  {
    id: 7,
    name: 'Clínica Dental Sorrir',
    category: 'Saúde',
    discount: '25% OFF',
    distance: '1.8 km',
    rating: 4.9,
    lastVisit: '2 semanas atrás'
  }
];

export function FavoritesList() {
  const [favorites, setFavorites] = useState(initialFavorites);

  const removeFavorite = (id: number) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Heart className="text-gray-300" size={40} />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Nenhum favorito ainda</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Adicione parceiros aos seus favoritos para acessá-los rapidamente
        </p>
        <button className="mt-4 bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Explorar parceiros
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Seus favoritos</h3>
          <p className="text-sm text-gray-500 mt-1">
            {favorites.length} {favorites.length === 1 ? 'parceiro' : 'parceiros'} salvos
          </p>
        </div>
        <Heart className="text-red-500 fill-red-500" size={24} />
      </div>

      {/* Favorites Grid */}
      <div className="space-y-3">
        {favorites.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex gap-3">
              {/* Partner Image */}
              <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-black rounded-lg flex-shrink-0 flex items-center justify-center">
                <Store className="text-white" size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{partner.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{partner.category}</p>
                  </div>
                  <button
                    onClick={() => removeFavorite(partner.id)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover dos favoritos"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{partner.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>{partner.rating}</span>
                  </div>
                </div>

                {partner.lastVisit && (
                  <p className="text-xs text-gray-400 mt-2">
                    Última visita: {partner.lastVisit}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                    {partner.discount}
                  </span>
                  <button className="flex-1 bg-black text-white text-xs py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Usar benefício
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button className="bg-white border border-gray-200 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
          Ver todos
        </button>
        <button className="bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">
          Mais parceiros
        </button>
      </div>
    </div>
  );
}

interface StoreProps {
  className?: string;
  size?: number;
}

function Store({ className, size = 24 }: StoreProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}
