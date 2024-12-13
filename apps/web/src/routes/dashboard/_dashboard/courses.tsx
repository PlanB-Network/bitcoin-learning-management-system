import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.ts';

import { CourseTableMobile } from './-components/course-table-mobile.tsx';
import { CourseTable } from './-components/course-table.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/courses')({
  component: DashboardCourses,
});

function DashboardCourses() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session } = useContext(AppContext);

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = trpc.content.getCourses.useQuery(
    { language: i18n.language },
    { staleTime: 300_000 }, // 5 minutes
  );

  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
  } = trpc.user.courses.getProgress.useQuery();

  if (!session) {
    navigate({ to: '/' });
    return null;
  }

  if (coursesLoading || progressLoading) {
    return <div>Loading courses...</div>;
  }

  if (coursesError || progressError) {
    return <div>Error: {coursesError?.message || progressError?.message}</div>;
  }

  return (
    <div className="max-md:max-w-[320px] max-xl:max-w-[698px] flex flex-col mx-auto">
      <h1 className="title-large-24px text-center md:text-start md:display-small-32px text-dashboardSectionText max-xl:mb-[21px] xl:mb-[42px]">
        {t('dashboard.myCourses.courseDashboard')}
      </h1>
      <CourseTable courses={courses || []} progress={progress || []} />
      <CourseTableMobile courses={courses || []} progress={progress || []} />
    </div>
  );
}
