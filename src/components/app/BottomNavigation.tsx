import { Heart, Calculator, Store, Gift } from 'lucide-react';

interface NavigationButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavigationButton({ icon, label, active, onClick }: NavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
        active 
          ? 'bg-black text-white' 
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'beneficios', label: 'BENEFÍCIOS', icon: <Gift size={20} /> },
    { id: 'favoritos', label: 'FAVORITOS', icon: <Heart size={20} /> },
    { id: 'simulador', label: 'SIMULADOR', icon: <Calculator size={20} /> },
    { id: 'seja-parceiro', label: 'SEJA PARCEIRO', icon: <Store size={20} /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {tabs.map((tab) => (
        <NavigationButton
          key={tab.id}
          icon={tab.icon}
          label={tab.label}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  );
}