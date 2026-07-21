import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SideDrawer } from './SideDrawer';

export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-night-900">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet context={{ openDrawer: () => setDrawerOpen(true) }} />
      </div>
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
