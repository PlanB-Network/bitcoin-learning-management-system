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
import { CourseReview } from '../../-components/course-review.tsx';
import { getTabs } from './-utils/get-tabs.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/professor/manage-courses/$courseId/review',
)({
  component: Review,
  params: {
    parse: (params) => ({
      courseId: z.string().parse(params.courseId),
    }),
    stringify: ({ courseId }) => ({ courseId: `${courseId}` }),
  },
});

function Review() {
  const { i18n, t } = useTranslation();
  const params = Route.useParams();
  const navigate = useNavigate();
  const { session } = useContext(AppContext);

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
      title={t('dashboard.teacher.reviews.reviewsAndGrading')}
      description={t('dashboard.teacher.reviews.checkReviews')}
      tabs={getTabs(course.id)}
    >
      <CourseReview
        courseId={course.id}
        averageRating={Math.round(course.averageRating * 100) / 100}
      />
    </PageLayout>
  );
}
