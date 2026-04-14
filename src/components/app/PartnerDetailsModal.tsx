import { X, MapPin, Star, Phone, Clock, Tag, Gift } from 'lucide-react';
import { Partner, Benefit } from '@/data/partnersData';
import { useState, useEffect } from 'react';
import { UseBenefitModal } from '@/components/app/UseBenefitModal';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface PartnerDetailsModalProps {
  partner: Partner;
  onClose: () => void;
}

// Função para calcular e atualizar as avaliações do parceiro
function updatePartnerRatings(partnerId: number) {
  const reviews = JSON.parse(localStorage.getItem('partner_reviews') || '[]');
  const partnerReviews = reviews.filter((r: any) => r.partnerId === partnerId);
  
  if (partnerReviews.length === 0) {
    return {
      overall: 0,
      alimentacao: 0,
      recepcao: 0,
      atendimento: 0,
      ambiente: 0,
      totalReviews: 0
    };
  }
  
  const totals = partnerReviews.reduce((acc: any, review: any) => {
    acc.alimentacao += review.ratings?.alimentacao || 0;
    acc.recepcao += review.ratings?.recepcao || 0;
    acc.atendimento += review.ratings?.atendimento || 0;
    acc.ambiente += review.ratings?.ambiente || 0;
    return acc;
  }, { alimentacao: 0, recepcao: 0, atendimento: 0, ambiente: 0 });
  
  const count = partnerReviews.length;
  const averages = {
    alimentacao: totals.alimentacao / count,
    recepcao: totals.recepcao / count,
    atendimento: totals.atendimento / count,
    ambiente: totals.ambiente / count
  };
  
  const overall = (averages.alimentacao + averages.recepcao + averages.atendimento + averages.ambiente) / 4;
  
  return {
    overall: parseFloat(overall.toFixed(1)),
    alimentacao: parseFloat(averages.alimentacao.toFixed(1)),
    recepcao: parseFloat(averages.recepcao.toFixed(1)),
    atendimento: parseFloat(averages.atendimento.toFixed(1)),
    ambiente: parseFloat(averages.ambiente.toFixed(1)),
    totalReviews: count
  };
}

export function PartnerDetailsModal({ partner, onClose }: PartnerDetailsModalProps) {
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [partnerRatings, setPartnerRatings] = useState(updatePartnerRatings(partner.id));

  useEffect(() => {
    setPartnerRatings(updatePartnerRatings(partner.id));
  }, [partner.id]);

  const handleBenefitComplete = (ratings: { alimentacao: number; recepcao: number; atendimento: number; ambiente: number }, comment: string) => {
    // Salvar avaliação no localStorage
    const reviews = JSON.parse(localStorage.getItem('partner_reviews') || '[]');
    reviews.push({
      partnerId: partner.id,
      partnerName: partner.name,
      benefitId: selectedBenefit?.id,
      benefitTitle: selectedBenefit?.title,
      ratings: ratings,
      comment,
      date: new Date().toISOString(),
    });
    localStorage.setItem('partner_reviews', JSON.stringify(reviews));
    
    // Atualizar ratings
    setPartnerRatings(updatePartnerRatings(partner.id));
    
    // Fechar modal
    setSelectedBenefit(null);
    onClose();
    
    // Mostrar mensagem de sucesso
    alert('Obrigado pela sua avaliação! Benefício registrado com sucesso.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-black via-black to-gray-950 text-white p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">Detalhes do Parceiro</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Banner e Foto de Perfil */}
        <div className="relative">
          {/* Banner */}
          <div className="h-48 w-full bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
            {partner.bannerImage ? (
              <ImageWithFallback 
                src={partner.bannerImage} 
                alt={`${partner.name} banner`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="text-white/30" size={64} />
              </div>
            )}
          </div>
          
          {/* Foto de Perfil */}
          <div className="absolute -bottom-16 left-4">
            <div className="w-32 h-32 border-4 border-white bg-gray-900 overflow-hidden">
              {partner.profileImage ? (
                <ImageWithFallback 
                  src={partner.profileImage} 
                  alt={`${partner.name} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
                  <Store className="text-white" size={48} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-20">
          {/* Partner Info */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{partner.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{partner.category}</p>
            
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-500" />
                <span className="text-gray-700">{partner.distance}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-gray-700 font-bold">{partnerRatings.overall > 0 ? partnerRatings.overall : partner.rating}</span>
                {partnerRatings.totalReviews > 0 && (
                  <span className="text-gray-500">({partnerRatings.totalReviews} avaliações)</span>
                )}
              </div>
            </div>

            {/* Ratings detalhados */}
            {partnerRatings.totalReviews > 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Avaliações Detalhadas</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Alimentação</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= Math.round(partnerRatings.alimentacao) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{partnerRatings.alimentacao.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Recepção</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= Math.round(partnerRatings.recepcao) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{partnerRatings.recepcao.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Atendimento</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= Math.round(partnerRatings.atendimento) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{partnerRatings.atendimento.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Ambiente</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= Math.round(partnerRatings.ambiente) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{partnerRatings.ambiente.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="mb-6 space-y-3">
            <h4 className="font-bold text-gray-900 mb-3">Informações de Contato</h4>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <Phone className="text-white" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Telefone</p>
                <p className="font-medium text-gray-900">(11) 3456-7890</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <MapPin className="text-white" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Endereço</p>
                <p className="font-medium text-gray-900">Rua Example, 123 - Centro</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <Clock className="text-white" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Horário de Funcionamento</p>
                <p className="font-medium text-gray-900">Seg-Sex: 8h-18h | Sáb: 8h-12h</p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="text-green-600" size={20} />
              <h4 className="font-bold text-gray-900">Benefícios Disponíveis</h4>
            </div>

            <div className="space-y-3">
              {partner.benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">{benefit.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{benefit.description}</p>
                    </div>
                    <div className="ml-3">
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 font-bold whitespace-nowrap">
                        {benefit.discount}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBenefit(benefit)}
                    className="w-full bg-black text-white py-2 text-sm font-bold hover:bg-gray-800 transition-colors"
                  >
                    USAR ESTE BENEFÍCIO
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* How to Use */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Tag size={18} className="text-yellow-600" />
              Como Usar os Benefícios
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Clique em "USAR ESTE BENEFÍCIO" no benefício desejado</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Apresente a tela de confirmação no estabelecimento</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Após usar, avalie obrigatoriamente sua experiência</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div>
            <button 
              onClick={onClose}
              className="w-full bg-white text-black border-2 border-black py-4 font-bold hover:bg-gray-50 transition-colors"
            >
              FECHAR
            </button>
          </div>
        </div>
      </div>

      {/* Use Benefit Modal */}
      {selectedBenefit && (
        <UseBenefitModal
          partner={partner}
          benefit={selectedBenefit}
          onClose={() => setSelectedBenefit(null)}
          onComplete={handleBenefitComplete}
        />
      )}
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