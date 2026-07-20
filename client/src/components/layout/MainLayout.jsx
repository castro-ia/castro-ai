import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-night-900">
      <div className="flex-1 pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
