import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';

export const Route = createFileRoute('/$lang/educator-content/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <PageLayout title={t('menu.educatorContent')} layoutSize="wide">
      Educator content page coming soon!
    </PageLayout>
  );
}
