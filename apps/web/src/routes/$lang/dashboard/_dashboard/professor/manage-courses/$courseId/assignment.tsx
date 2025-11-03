import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import { Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { NotFound } from '#src/components/not-found.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { CourseAssignment } from '../../-components/course-assignment.tsx';
import { getTabs } from './-utils/get-tabs.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/professor/manage-courses/$courseId/assignment',
)({
  component: Assignment,
  params: {
    parse: (params) => ({
      courseId: z.string().parse(params.courseId),
    }),
    stringify: ({ courseId }) => ({ courseId: `${courseId}` }),
  },
});

function Assignment() {
  const { t } = useTranslation();
  const params = Route.useParams();

  const navigate = useNavigate();
  const { session } = useContext(AppContext);

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      navigate({ to: '/' });
    } else if (!canAccess(UserRole.Professor)(session.user)) {
      navigate({ to: '/my-courses' });
    }
  }, [navigate, session]);

  const { courses } = useContext(AppContext);

  if (!courses) {
    return null;
  }

  const course = courses.find((c) => c.id === params.courseId);

  if (!course || !course.hasAssignment) {
    return <NotFound />;
  }

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      layoutSize="wide"
      title={t('dashboard.teacher.courses.assignmentGrade.title')}
      description={t('dashboard.teacher.courses.assignmentGrade.description')}
      tabs={getTabs(params.courseId, courses)}
    >
      <CourseAssignment courseId={params.courseId} />
    </PageLayout>
  );
}
