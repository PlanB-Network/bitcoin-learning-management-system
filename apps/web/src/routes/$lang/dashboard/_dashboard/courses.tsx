import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.ts';

import { Loader } from '@blms/ui';
import { CourseTableMobile } from './-components/course-table-mobile.tsx';
import { CourseTable } from './-components/course-table.tsx';

export const Route = createFileRoute('/$lang/dashboard/_dashboard/courses')({
  component: DashboardCourses,
});

function DashboardCourses() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session, courses } = useContext(AppContext);

  const { data: progress } = trpc.user.courses.getProgress.useQuery();

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
    <div className="max-xl:max-w-[698px] flex flex-col max-lg:mx-auto">
      <h1 className="title-large-24px md:display-small-32px text-dashboardSectionText mb-[15px] md:mb-[21px] xl:mb-[42px]">
        {t('dashboard.myCourses.courseDashboard')}
      </h1>
      <CourseTable courses={filteredCourses} progress={progress || []} />
      <CourseTableMobile courses={filteredCourses} progress={progress || []} />
    </div>
  );
}
