import { useState } from 'react';
import { X, Star, Check } from 'lucide-react';
import { Partner, Benefit } from '@/data/partnersData';

interface UseBenefitModalProps {
  partner: Partner;
  benefit: Benefit;
  onClose: () => void;
  onComplete: (ratings: { alimentacao: number; recepcao: number; atendimento: number; ambiente: number }, comment: string) => void;
}

export function UseBenefitModal({ partner, benefit, onClose, onComplete }: UseBenefitModalProps) {
  const [step, setStep] = useState<'confirm' | 'using' | 'review'>('confirm');
  const [ratings, setRatings] = useState({
    alimentacao: 0,
    recepcao: 0,
    atendimento: 0,
    ambiente: 0
  });
  const [hoverRatings, setHoverRatings] = useState({
    alimentacao: 0,
    recepcao: 0,
    atendimento: 0,
    ambiente: 0
  });
  const [comment, setComment] = useState('');

  const handleUseBenefit = () => {
    setStep('using');
    // Simula o uso do benefício
    setTimeout(() => {
      setStep('review');
    }, 2000);
  };

  const handleSubmitReview = () => {
    if (ratings.alimentacao === 0 || ratings.recepcao === 0 || ratings.atendimento === 0 || ratings.ambiente === 0) {
      alert('Por favor, selecione uma avaliação para todos os campos');
      return;
    }
    onComplete(ratings, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-black via-black to-gray-950 text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {step === 'confirm' && 'Usar Benefício'}
            {step === 'using' && 'Usando Benefício'}
            {step === 'review' && 'Avalie sua Experiência'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
            disabled={step === 'using'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              {/* Partner Info */}
              <div className="p-4 bg-gradient-to-br from-black via-black to-gray-950 text-white">
                <h3 className="font-bold text-lg mb-1">{partner.name}</h3>
                <p className="text-sm opacity-80">{partner.category}</p>
              </div>

              {/* Benefit Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Benefício Selecionado:</h4>
                <div className="p-4 bg-green-50 border-2 border-green-500">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900 mb-1">{benefit.title}</h5>
                      <p className="text-sm text-gray-700">{benefit.description}</p>
                    </div>
                    <span className="bg-green-500 text-white text-sm px-3 py-1 font-bold ml-3 whitespace-nowrap">
                      {benefit.discount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-yellow-50 border border-yellow-200">
                <h4 className="font-bold text-gray-900 mb-3">Instruções:</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Apresente esta tela no estabelecimento antes do pagamento</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Aguarde a confirmação do desconto pelo atendente</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Após usar, você será solicitado a avaliar o estabelecimento</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={handleUseBenefit}
                className="w-full bg-black text-white py-4 font-bold hover:bg-gray-800 transition-colors"
              >
                CONFIRMAR USO DO BENEFÍCIO
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-white text-black border-2 border-black py-4 font-bold hover:bg-gray-50 transition-colors"
              >
                CANCELAR
              </button>
            </div>
          )}

          {/* Step 2: Using (Loading) */}
          {step === 'using' && (
            <div className="py-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-500 flex items-center justify-center animate-pulse">
                  <Check className="text-white" size={48} />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Benefício Ativado!</h3>
                <p className="text-gray-600">Apresente esta tela no estabelecimento</p>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-black flex items-center justify-center">
                  <div className="w-44 h-44 bg-white flex items-center justify-center">
                    <p className="text-xs text-center text-gray-500 px-4">
                      Código de Validação<br/>
                      <span className="font-mono text-lg font-bold text-black">
                        #{partner.id}{benefit.id}{Date.now().toString().slice(-4)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Desconto de {benefit.discount} aplicado
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Como foi sua experiência em {partner.name}?
                </h3>
                <p className="text-sm text-gray-600">
                  Sua avaliação ajuda outros associados
                </p>
              </div>

              {/* Rating Stars */}
              <div>
                <label className="block font-bold text-gray-900 mb-3">Avaliação de Alimentação *</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatings({ ...ratings, alimentacao: star })}
                      onMouseEnter={() => setHoverRatings({ ...hoverRatings, alimentacao: star })}
                      onMouseLeave={() => setHoverRatings({ ...hoverRatings, alimentacao: 0 })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={40}
                        className={`${
                          star <= (hoverRatings.alimentacao || ratings.alimentacao)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {ratings.alimentacao > 0 && (
                  <p className="text-center mt-2 text-sm font-medium text-gray-700">
                    {ratings.alimentacao === 1 && 'Muito Ruim'}
                    {ratings.alimentacao === 2 && 'Ruim'}
                    {ratings.alimentacao === 3 && 'Regular'}
                    {ratings.alimentacao === 4 && 'Bom'}
                    {ratings.alimentacao === 5 && 'Excelente'}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-900 mb-3">Avaliação de Recepção *</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatings({ ...ratings, recepcao: star })}
                      onMouseEnter={() => setHoverRatings({ ...hoverRatings, recepcao: star })}
                      onMouseLeave={() => setHoverRatings({ ...hoverRatings, recepcao: 0 })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={40}
                        className={`${
                          star <= (hoverRatings.recepcao || ratings.recepcao)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {ratings.recepcao > 0 && (
                  <p className="text-center mt-2 text-sm font-medium text-gray-700">
                    {ratings.recepcao === 1 && 'Muito Ruim'}
                    {ratings.recepcao === 2 && 'Ruim'}
                    {ratings.recepcao === 3 && 'Regular'}
                    {ratings.recepcao === 4 && 'Bom'}
                    {ratings.recepcao === 5 && 'Excelente'}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-900 mb-3">Avaliação de Atendimento *</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatings({ ...ratings, atendimento: star })}
                      onMouseEnter={() => setHoverRatings({ ...hoverRatings, atendimento: star })}
                      onMouseLeave={() => setHoverRatings({ ...hoverRatings, atendimento: 0 })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={40}
                        className={`${
                          star <= (hoverRatings.atendimento || ratings.atendimento)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {ratings.atendimento > 0 && (
                  <p className="text-center mt-2 text-sm font-medium text-gray-700">
                    {ratings.atendimento === 1 && 'Muito Ruim'}
                    {ratings.atendimento === 2 && 'Ruim'}
                    {ratings.atendimento === 3 && 'Regular'}
                    {ratings.atendimento === 4 && 'Bom'}
                    {ratings.atendimento === 5 && 'Excelente'}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-900 mb-3">Avaliação de Ambiente *</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatings({ ...ratings, ambiente: star })}
                      onMouseEnter={() => setHoverRatings({ ...hoverRatings, ambiente: star })}
                      onMouseLeave={() => setHoverRatings({ ...hoverRatings, ambiente: 0 })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={40}
                        className={`${
                          star <= (hoverRatings.ambiente || ratings.ambiente)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {ratings.ambiente > 0 && (
                  <p className="text-center mt-2 text-sm font-medium text-gray-700">
                    {ratings.ambiente === 1 && 'Muito Ruim'}
                    {ratings.ambiente === 2 && 'Ruim'}
                    {ratings.ambiente === 3 && 'Regular'}
                    {ratings.ambiente === 4 && 'Bom'}
                    {ratings.ambiente === 5 && 'Excelente'}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block font-bold text-gray-900 mb-2">
                  Comentário (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte-nos mais sobre sua experiência..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitReview}
                className="w-full bg-green-500 text-white py-4 font-bold hover:bg-green-600 transition-colors"
              >
                ENVIAR AVALIAÇÃO
              </button>

              <p className="text-xs text-center text-gray-500">
                * A avaliação é obrigatória para completar o uso do benefício
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}