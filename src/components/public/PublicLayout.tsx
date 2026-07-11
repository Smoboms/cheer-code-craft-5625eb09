import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicBottomNav } from './PublicBottomNav';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />
      <div className="max-w-md lg:max-w-6xl mx-auto pt-20 pb-24 lg:pb-10 px-4 lg:px-8">
        <Outlet />
      </div>
      <PublicBottomNav />
    </div>
  );
}
