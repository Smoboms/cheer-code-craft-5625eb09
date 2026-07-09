import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicBottomNav } from './PublicBottomNav';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />
      <div className="max-w-md mx-auto pt-20 pb-24 px-4">
        <Outlet />
      </div>
      <PublicBottomNav />
    </div>
  );
}
