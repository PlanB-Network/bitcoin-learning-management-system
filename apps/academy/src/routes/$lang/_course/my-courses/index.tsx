import { TeachingFormat } from '@blms/constants';
import {
  cn,
  EmptyState,
  Loader,
  SegmentedControl,
  SegmentedControlItem,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbBookOff } from 'react-icons/tb';

import { PageLayout } from '#src/components/page-layout.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { InProgressCourseCard } from '#src/patterns/in-progress-course-card.tsx';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.ts';
import { CourseTable } from '../courses/$courseSlug/_$courseSlug/-components/course-table.tsx';
import { CourseTableMobile } from '../courses/$courseSlug/_$courseSlug/-components/course-table-mobile.tsx';

export const Route = createFileRoute('/$lang/_course/my-courses/')({
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
    return (
      <PageLayout
        title={t('navbar.myCourses')}
        layoutSize="max"
        showBecomeTeacherButton
      >
        <Loader size="s" />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('navbar.myCourses')}
      layoutSize="max"
      showBecomeTeacherButton
    >
      {hasInProgressProfessorLedCourses && (
        <>
          <h2 className="title-base md:title-large max-md:mt-4">
            {t('navbar.liveClassesTitle')}
          </h2>
          <div className="flex flex-col w-full border border-neutral-100 rounded-2xl overflow-hidden mt-4 md:mt-6">
            {filteredInProgressProfessorLedCourses.map((courseProgress) => {
              const course = courses?.find(
                (c) => c.id === courseProgress.courseId,
              );
              if (!course) return null;
              return (
                <InProgressCourseCard
                  key={courseProgress.courseId}
                  course={course}
                  courseProgress={courseProgress}
                />
              );
            })}
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
        <div className="flex flex-col mt-6 w-full border border-neutral-100 rounded-2xl overflow-hidden">
          {filteredInProgressSelfLearningCourses.map((courseProgress) => {
            const course = courses?.find(
              (c) => c.id === courseProgress.courseId,
            );
            if (!course) return null;
            return (
              <InProgressCourseCard
                key={courseProgress.courseId}
                course={course}
                courseProgress={courseProgress}
              />
            );
          })}
          {filteredInProgressSelfLearningCourses.length === 0 && (
            <div className="p-4">
              <EmptyState
                title={t('dashboard.myCourses.noCourseStarted')}
                linkButton={{
                  href: '/learn-anytime',
                  label: t('bCert.chooseCourse'),
                }}
                icon={TbBookOff}
              />
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
