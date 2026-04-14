import { ShoppingBag, Calendar, MapPin, Receipt } from 'lucide-react';

interface Purchase {
  id: number;
  partnerName: string;
  category: string;
  date: string;
  amount: number;
  savings: number;
  discount: string;
}

const mockPurchases: Purchase[] = [
  {
    id: 1,
    partnerName: 'Restaurante Sabor da Terra',
    category: 'Alimentação',
    date: '10 Jan 2026',
    amount: 45.00,
    savings: 6.00,
    discount: '15% OFF'
  }
];

export function PurchaseHistory() {
  const totalSpent = mockPurchases.reduce((sum, p) => sum + p.amount, 0);
  const totalSavings = mockPurchases.reduce((sum, p) => sum + p.savings, 0);

  if (mockPurchases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="text-gray-300" size={40} />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Nenhuma compra ainda</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Comece a usar seus benefícios nos parceiros e veja seu histórico aqui
        </p>
        <button className="mt-4 bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Ver parceiros
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total gasto</p>
          <p className="text-xl font-bold text-gray-900">R$ {totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Você economizou</p>
          <p className="text-xl font-bold">R$ {totalSavings.toFixed(2)}</p>
        </div>
      </div>

      {/* Purchase Count */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Histórico de compras</h3>
        <span className="text-sm text-gray-500">
          {mockPurchases.length} {mockPurchases.length === 1 ? 'compra' : 'compras'}
        </span>
      </div>

      {/* Purchases List */}
      <div className="space-y-3">
        {mockPurchases.map((purchase) => (
          <div
            key={purchase.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-lg flex-shrink-0 flex items-center justify-center">
                <Receipt className="text-white" size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{purchase.partnerName}</h4>
                    <p className="text-xs text-gray-500">{purchase.category}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold ml-2 flex-shrink-0">
                    {purchase.discount}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{purchase.date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Valor total</p>
                    <p className="font-semibold text-gray-900">R$ {purchase.amount.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Você economizou</p>
                    <p className="font-semibold text-green-600">R$ {purchase.savings.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Resumo mensal</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Janeiro 2026</span>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{mockPurchases.length} compras</p>
              <p className="text-xs text-green-600">R$ {totalSavings.toFixed(2)} economizado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
