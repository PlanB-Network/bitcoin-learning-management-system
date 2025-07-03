import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import { Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { AppContext } from '#src/providers/context.js';
import { DashboardTutorialsPanel } from '../-components/tutorials-panel.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/tutorials',
)({
  component: DashboardAdministrationTutorials,
});

function DashboardAdministrationTutorials() {
  const navigate = useNavigate();

  const { session } = useContext(AppContext);

  useEffect(() => {
    if (!session) {
      navigate({ to: '/' });
    } else if (!canAccess(UserRole.Admin)(session?.user)) {
      navigate({ to: '/dashboard/courses' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-10">
      <DashboardTutorialsPanel />
    </div>
  );
}
