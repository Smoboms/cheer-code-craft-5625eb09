import { Settings, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import rarquesLogo from '@/assets/rarques-logo.png.asset.json';

interface PremiumHeaderProps {
  hasNotifications?: boolean;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
}

export function PremiumHeader({ onSettingsClick }: PremiumHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <img
          src={rarquesLogo.url}
          alt="Rarques"
          className="h-9 w-auto object-contain"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            aria-label="Voltar ao Portal Público"
            title="Voltar ao Portal Público"
            className="w-10 h-10 bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <ExternalLink size={18} className="text-white" />
          </button>
          <button
            onClick={onSettingsClick}
            aria-label="Configurações"
            className="w-10 h-10 bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <Settings size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
