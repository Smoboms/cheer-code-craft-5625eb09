import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Calculator, CheckCircle, DollarSign } from 'lucide-react';
import { mockPartners } from '@/data/partnersData';

interface RegisterPurchasePageProps {
  onBack: () => void;
  userEmail: string;
  onPurchaseComplete: (discount: number) => void;
}

interface Benefit {
  id: number;
  title: string;
  description: string;
  discount: string;
}

interface Partner {
  id: number;
  name: string;
  category: string;
  discount: string;
  benefits: Benefit[];
  image: string;
}

export function RegisterPurchasePage({ onBack, userEmail, onPurchaseComplete }: RegisterPurchasePageProps) {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filteredPartners = mockPartners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para extrair porcentagem de desconto
  const extractDiscountPercentage = (discountStr: string): number => {
    const match = discountStr.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  // Calcular valores
  const calculateValues = () => {
    if (!purchaseAmount || !selectedBenefit) {
      return { originalValue: 0, discountValue: 0, finalValue: 0, discountPercentage: 0 };
    }

    const original = parseFloat(purchaseAmount);
    const percentage = extractDiscountPercentage(selectedBenefit.discount);
    const discount = (original * percentage) / 100;
    const final = original - discount;

    return {
      originalValue: original,
      discountValue: discount,
      finalValue: final,
      discountPercentage: percentage,
    };
  };

  const values = calculateValues();

  const handleConfirmPurchase = () => {
    if (!selectedPartner || !selectedBenefit || !purchaseAmount) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    // Salvar compra no histórico
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    const newPurchase = {
      id: Date.now().toString(),
      partnerName: selectedPartner.name,
      partnerCategory: selectedPartner.category,
      benefit: selectedBenefit.title,
      originalAmount: values.originalValue,
      discountAmount: values.discountValue,
      finalAmount: values.finalValue,
      date: new Date().toISOString(),
      userEmail,
    };
    purchases.push(newPurchase);
    localStorage.setItem('purchases', JSON.stringify(purchases));

    // Atualizar economia total do usuário
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === userEmail);
    if (userIndex !== -1) {
      users[userIndex].totalSavings = (users[userIndex].totalSavings || 0) + values.discountValue;
      localStorage.setItem('users', JSON.stringify(users));
    }

    // Notificar componente pai sobre a compra
    onPurchaseComplete(values.discountValue);

    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onBack();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20">
      {/* Header */}
      <div className="bg-black dark:bg-white p-4 flex items-center gap-4">
        <button onClick={onBack} className="text-white dark:text-black">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white dark:text-black">Registrar Compra</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Step 1: Selecionar Parceiro */}
        {!selectedPartner ? (
          <div>
            <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Selecione o Estabelecimento</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar estabelecimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
              />
            </div>

            {/* Partners List */}
            <div className="space-y-3">
              {filteredPartners.map((partner) => (
                <button
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-left hover:border-black dark:hover:border-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-black dark:text-white">{partner.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{partner.category}</p>
                    </div>
                    <div className="text-green-600 font-bold">{partner.discount}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : !selectedBenefit ? (
          /* Step 2: Selecionar Benefício */
          <div>
            <button
              onClick={() => setSelectedPartner(null)}
              className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            <div className="mb-6 p-4 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="font-bold text-black dark:text-white">{selectedPartner.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPartner.category}</p>
            </div>

            <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Selecione o Benefício</h2>
            <div className="space-y-3">
              {selectedPartner.benefits.map((benefit) => (
                <button
                  key={benefit.id}
                  onClick={() => setSelectedBenefit(benefit)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-left hover:border-black dark:hover:border-white transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-black dark:text-white">{benefit.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{benefit.description}</p>
                    </div>
                    <div className="ml-4 text-green-600 font-bold whitespace-nowrap">{benefit.discount}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Step 3: Inserir Valor e Confirmar */
          <div>
            <button
              onClick={() => setSelectedBenefit(null)}
              className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            <div className="mb-6 p-4 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="font-bold text-black dark:text-white">{selectedPartner.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBenefit.title}</p>
              <p className="text-green-600 font-bold mt-1">{selectedBenefit.discount}</p>
            </div>

            <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Valor da Compra</h2>
            
            {/* Input de Valor */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                className="w-full px-4 py-4 text-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
              />
            </div>

            {/* Calculadora de Valores */}
            {purchaseAmount && values.originalValue > 0 && (
              <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-bold text-black dark:text-white">Cálculo do Desconto</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Valor Original:</span>
                    <span className="font-bold text-black dark:text-white">R$ {values.originalValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Desconto ({values.discountPercentage}%):</span>
                    <span className="font-bold text-green-600">- R$ {values.discountValue.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-300 dark:bg-gray-700"></div>
                  <div className="flex justify-between">
                    <span className="font-bold text-black dark:text-white">Valor a Pagar:</span>
                    <span className="font-bold text-xl text-black dark:text-white">R$ {values.finalValue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-center">
                    <span className="text-gray-600 dark:text-gray-400">Economia acumulada: </span>
                    <span className="font-bold text-green-600">R$ {values.discountValue.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Botão Confirmar */}
            <button
              onClick={handleConfirmPurchase}
              disabled={!purchaseAmount || values.originalValue <= 0}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Confirmar Compra
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-8 max-w-sm w-full text-center border border-gray-300 dark:border-gray-700">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Compra Registrada!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você economizou <span className="font-bold text-green-600">R$ {values.discountValue.toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              O valor foi adicionado à sua economia total
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
