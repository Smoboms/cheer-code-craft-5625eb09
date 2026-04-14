import { useState } from 'react';
import { Search, ArrowRight, UserPlus, MapPin, Instagram, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { talents } from '@/data/talentsData';
import { talentCategories } from '@/data/mockData';

export function TalentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredTalents = talents.filter(talent => {
    const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || 
                           talent.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="animate-fadeUp">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">i. Talents</h2>
            <p className="text-gray-400 text-sm">Talentos selecionados e curados</p>
          </div>
          <button className="bg-[#FFFFFF] hover:bg-[#E0E0E0] text-black font-bold px-4 py-2 text-sm flex items-center gap-2 transition-colors">
            <UserPlus size={16} />
            Solicitar
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por habilidade ou área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-white pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#FFFFFF] transition-colors"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {talentCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-[#FFFFFF] text-black'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Talents List */}
      <div className="space-y-3">
        {filteredTalents.map((talent) => {
          const isExpanded = expandedId === talent.id;
          
          return (
            <div
              key={talent.id}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
            >
              {/* Main Card */}
              <div
                onClick={() => toggleExpand(talent.id)}
                className="p-4 flex items-center gap-4 cursor-pointer group"
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0">
                  {talent.avatar ? (
                    <img src={talent.avatar} alt={talent.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white">{getInitials(talent.name)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm mb-1">{talent.name}</h3>
                  <p className="text-[#FFFFFF] text-xs mb-2">{talent.area}</p>
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">{talent.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {talent.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-800 text-gray-300 text-xs px-2 py-1 border border-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 bg-gray-800 group-hover:bg-[#FFFFFF] flex items-center justify-center flex-shrink-0 transition-colors">
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-white group-hover:text-black" />
                  ) : (
                    <ChevronDown size={18} className="text-white group-hover:text-black" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-800 animate-fadeUp">
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-3">
                      {talent.age && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Idade</p>
                          <p className="text-sm text-gray-300">{talent.age} anos</p>
                        </div>
                      )}
                      {talent.availability && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Disponibilidade</p>
                          <p className="text-sm text-gray-300">{talent.availability}</p>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 gap-2">
                      {talent.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-blue-400" />
                          <span className="text-gray-300">{talent.location}</span>
                        </div>
                      )}

                      {talent.instagram && (
                        <div className="flex items-center gap-2 text-sm">
                          <Instagram size={14} className="text-pink-400" />
                          <span className="text-gray-300">@{talent.instagram.replace('@', '')}</span>
                        </div>
                      )}
                    </div>

                    {/* Professional Info */}
                    {talent.desiredArea && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Área Desejada</p>
                        <p className="text-sm text-gray-300">{talent.desiredArea}</p>
                      </div>
                    )}

                    {talent.experience && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Experiência Profissional</p>
                        <p className="text-sm text-gray-300">{talent.experience}</p>
                      </div>
                    )}

                    {/* Motivation */}
                    {talent.motivation && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Motivação e Objetivos</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{talent.motivation}</p>
                      </div>
                    )}

                    {/* Work History */}
                    {talent.leftJobEarly && talent.leftJobReason && (
                      <div className="bg-gray-800 border border-gray-700 p-3">
                        <p className="text-xs text-gray-500 mb-1">Histórico</p>
                        <p className="text-sm text-gray-300">Saiu de emprego antes de 3 meses: {talent.leftJobReason}</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className={`w-2 h-2 rounded-full ${talent.currentlyWorking ? 'bg-blue-400' : 'bg-green-400'}`} />
                      <span className="text-xs text-gray-400">
                        {talent.currentlyWorking ? 'Atualmente trabalhando' : 'Disponível para novas oportunidades'}
                      </span>
                    </div>

                    {/* All Tags */}
                    <div className="flex flex-wrap gap-1 pt-2">
                      {talent.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-800 text-gray-300 text-xs px-2 py-1 border border-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Contact Button */}
                    <button
                      onClick={() => {
                        let message = 'Olá! Estou entrando em contato com a equipe de RH OFICIAL DA RARQUES.\n\n';
                        message += `*INFORMAÇÕES DO CANDIDATO:*\n`;
                        message += `📋 Nome: ${talent.name}\n`;
                        message += `💼 Área: ${talent.area}\n`;
                        if (talent.age) message += `👤 Idade: ${talent.age} anos\n`;
                        if (talent.availability) message += `⏰ Disponibilidade: ${talent.availability}\n`;
                        if (talent.location) message += `📍 Localização: ${talent.location}\n`;
                        if (talent.desiredArea) message += `🎯 Área Desejada: ${talent.desiredArea}\n`;
                        if (talent.experience) message += `💡 Experiência: ${talent.experience}\n`;
                        if (talent.instagram) message += `📱 Instagram: @${talent.instagram.replace('@', '')}\n`;
                        if (talent.currentlyWorking !== undefined) {
                          message += `🟢 Status: ${talent.currentlyWorking ? 'Atualmente trabalhando' : 'Disponível para novas oportunidades'}\n`;
                        }
                        if (talent.tags && talent.tags.length > 0) {
                          message += `🏷️ Habilidades: ${talent.tags.join(', ')}\n`;
                        }
                        message += `\nDescrição: ${talent.description}`;
                        
                        const encodedMessage = encodeURIComponent(message);
                        window.open(`https://wa.me/5562992803369?text=${encodedMessage}`, '_blank');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-sm flex items-center justify-center gap-2 transition-colors mt-3"
                    >
                      <Phone size={16} />
                      Entrar em contato
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTalents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">Nenhum talento encontrado</p>
          <p className="text-gray-500 text-sm">Tente ajustar os filtros ou a busca</p>
        </div>
      )}
    </div>
  );
}