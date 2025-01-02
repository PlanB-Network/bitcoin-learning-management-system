import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router';

import { cn } from '@blms/ui';

import { MainLayout } from '#src/components/main-layout.js';
import { useSmaller } from '#src/hooks/use-smaller.js';

import { MenuDashboard } from './_dashboard/-components/menu-dashboard.tsx';

export const Route = createFileRoute('/dashboard/_dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const isMobile = useSmaller('lg');
  const location = useLocation();

  return isMobile ? (
    <MainLayout variant="light" showFooter={false} headerVariant="light">
      <div>
        <div
          className={cn(
            'bg-white text-black',
            location.href.includes('calendar')
              ? 'px-0 py-6 md:p-6'
              : 'px-4 py-6',
          )}
        >
          <Outlet></Outlet>
        </div>
      </div>
    </MainLayout>
  ) : (
    <MainLayout variant="light" headerVariant="light">
      <div className="flex flex-row text-white min-h-[1012px] mt-3 mx-4">
        <MenuDashboard location={location} />
        <div className="bg-white grow rounded-xl ml-3 p-8 text-black">
          <Outlet></Outlet>
        </div>
      </div>
    </MainLayout>
  );
}
