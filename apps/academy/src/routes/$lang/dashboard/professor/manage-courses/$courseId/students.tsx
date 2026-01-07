import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { CourseStudentsTable } from '../../-components/course-students-table.tsx';
import { getTabs } from './-utils/get-tabs.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/professor/manage-courses/$courseId/students',
)({
  component: Students,
  params: {
    parse: (params) => ({
      courseId: z.string().parse(params.courseId),
      lang: z.string().parse(params.lang),
    }),
    stringify: ({ courseId, lang }) => ({ courseId: `${courseId}`, lang }),
  },
});

function Students() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const params = Route.useParams();
  const { session, courses } = useContext(AppContext);

  const { data: course } = useQuery(
    trpc.content.getCourse.queryOptions({
      id: params.courseId,
      language: i18n.language,
    }),
  );

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      navigate({ to: '/' });
    } else if (!canAccess(UserRole.Professor)(session.user)) {
      navigate({ to: '/my-courses' });
    }
  }, [navigate, session]);

  if (!course) {
    return null;
  }

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      layoutSize="wide"
      title={t('words.students')}
      overTitleMobile={course ? course.name : undefined}
      tabs={getTabs(course.id, courses || [])}
    >
      <CourseStudentsTable course={course} />
    </PageLayout>
  );
}
