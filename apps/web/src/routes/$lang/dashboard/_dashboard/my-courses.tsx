import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.ts';
import { CourseTable } from './-components/course-table.tsx';
import { CourseTableMobile } from './-components/course-table-mobile.tsx';

export const Route = createFileRoute('/$lang/dashboard/_dashboard/my-courses')({
  component: DashboardCourses,
});

function DashboardCourses() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session, courses } = useContext(AppContext);

  const { data: progress } = useQuery({
    ...trpc.user.courses.getProgress.queryOptions(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const filteredCourses = courses
    ? courses.filter((course) => {
        const inProgress = (progress ?? []).some(
          (p) => p.courseId === course.id,
        );
        return (
          (!course.isArchived || inProgress) &&
          (course.language.toLowerCase() === i18n.language.toLowerCase() ||
            inProgress)
        );
      })
    : [];

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  if (!filteredCourses) {
    return <div>{t('dashboard.myCourses.noCoursesAvailable')}</div>;
  }

  return (
    <PageLayout
      title={t('dashboard.myCourses.courseDashboard')}
      layoutSize="max"
    >
      <div className="max-xl:max-w-[698px] flex flex-col max-lg:mx-auto">
        <CourseTable courses={filteredCourses} progress={progress || []} />
        <CourseTableMobile
          courses={filteredCourses}
          progress={progress || []}
        />
      </div>
    </PageLayout>
  );
}
