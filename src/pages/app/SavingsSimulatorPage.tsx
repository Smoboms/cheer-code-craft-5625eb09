import { ArrowLeft, Calculator, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface SavingsSimulatorPageProps {
  onBack: () => void;
}

const categories = [
  { id: 'restaurante', name: 'Restaurante', discount: 15 },
  { id: 'saude', name: 'Saúde', discount: 20 },
  { id: 'bem-estar', name: 'Bem-estar', discount: 18 },
  { id: 'alimentacao', name: 'Alimentação', discount: 10 },
  { id: 'educacao', name: 'Educação', discount: 12 },
  { id: 'servicos', name: 'Serviços', discount: 10 },
  { id: 'moda', name: 'Moda', discount: 15 },
  { id: 'combustivel', name: 'Combustível', discount: 5 }
];

export function SavingsSimulatorPage({ onBack }: SavingsSimulatorPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [purchaseValue, setPurchaseValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [savings, setSavings] = useState(0);

  const handleSimulate = () => {
    const value = parseFloat(purchaseValue.replace(',', '.'));
    if (!isNaN(value) && value > 0) {
      const calculatedSavings = (value * selectedCategory.discount) / 100;
      setSavings(calculatedSavings);
      setShowResult(true);
    }
  };

  const handleClear = () => {
    setPurchaseValue('');
    setShowResult(false);
    setSavings(0);
  };

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
              <h1 className="text-xl font-bold">Simulador de Economia</h1>
              <p className="text-sm opacity-90">Descubra quanto você pode economizar</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Info Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Calculator size={32} />
              <h2 className="text-xl font-bold">Como funciona?</h2>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span>📌</span>
                <span>Não precisa comprar agora</span>
              </li>
              <li className="flex gap-2">
                <span>📌</span>
                <span>Simulação educativa e gratuita</span>
              </li>
              <li className="flex gap-2">
                <span>📌</span>
                <span>Veja sua economia em tempo real</span>
              </li>
            </ul>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">
              1. Escolha a categoria
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowResult(false);
                  }}
                  className={`p-4 border-2 transition-all ${
                    selectedCategory.id === category.id
                      ? 'bg-white text-black border-white'
                      : 'bg-gray-900 text-white border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <p className="font-semibold mb-1">{category.name}</p>
                  <p className={`text-xs ${
                    selectedCategory.id === category.id ? 'text-green-600' : 'text-green-400'
                  }`}>
                    {category.discount}% OFF
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Value Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">
              2. Digite o valor da compra
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                R$
              </span>
              <input
                type="text"
                value={purchaseValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9,]/g, '');
                  setPurchaseValue(value);
                  setShowResult(false);
                }}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-gray-900 text-white border-2 border-gray-700 focus:border-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Simulate Button */}
          <button
            onClick={handleSimulate}
            disabled={!purchaseValue || parseFloat(purchaseValue.replace(',', '.')) <= 0}
            className="w-full bg-white text-black py-4 font-bold hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors mb-4 flex items-center justify-center gap-2"
          >
            <Calculator size={20} />
            🧮 Simular Economia
          </button>

          {/* Result */}
          {showResult && (
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={24} />
                  <h3 className="text-lg font-bold">Resultado</h3>
                </div>
                <button
                  onClick={handleClear}
                  className="text-sm underline hover:no-underline"
                >
                  Nova simulação
                </button>
              </div>

              <div className="bg-white/20 backdrop-blur p-4 mb-4">
                <p className="text-sm opacity-90 mb-2">Você economizaria hoje</p>
                <p className="text-4xl font-bold">R$ {savings.toFixed(2)}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-3 bg-white/10 backdrop-blur">
                  <span>Valor da compra:</span>
                  <span className="font-bold">R$ {parseFloat(purchaseValue.replace(',', '.')).toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/10 backdrop-blur">
                  <span>Desconto ({selectedCategory.discount}%):</span>
                  <span className="font-bold">- R$ {savings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/20 backdrop-blur">
                  <span className="font-bold">Você pagaria:</span>
                  <span className="font-bold">
                    R$ {(parseFloat(purchaseValue.replace(',', '.')) - savings).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-400 text-gray-900">
                <p className="font-bold mb-2">💡 Dica</p>
                <p className="text-sm">
                  Com o R-CARD você tem acesso a este desconto em mais de 10 parceiros da categoria{' '}
                  <strong>{selectedCategory.name}</strong>!
                </p>
              </div>
            </div>
          )}

          {/* Educational Info */}
          {!showResult && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-2">📚 Educação Financeira</h4>
              <p className="text-sm text-gray-700">
                Use o simulador para planejar suas compras e entender o poder da economia.
                Pequenos descontos somados ao longo do tempo podem resultar em grandes economias!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}