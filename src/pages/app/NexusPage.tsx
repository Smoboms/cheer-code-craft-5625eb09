import { useState } from 'react';
import { Plus, Users, Calendar, ThumbsUp, MessageSquare, Share2, Check } from 'lucide-react';
import { mockPosts } from '@/components/app/data/mockData';

export function NexusPage() {
  const [showPostBox, setShowPostBox] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPostBadge = (type: 'event' | 'opportunity' | 'notice') => {
    switch (type) {
      case 'event':
        return { label: 'Evento', bgClass: 'bg-green-900/30 text-green-400 border-green-700' };
      case 'opportunity':
        return { label: 'Oportunidade', bgClass: 'bg-[#FFFFFF]/20 text-[#FFFFFF] border-[#FFFFFF]/30' };
      case 'notice':
        return { label: 'Aviso', bgClass: 'bg-gray-800 text-gray-300 border-gray-700' };
    }
  };

  return (
    <div className="animate-fadeUp">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">NEXUS</h2>
            <p className="text-gray-400 text-sm">Rede de networking ativa</p>
          </div>
          <button 
            onClick={() => setShowPostBox(!showPostBox)}
            className="bg-[#FFFFFF] hover:bg-[#E0E0E0] text-black font-bold px-4 py-2 text-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Publicar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-900 border border-gray-800 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users size={20} className="text-[#FFFFFF]" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">50+</p>
          <p className="text-gray-400 text-xs">Empresários na rede</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar size={20} className="text-[#FFFFFF]" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">3</p>
          <p className="text-gray-400 text-xs">Eventos este mês</p>
        </div>
      </div>

      {/* Post Box */}
      {showPostBox && (
        <div className="bg-gray-900 border border-gray-800 p-4 mb-6 animate-fadeUp">
          <textarea
            placeholder="Compartilhe algo com a rede..."
            className="w-full bg-black border border-gray-700 text-white p-3 text-sm mb-3 resize-none focus:outline-none focus:border-[#FFFFFF]"
            rows={4}
          />
          <div className="flex gap-2">
            <button className="flex-1 bg-green-900/30 text-green-400 border border-green-700 py-2 text-sm font-semibold hover:bg-green-900/50 transition-colors">
              Evento
            </button>
            <button className="flex-1 bg-[#FFFFFF]/20 text-[#FFFFFF] border border-[#FFFFFF]/30 py-2 text-sm font-semibold hover:bg-[#FFFFFF]/30 transition-colors">
              Oportunidade
            </button>
            <button className="flex-1 bg-gray-800 text-gray-300 border border-gray-700 py-2 text-sm font-semibold hover:bg-gray-700 transition-colors">
              Aviso
            </button>
          </div>
        </div>
      )}

      {/* Create Post CTA */}
      {!showPostBox && (
        <button
          onClick={() => setShowPostBox(true)}
          className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 mb-6 flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#FFFFFF] to-[#E0E0E0] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-black">VC</span>
          </div>
          <p className="text-gray-400 text-sm text-left">Compartilhe algo com a rede...</p>
        </button>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {mockPosts.map((post) => {
          const badge = getPostBadge(post.type);
          
          return (
            <div key={post.id} className="bg-gray-900 border border-gray-800 p-4">
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{getInitials(post.author)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{post.author}</p>
                      <p className="text-gray-400 text-xs truncate">{post.role}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 border whitespace-nowrap ${badge.bgClass}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-300 text-sm mb-4">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                {post.isEvent ? (
                  <button className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-semibold transition-colors">
                    <Check size={16} />
                    Confirmar presença
                  </button>
                ) : (
                  <>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                      <ThumbsUp size={16} />
                      Apoiar
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                      <MessageSquare size={16} />
                      Comentar
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                      <Share2 size={16} />
                      Compartilhar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
