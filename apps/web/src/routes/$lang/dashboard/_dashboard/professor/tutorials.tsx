import { Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { AppContext } from '#src/providers/context.js';
import { DashboardTutorialsPanel } from '../-components/tutorials-panel.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/professor/tutorials',
)({
  component: DashboardProfessorTutorials,
});

function DashboardProfessorTutorials() {
  const navigate = useNavigate();

  const { user, session } = useContext(AppContext);

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    } else if (
      session &&
      session?.user.role !== 'admin' &&
      session?.user.role !== 'superadmin' &&
      session?.user.role !== 'professor'
    ) {
      navigate({ to: '/dashboard/courses' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-10">
      <DashboardTutorialsPanel professorId={user?.professorId ?? undefined} />
    </div>
  );
}
