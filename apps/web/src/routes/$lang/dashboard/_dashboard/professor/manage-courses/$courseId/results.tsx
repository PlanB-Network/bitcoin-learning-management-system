import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import { Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { ExamResults } from '../../-components/exam-results.tsx';
import { getTabs } from './-utils/get-tabs.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/professor/manage-courses/$courseId/results',
)({
  component: Results,
  params: {
    parse: (params) => ({
      courseId: z.string().parse(params.courseId),
    }),
    stringify: ({ courseId }) => ({ courseId: `${courseId}` }),
  },
});

function Results() {
  const { t } = useTranslation();
  const params = Route.useParams();

  const navigate = useNavigate();
  const { session } = useContext(AppContext);

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
      layoutSize="wide"
      title={t('courses.exam.examResults')}
      tabs={getTabs(params.courseId)}
    >
      <ExamResults courseId={params.courseId} />
    </PageLayout>
  );
}
