import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router';

import { cn } from '@sovereign-university/ui';

import { MainLayout } from '#src/components/MainLayout/index.js';
import { useSmaller } from '#src/hooks/use-smaller.js';

import { MenuDesktop } from './_dashboard/-components/menu-desktop.tsx';
import { MenuMobile } from './_dashboard/-components/menu-mobile.tsx';

export const Route = createFileRoute('/dashboard/_dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const isMobile = useSmaller('lg');
  const location = useLocation();

  return isMobile ? (
    <MainLayout
      variant="light"
      showFooter={false}
      fillScreen={true}
      headerVariant="light"
    >
      <div>
        <div
          className={cn(
            'p-6 pb-20 bg-white text-black',
            location.href.includes('calendar')
              ? 'px-0 pt-6 pb-12 md:p-6'
              : 'p-6 pb-20',
          )}
        >
          <Outlet></Outlet>
        </div>
        <MenuMobile location={location} />
      </div>
    </MainLayout>
  ) : (
    <MainLayout variant="light" headerVariant="light">
      <div className="flex flex-row text-white min-h-[1012px] mt-3 mx-4">
        <MenuDesktop location={location} />
        <div className="bg-white grow rounded-xl ml-3 p-8 text-black">
          <Outlet></Outlet>
        </div>
      </div>
    </MainLayout>
  );
}
