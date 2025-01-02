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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, courses } = useContext(AppContext);

  const { data: progress } = trpc.user.courses.getProgress.useQuery();

  if (!session) {
    navigate({ to: '/' });
    return null;
  }

  if (!courses) {
    return <div>{t('dashboard.myCourses.noCoursesAvailable')}</div>;
  }

  return (
    <div className="max-xl:max-w-[698px] flex flex-col max-lg:mx-auto">
      <h1 className="title-large-24px md:display-small-32px text-dashboardSectionText mb-[15px] md:mb-[21px] xl:mb-[42px]">
        {t('dashboard.myCourses.courseDashboard')}
      </h1>
      <CourseTable courses={courses} progress={progress || []} />
      <CourseTableMobile courses={courses} progress={progress || []} />
    </div>
  );
}
