import { Settings } from 'lucide-react';

interface PremiumHeaderProps {
  hasNotifications?: boolean;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
}

export function PremiumHeader({ hasNotifications = true, onNotificationsClick, onSettingsClick }: PremiumHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-50">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-3xl text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            R<span className="text-[#FFFFFF]">.</span>
          </h1>
          <div>
            <p className="text-white font-bold text-sm tracking-wide">RARQUES</p>
            <p className="text-gray-400 text-xs">Plataforma Empresarial</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onSettingsClick}
            className="w-10 h-10 bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <Settings size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
