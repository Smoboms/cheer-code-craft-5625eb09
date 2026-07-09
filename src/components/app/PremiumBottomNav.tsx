import { CreditCard, Home, LayoutGrid, Newspaper, Tag } from 'lucide-react';

export type TabType = 'inicio' | 'rcard' | 'journal' | 'mais' | 'beneficios' | 'config';

interface PremiumBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function PremiumBottomNav({ activeTab, onTabChange }: PremiumBottomNavProps) {
  const tabs = [
    { id: 'inicio' as TabType, label: 'Início', icon: Home },
    { id: 'rcard' as TabType, label: 'R-CARD', icon: CreditCard },
    { id: 'journal' as TabType, label: 'Journal', icon: Newspaper },
    { id: 'mais' as TabType, label: 'Mais', icon: LayoutGrid },
    { id: 'beneficios' as TabType, label: 'Benefícios', icon: Tag },
  ];


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-1 transition-all"
            >
              <Icon
                size={22}
                className={isActive ? 'text-white' : 'text-gray-400'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[11px] ${isActive ? 'text-white font-semibold' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
