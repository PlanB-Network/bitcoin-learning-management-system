import { cn } from '@blms/ui';
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';

import { MainLayout } from '#src/components/main-layout.js';
import { NotFound } from '#src/components/not-found.tsx';
import { useSmaller } from '#src/hooks/use-smaller.js';

export const Route = createFileRoute('/$lang/dashboard/_dashboard')({
  component: Dashboard,
  notFoundComponent: NotFound,
});

function Dashboard() {
  const isMobile = useSmaller('lg');
  const location = useLocation();

  const pathname = location.href;
  const paddingClasses = {
    calendar: 'px-0 py-6 md:p-6',
    default: 'px-4 py-6',
    notifications: 'md:px-4 py-6',
  };

  let padding = paddingClasses.default;
  if (pathname.includes('calendar')) {
    padding = paddingClasses.calendar;
  } else if (
    pathname.includes('/dashboard/notifications') ||
    pathname.includes('/dashboard/professor/courses')
  ) {
    padding = paddingClasses.notifications;
  }

  return isMobile ? (
    <MainLayout>
      <div>
        <div className={cn('bg-white text-black', padding)}>
          <Outlet />
        </div>
      </div>
    </MainLayout>
  ) : (
    <MainLayout>
      <div className="flex flex-row text-white">
        <div className="bg-white rounded-xl p-8 text-black lg:min-h-full w-full">
          <Outlet />
        </div>
      </div>
    </MainLayout>
  );
}
