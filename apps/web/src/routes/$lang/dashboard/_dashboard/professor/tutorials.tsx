import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import { Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.js';
import { DashboardTutorialsPanel } from '../-components/tutorials-panel.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/professor/tutorials',
)({
  component: DashboardProfessorTutorials,
});

function DashboardProfessorTutorials() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { user, session } = useContext(AppContext);

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      navigate({ to: '/' });
    } else if (!canAccess(UserRole.Professor)(session.user)) {
      navigate({ to: '/dashboard/my-courses' });
    }
  }, [navigate, session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      title={t('dashboard.teacher.tutorials.yourTutorials')}
      layoutSize="wide"
    >
      <div className="flex flex-col gap-4 lg:gap-10">
        <DashboardTutorialsPanel professorId={user?.professorId ?? undefined} />
      </div>
    </PageLayout>
  );
}
