import { Users, TrendingUp, Gift, Share2, Award, Calendar } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '@/components/app/utils/clipboard';

interface Associate {
  id: number;
  name: string;
  joinDate: string;
  savings: number;
  purchases: number;
  status: 'active' | 'inactive';
}

const mockAssociates: Associate[] = [
  {
    id: 1,
    name: 'Ana Silva',
    joinDate: 'Dez 2025',
    savings: 45.50,
    purchases: 12,
    status: 'active'
  },
  {
    id: 2,
    name: 'Carlos Santos',
    joinDate: 'Nov 2025',
    savings: 32.00,
    purchases: 8,
    status: 'active'
  },
  {
    id: 3,
    name: 'Maria Oliveira',
    joinDate: 'Out 2025',
    savings: 28.75,
    purchases: 6,
    status: 'active'
  },
  {
    id: 4,
    name: 'João Pedro',
    joinDate: 'Set 2025',
    savings: 52.30,
    purchases: 15,
    status: 'active'
  },
  {
    id: 5,
    name: 'Fernanda Costa',
    joinDate: 'Ago 2025',
    savings: 19.90,
    purchases: 4,
    status: 'inactive'
  }
];

export function AssociatesList() {
  const [showReferralCode, setShowReferralCode] = useState(false);
  const referralCode = 'MARQUES2026';

  const totalSavings = mockAssociates.reduce((sum, a) => sum + a.savings, 0);
  const activeAssociates = mockAssociates.filter(a => a.status === 'active').length;

  const shareReferralCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Marques Association',
        text: `Junte-se à Marques Association! Use meu código ${referralCode} e ganhe benefícios exclusivos.`,
        url: window.location.href
      });
    } else {
      const success = copyToClipboard(referralCode);
      if (success) {
        alert('Código copiado!');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={24} />
            <h3 className="font-semibold">Sua Rede</h3>
          </div>
          <Award className="text-yellow-400" size={24} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-bold mb-1">{mockAssociates.length}</p>
            <p className="text-sm opacity-80">Total de indicados</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">{activeAssociates}</p>
            <p className="text-sm opacity-80">Associados ativos</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} />
              <span className="text-sm">Economia gerada</span>
            </div>
            <span className="text-lg font-bold text-green-400">R$ {totalSavings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Gift className="text-white" size={20} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Seu código de indicação</h4>
            <p className="text-xs text-gray-500">Compartilhe e ganhe benefícios</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <p className="text-xs text-gray-500 mb-1">Código</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold tracking-wider">{referralCode}</p>
            <button
              onClick={() => {
                const success = copyToClipboard(referralCode);
                if (success) {
                  alert('Código copiado!');
                }
              }}
              className="text-sm text-gray-600 hover:text-black"
            >
              Copiar
            </button>
          </div>
        </div>

        <button
          onClick={shareReferralCode}
          className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          Compartilhar código
        </button>
      </div>

      {/* Benefits Info */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
        <h4 className="font-medium text-gray-900 mb-2">Ganhe por indicação</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span><strong className="text-green-700">R$ 5</strong> de bônus por novo associado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span><strong className="text-green-700">10%</strong> da economia dos seus indicados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Benefícios exclusivos ao atingir <strong className="text-green-700">10 indicados</strong></span>
          </li>
        </ul>
      </div>

      {/* Associates List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Seus indicados</h3>
          <span className="text-xs text-gray-500">{mockAssociates.length} pessoas</span>
        </div>
        
        <div className="space-y-3">
          {mockAssociates.map((associate) => (
            <div
              key={associate.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-semibold">
                  {associate.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{associate.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      associate.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {associate.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{associate.joinDate}</span>
                    </div>
                    <span>•</span>
                    <span>{associate.purchases} compras</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">R$ {associate.savings.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">economizou</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress to Next Reward */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Progresso do bônus</h4>
          <span className="text-sm text-gray-600">{mockAssociates.length}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-black h-2 rounded-full transition-all"
            style={{ width: `${(mockAssociates.length / 10) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          Faltam {10 - mockAssociates.length} indicações para desbloquear benefícios exclusivos
        </p>
      </div>
    </div>
  );
}
