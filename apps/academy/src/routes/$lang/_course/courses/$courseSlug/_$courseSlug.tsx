import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useContext } from 'react';
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
      { staleTime: 300_000 },
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

  if (!course) return null;

  return (
    <CourseContext.Provider value={{ course, courseProgress, isLoggedIn }}>
      <Outlet />
    </CourseContext.Provider>
  );
}
