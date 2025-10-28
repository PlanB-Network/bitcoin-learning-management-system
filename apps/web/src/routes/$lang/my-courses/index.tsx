import { TeachingFormat } from '@blms/constants';
import type { CourseProgressExtended } from '@blms/types';
import {
  cn,
  EmptyState,
  Loader,
  Progress,
  SegmentedControl,
  SegmentedControlItem,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbBookOff } from 'react-icons/tb';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.ts';
import { CourseTable } from './-components/course-table.tsx';
import { CourseTableMobile } from './-components/course-table-mobile.tsx';

export const Route = createFileRoute('/$lang/my-courses/')({
  component: DashboardCourses,
});

function DashboardCourses() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session, courses } = useContext(AppContext);

  const isMobile = useSmaller('md') || window.innerWidth < 768;

  const [currentTab, setCurrentTab] = useState('map');

  const { data: progress } = useQuery({
    ...trpc.user.courses.getProgress.queryOptions(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const filteredSelfLearningCourses = courses
    ? courses.filter((course) => {
        const inProgress = (progress ?? []).some(
          (p) => p.courseId === course.id,
        );
        return (
          (!course.isArchived || inProgress) &&
          (course.language.toLowerCase() === i18n.language.toLowerCase() ||
            inProgress) &&
          course.teachingFormat === TeachingFormat.SelfPaced
        );
      })
    : [];

  const filteredInProgressSelfLearningCourses = progress
    ? progress
        .filter((progress) => {
          const course = courses?.find((c) => c.id === progress.courseId);

          if (!course) return false;

          return course.teachingFormat === TeachingFormat.SelfPaced;
        })
        .sort((a, b) => {
          if (b.progressPercentage !== a.progressPercentage) {
            return b.progressPercentage - a.progressPercentage;
          }

          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        })
    : [];

  const filteredInProgressProfessorLedCourses = progress
    ? progress
        .filter((progress) => {
          const course = courses?.find((c) => c.id === progress.courseId);

          if (!course) return false;

          return course.teachingFormat === TeachingFormat.ProfessorLed;
        })
        .sort((a, b) => {
          if (b.progressPercentage !== a.progressPercentage) {
            return b.progressPercentage - a.progressPercentage;
          }

          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        })
    : [];

  const hasInProgressProfessorLedCourses =
    filteredInProgressProfessorLedCourses.length > 0;

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout title={t('navbar.myCourses')} layoutSize="max">
      {hasInProgressProfessorLedCourses && (
        <>
          <h2 className="title-base md:title-large max-md:mt-4">
            {t('navbar.liveClassesTitle')}
          </h2>
          <div className="flex flex-col gap-1 md:gap-4 mt-4 md:mt-6 w-full">
            {filteredInProgressProfessorLedCourses.map((courseProgress) => (
              <InProgressCourseCard
                key={courseProgress.courseId}
                courseProgress={courseProgress}
              />
            ))}
          </div>
        </>
      )}
      <h2
        className={cn(
          'title-base md:title-large',
          hasInProgressProfessorLedCourses ? 'mt-8' : ' max-md:mt-4',
        )}
      >
        {t('navbar.learnAnytimeTitle')}
      </h2>
      <SegmentedControl
        variant="outline"
        defaultValue={'map'}
        value={currentTab}
        size={isMobile ? 'sm' : 'default'}
        className="w-full md:max-w-[442px] my-4 md:my-8"
      >
        <SegmentedControlItem
          value={'map'}
          key={'map'}
          onClick={() => setCurrentTab('map')}
        >
          <p className="w-full">{t('words.map')}</p>
        </SegmentedControlItem>
        <SegmentedControlItem
          value={'list'}
          key={'list'}
          onClick={() => setCurrentTab('list')}
        >
          <p className="w-full">{t('words.list')}</p>
        </SegmentedControlItem>
      </SegmentedControl>
      {currentTab === 'map' && (
        <div className="max-xl:max-w-[733px] flex flex-col">
          <CourseTable
            courses={filteredSelfLearningCourses}
            progress={progress || []}
          />
          <CourseTableMobile
            courses={filteredSelfLearningCourses}
            progress={progress || []}
          />
        </div>
      )}
      {currentTab === 'list' && (
        <div className="flex flex-col gap-1 md:gap-4 mt-6 w-full">
          {filteredInProgressSelfLearningCourses.map((courseProgress) => (
            <InProgressCourseCard
              key={courseProgress.courseId}
              courseProgress={courseProgress}
            />
          ))}
          {filteredInProgressSelfLearningCourses.length === 0 && (
            <EmptyState
              title={t('dashboard.myCourses.noCourseStarted')}
              linkButton={{
                href: '/learn-anytime',
                label: t('bCert.chooseCourse'),
              }}
              icon={TbBookOff}
            />
          )}
        </div>
      )}
    </PageLayout>
  );
}

const InProgressCourseCard = ({
  courseProgress,
}: {
  courseProgress: CourseProgressExtended;
}) => {
  const { courses } = useContext(AppContext);
  if (!courses) return null;

  const course = courses.find((c) => c.id === courseProgress.courseId);
  if (!course) return null;

  return (
    <Link
      to={`/my-courses/${course.id}`}
      className="flex items-center justify-between w-full border border-neutral-100 rounded-2xl p-3 md:p-8 gap-2 max-w-[1097px] hover:bg-neutral-50"
      key={course.id}
    >
      <span className="body-small-bold md:subtitle-base text-black">
        {course.name}
      </span>
      <div className="flex items-center gap-3 md:gap-12 xl:w-full xl:max-w-[348px] justify-end">
        <div className="flex items-center gap-4 w-full justify-end">
          <div className="w-full max-w-[272px] relative max-xl:hidden">
            <Progress
              total={courseProgress.totalChapters}
              completed={courseProgress.completedChaptersCount}
              pillImage={OrangePill}
            />
          </div>
          <span className="body-extra-small-bold md:subtitle-base text-orange-500">
            {courseProgress.progressPercentage}%
          </span>
        </div>
      </div>
    </Link>
  );
};
