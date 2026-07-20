import { Outlet, useLocation } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicBottomNav } from './PublicBottomNav';
import { PublicComingSoonOverlay } from './PublicComingSoonOverlay';
import { usePlatformStatus } from '@/hooks/usePlatformStatus';
import { useAuth } from '@/contexts/AuthContext';

export function PublicLayout() {
  const { enabled } = usePlatformStatus();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  // Área Pública restrita: quando desativada, SOMENTE administradores
  // (rarquesmatriz@gmail.com / imobiliario454@gmail.com) navegam.
  // EXCEÇÃO: rotas do R-CARD (/cartao e /cartao/:code) são endpoints funcionais
  // do NFC/QR-Code e devem permanecer acessíveis a todos — inclusive deslogados.
  const ADMIN_EMAILS = ['rarquesmatriz@gmail.com', 'imobiliario454@gmail.com'];
  const isAllowed = isAdmin || (user?.email ? ADMIN_EMAILS.includes(user.email) : false);
  const isCardRoute = location.pathname.startsWith('/cartao');
  const showOverlay = !enabled && !isAllowed && !isCardRoute;

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
