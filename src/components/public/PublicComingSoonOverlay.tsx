import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

/**
 * Overlay global exibido quando a Área Pública está desativada no ADM.
 * - Não desmonta a página: renderiza sobre o conteúdo com blur+escurecimento.
 * - Bloqueia clique/scroll/navegação enquanto ativo.
 * - Único CTA: "Entrar na Área do Associado" → /app.
 */
export function PublicComingSoonOverlay() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{
        backdropFilter: 'blur(14px) saturate(120%)',
        WebkitBackdropFilter: 'blur(14px) saturate(120%)',
        backgroundColor: 'rgba(0,0,0,0.72)',
      }}
      onWheelCapture={(e) => e.preventDefault()}
      onTouchMoveCapture={(e) => e.preventDefault()}
    >
      <div className="max-w-md w-full bg-[#0a0a0a] border border-yellow-500/40 shadow-2xl p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-yellow-500/10 border border-yellow-500/40 flex items-center justify-center">
          <Rocket className="text-yellow-500" size={26} />
        </div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-yellow-500/80 mb-3">Rarques</div>
        <h1 className="text-white text-2xl font-semibold mb-2">Em Breve</h1>
        <p className="text-yellow-500/90 text-sm mb-8 uppercase tracking-widest">
          Cidade Inteligente.
        </p>
        <Link
          to="/app"
          className="inline-block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm tracking-widest uppercase py-3 transition-colors"
        >
          Entrar na Área do Membro
        </Link>
      </div>
    </div>
  );
}
