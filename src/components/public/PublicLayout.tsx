import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicBottomNav } from './PublicBottomNav';
import { PublicComingSoonOverlay } from './PublicComingSoonOverlay';
import { usePlatformStatus } from '@/hooks/usePlatformStatus';
import { useAuth } from '@/contexts/AuthContext';

export function PublicLayout() {
  const { enabled } = usePlatformStatus();
  const { user } = useAuth();
  // Somente visitantes públicos são bloqueados. Usuários logados
  // (associado / empresa / admin) navegam livremente.
  const showOverlay = !enabled && !user;

  return (
    <div className="min-h-screen bg-black relative">
      <PublicHeader />
      <div
        className="max-w-md lg:max-w-6xl mx-auto pt-20 pb-24 lg:pb-10 px-4 lg:px-8"
        // Congela visualmente o conteúdo público quando o overlay estiver ativo.
        // Interações são bloqueadas via `pointer-events-none` e o overlay captura scroll.
        style={showOverlay ? { filter: 'blur(6px) brightness(0.55)', pointerEvents: 'none', userSelect: 'none' } : undefined}
        aria-hidden={showOverlay || undefined}
      >
        <Outlet />
      </div>
      <PublicBottomNav />
      {showOverlay && <PublicComingSoonOverlay />}
    </div>
  );
}
