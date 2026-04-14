import { Calculator, TrendingUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const categories = [
  { id: 'alimentacao', name: 'Alimentação', discount: 8, emoji: '🍽️' },
  { id: 'saude', name: 'Saúde', discount: 10, emoji: '🌿' },
  { id: 'moda', name: 'Moda', discount: 10, emoji: '👔' },
  { id: 'servicos', name: 'Serviços', discount: 10, emoji: '💼' },
  { id: 'hotel', name: 'Hotel', discount: 5, emoji: '🏨' },
  { id: 'casa-decor', name: 'Casa & Decor', discount: 10, emoji: '🏠' },
  { id: 'eventos', name: 'Eventos', discount: 5, emoji: '🎉' },
];

export function SavingsCalculator() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [purchaseValue, setPurchaseValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [savings, setSavings] = useState(0);
  const [showCategories, setShowCategories] = useState(false);

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
    <div className="mb-6">
      {/* Title */}
      <h3 className="text-white font-bold text-lg mb-4">Calculadora de Economia</h3>

      {/* Category Selection */}
      <div className="mb-4">
        {/* Category Header Button */}
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full bg-gray-900 border border-gray-700 hover:border-white text-left p-4 flex items-center justify-between transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCategory.emoji}</span>
            <div>
              <p className="text-white font-semibold text-sm">{selectedCategory.name}</p>
              <p className="text-green-400 text-xs">{selectedCategory.discount}% OFF</p>
            </div>
          </div>
          <ChevronDown
            size={20}
            className={`text-white transition-transform ${showCategories ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Categories Carousel */}
        {showCategories && (
          <div className="overflow-x-auto pb-2 -mx-4 px-4 mb-2 animate-fadeUp">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowResult(false);
                    setShowCategories(false);
                  }}
                  className={`p-3 border transition-all min-w-[140px] ${
                    selectedCategory.id === category.id
                      ? 'bg-white text-black border-white'
                      : 'bg-gray-900 text-white border-gray-700 hover:border-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.emoji}</div>
                  <p className="font-semibold text-sm mb-1">{category.name}</p>
                  <p className={`text-xs ${
                    selectedCategory.id === category.id ? 'text-green-600' : 'text-green-400'
                  }`}>
                    {category.discount}% OFF
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Value Input */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-white mb-3">
          Digite o valor da compra
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
            className="w-full pl-12 pr-4 py-3 text-xl font-bold bg-gray-900 text-white border border-gray-700 focus:border-white focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Simulate Button */}
      <button
        onClick={handleSimulate}
        disabled={!purchaseValue || parseFloat(purchaseValue.replace(',', '.')) <= 0}
        className="w-full bg-white text-black py-3 font-bold hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors mb-4 flex items-center justify-center gap-2"
      >
        <Calculator size={20} />
        Simular Economia
      </button>

      {/* Result */}
      {showResult && (
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 animate-fadeUp">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              <h4 className="text-base font-bold">Resultado</h4>
            </div>
            <button
              onClick={handleClear}
              className="text-sm underline hover:no-underline"
            >
              Nova simulação
            </button>
          </div>

          <div className="bg-white/20 backdrop-blur p-4 mb-4">
            <p className="text-sm opacity-90 mb-2">Você economizaria</p>
            <p className="text-3xl font-bold">R$ {savings.toFixed(2)}</p>
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
        </div>
      )}
    </div>
  );
}
