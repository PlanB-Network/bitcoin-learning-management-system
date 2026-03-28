import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '#src/providers/context.tsx';
import { CourseContext } from '#src/providers/courseContext.tsx';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute(
  '/$lang/_course/courses/$courseSlug/_$courseSlug',
)({
  component: CourseLayout,
});

function CourseLayout() {
  const { i18n } = useTranslation();
  const { courseSlug } = Route.useParams();

  const { session } = useContext(AppContext);
  const isLoggedIn = !!session?.user;

  const { data: course } = useQuery(
    trpc.content.getCourse.queryOptions(
      { id: courseSlug, language: i18n.language },
      { staleTime: 300_000, placeholderData: keepPreviousData },
    ),
  );

  const { data: courseProgress } = useQuery(
    trpc.user.courses.getProgress.queryOptions(
      {
        courseId: course?.id,
      },
      {
        enabled: !!course,
      },
    ),
  );

  const { data: payments } = useQuery(
    trpc.user.courses.getPayments.queryOptions(undefined, {
      enabled: isLoggedIn && !!course?.requiresPayment,
    }),
  );

  const isCoursePaid = useMemo(
    () =>
      payments?.some(
        (payment) =>
          payment.paymentStatus === 'paid' && payment.courseId === course?.id,
      ),
    [payments, course?.id],
  );

  if (!course) return null;

  return (
    <CourseContext.Provider
      value={{ course, courseProgress, isLoggedIn, isCoursePaid }}
    >
      <Outlet />
    </CourseContext.Provider>
  );
}
