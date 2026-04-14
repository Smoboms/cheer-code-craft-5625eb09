import { MapPin, Star, Tag, Search, Filter, Heart } from 'lucide-react';
import { useState } from 'react';
import { PartnerDetailsModal } from '@/components/app/PartnerDetailsModal';
import { mockPartners as initialPartners, Partner } from '@/components/app/data/partnersData';

const categories = ['Todos', 'Alimentação', 'Saúde', 'Bem-estar', 'Educação', 'Combustível', 'Serviços'];

interface PartnersListProps {
  onPartnerClick?: (partner: Partner) => void;
}

export function PartnersList({ onPartnerClick }: PartnersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [partners, setPartners] = useState(initialPartners);

  const toggleFavorite = (partnerId: number) => {
    setPartners(partners.map(p => 
      p.id === partnerId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || partner.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar parceiros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Category Filter - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Partners List */}
      <div className="space-y-3">
        {filteredPartners.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto mb-3 text-gray-300" size={48} />
            <p className="text-gray-500">Nenhum parceiro encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente buscar com outros termos</p>
          </div>
        ) : (
          filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Banner Image */}
              {partner.bannerImage && (
                <div className="w-full h-32 bg-gray-200">
                  <img 
                    src={partner.bannerImage} 
                    alt={`${partner.name} banner`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex gap-3">
                  {/* Profile Image with rounded borders */}
                  <div className="w-16 h-16 flex-shrink-0">
                    {partner.profileImage ? (
                      <img 
                        src={partner.profileImage} 
                        alt={`${partner.name} profile`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-lg flex items-center justify-center">
                        <Store className="text-white" size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{partner.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{partner.category}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(partner.id)}
                        className="ml-2 flex-shrink-0"
                      >
                        <Heart
                          size={20}
                          className={partner.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{partner.distance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span>{partner.rating}</span>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                        {partner.discount}
                      </span>
                    </div>

                    <button
                      onClick={() => onPartnerClick?.(partner)}
                      className="w-full mt-3 bg-black text-white text-sm py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
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