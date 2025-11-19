import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import { Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.js';
import { DashboardTutorialsPanel } from '../-components/tutorials-panel.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/tutorials',
)({
  component: DashboardAdministrationTutorials,
});

function DashboardAdministrationTutorials() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { session } = useContext(AppContext);

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      navigate({ to: '/' });
    } else if (!canAccess(UserRole.Admin)(session?.user)) {
      navigate({ to: '/my-courses' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      layoutSize="wide"
      title={t('dashboard.adminPanel.tutorialsManagementPanel')}
      hideTitle
    >
      <div className="flex flex-col gap-4 lg:gap-10">
        <DashboardTutorialsPanel />
      </div>
    </PageLayout>
  );
}
