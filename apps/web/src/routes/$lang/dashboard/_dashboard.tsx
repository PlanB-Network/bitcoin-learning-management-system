import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router';

import { cn } from '@blms/ui';

import { MainLayout } from '#src/components/main-layout.js';
import { useSmaller } from '#src/hooks/use-smaller.js';

import { NotFoundDashboard } from '#src/components/not-found-dashboard.tsx';
import { MenuDashboard } from './_dashboard/-components/menu-dashboard.tsx';

export const Route = createFileRoute('/$lang/dashboard/_dashboard')({
  component: Dashboard,
  notFoundComponent: NotFoundDashboard,
});

function Dashboard() {
  const isMobile = useSmaller('lg');
  const location = useLocation();

  const pathname = location.href;
  const paddingClasses = {
    calendar: 'px-0 py-6 md:p-6',
    notifications: 'md:px-4 py-6',
    default: 'px-4 py-6',
  };

  let padding = paddingClasses.default;
  if (pathname.includes('calendar')) {
    padding = paddingClasses.calendar;
  } else if (pathname.includes('/dashboard/notifications')) {
    padding = paddingClasses.notifications;
  }

  return isMobile ? (
    <MainLayout variant="light" showFooter={false} headerVariant="light">
      <div>
        <div className={cn('bg-white text-black', padding)}>
          <Outlet />
        </div>
      </div>
    </MainLayout>
  ) : (
    <MainLayout variant="gray" headerVariant="light">
      <div className="flex flex-row text-white mt-3 mx-4">
        <MenuDashboard location={location} />
        <div className="bg-white rounded-xl lg:ml-4 p-8 text-black lg:min-h-full w-full">
          <Outlet />
        </div>
      </div>
    </MainLayout>
  );
}
