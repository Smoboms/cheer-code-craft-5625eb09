import { Building2, Tag, TrendingUp } from 'lucide-react';

export type TabType = 'rede' | 'beneficios' | 'crescer';

interface PremiumBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function PremiumBottomNav({ activeTab, onTabChange }: PremiumBottomNavProps) {
  const tabs = [
    { id: 'rede' as TabType, label: 'Rede', icon: Building2 },
    { id: 'beneficios' as TabType, label: 'Benefícios', icon: Tag },
    { id: 'crescer' as TabType, label: 'Crescer', icon: TrendingUp },
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
              className="flex flex-col items-center gap-1 px-4 py-1 transition-all"
            >
              <Icon 
                size={22} 
                className={isActive ? 'text-[#FFFFFF]' : 'text-gray-400'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs ${isActive ? 'text-[#FFFFFF] font-semibold' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}