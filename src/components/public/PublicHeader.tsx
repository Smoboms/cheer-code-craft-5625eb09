import { Link, useLocation } from 'react-router-dom';
import rarquesLogo from '@/assets/rarques-logo.png.asset.json';

export function PublicHeader() {
  const { pathname } = useLocation();
  return (
    <div className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <img src={rarquesLogo.url} alt="Rarques" className="h-9 w-auto object-contain" />
        </Link>
        <Link
          to="/app"
          state={{ from: pathname }}
          className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] font-semibold px-3 py-1.5 tracking-wide transition-colors"
        >
          ÁREA DO ASSOCIADO
        </Link>
      </div>
    </div>
  );
}
