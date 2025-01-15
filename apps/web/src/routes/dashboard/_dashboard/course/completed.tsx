import { createFileRoute, useLocation } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CourseProgressExtended } from '@blms/types';
import { Divider, Tabs, TabsContent } from '@blms/ui';

import { TabsListUnderlined } from '#src/components/Tabs/TabsListUnderlined.tsx';
import { AuthorCard } from '#src/components/author-card.tsx';
import { CourseCurriculum } from '#src/organisms/course-curriculum.tsx';
import { addSpaceToCourseId } from '#src/utils/courses.ts';
import { trpc } from '#src/utils/trpc.ts';

import { CourseExams, CourseRatings } from './$courseId.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/course/completed')({
  component: DashboardCompletedCourses,
});

function DashboardCompletedCourses() {
  const location = useLocation();

  const { data: courses } = trpc.user.courses.getProgress.useQuery();

  const completedCourses = courses?.filter(
    (course) => course.progressPercentage === 100,
  );

  const tabs = useMemo(
    () =>
      completedCourses
        ? completedCourses.map((course) => ({
            value: course.courseId,
            key: course.courseId,
            text: addSpaceToCourseId(course.courseId).toUpperCase(),
          }))
        : [],
    [completedCourses],
  );

  const getDefaultTab = () => {
    const hash = location.hash.replace('#', '');
    const validTabs = tabs.map((tab) => tab.value);
    return validTabs.includes(hash) ? hash : tabs[0]?.value || '';
  };

  const [currentTab, setCurrentTab] = useState(getDefaultTab);

  // Update default tab once completedCourses are available if there's no hash in the URL
  useEffect(() => {
    if (completedCourses?.length && !location.hash) {
      setCurrentTab(tabs[0].value);
    }
  }, [completedCourses, location.hash, tabs]);

  // Sync tab with URL hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (tabs.some((tab) => tab.value === hash)) {
      setCurrentTab(hash);
    }
  }, [location.hash, tabs]);

  const onTabChange = (value: string) => {
    setCurrentTab(value);
    window.location.hash = value;
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex max-md:flex-col md:items-center gap-2 md:gap-5">
          <h3 className="text-2xl leading-normal text-dashboardSectionTitle md:display-small-32px">
            {t('dashboard.course.coursesCompleted')}
          </h3>
        </div>
        <Tabs
          defaultValue=""
          value={currentTab}
          onValueChange={onTabChange}
          className="w-full"
        >
          <TabsListUnderlined
            tabs={tabs.map((tab) => ({
              ...tab,
              active: currentTab === tab.value,
            }))}
          />

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <CompletedCourseDetails
                courseId={tab.value}
                courseProgress={
                  completedCourses?.find(
                    (course) => course.courseId === tab.value,
                  ) as CourseProgressExtended
                }
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}

const CompletedCourseDetails = ({
  courseId,
  courseProgress,
}: {
  courseId: string;
  courseProgress: CourseProgressExtended;
}) => {
  const { i18n } = useTranslation();

  const { data: course, isFetched } = trpc.content.getCourse.useQuery(
    {
      id: courseId,
      language: i18n.language,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const { data: examResults, isFetched: isExamResultsFetched } =
    trpc.user.courses.getAllUserCourseExamResults.useQuery({
      courseId,
    });

  return (
    <div className="flex flex-col w-full">
      {course && isFetched && (
        <>
          <div className="flex flex-col gap-4 mt-6 md:mt-10">
            <h3 className="title-small-med-16px md:title-large-sb-24px text-newBlack-1">
              {course.name} - {addSpaceToCourseId(courseId).toUpperCase()}
            </h3>
            <p className="body-16px text-dashboardSectionText/75">
              {t('dashboard.course.checkDetailsCompleted')}
            </p>
          </div>
          <CourseCurriculum
            course={course}
            completedChapters={courseProgress?.chapters.map(
              (chapter) => chapter.chapterId,
            )}
            nextChapter={courseProgress?.nextChapter?.chapterId}
            hideGithubLink
            className="self-start w-full mt-5 md:mt-10"
          >
            <h4 className="title-medium-sb-18px md:subtitle-medium-caps-18px text-dashboardSectionTitle mb-7 md:mb-6">
              {t('courses.details.curriculum')}
            </h4>
          </CourseCurriculum>

          {isExamResultsFetched && examResults && examResults.length > 0 && (
            <>
              <Divider
                className="mt-10 max-w-[1024px]"
                width="w-full"
                mode="light"
              />
              <CourseExams
                courseId={courseId}
                examLink={`/courses/${courseId}/${
                  course.parts
                    .find((part) =>
                      part.chapters.find((chapter) => chapter?.isCourseExam),
                    )
                    ?.chapters.find((chapter) => chapter?.isCourseExam)
                    ?.chapterId
                }`}
                openLastExam={true}
              />
            </>
          )}

          <Divider
            className="mt-10 max-w-[948px]"
            width="w-full"
            mode="light"
          />

          <CourseRatings courseId={courseId} />

          <Divider
            className="mt-10 max-w-[948px]"
            width="w-full"
            mode="light"
          />

          <section className="flex flex-col mt-5 md:mt-10 md:gap-5">
            <h4 className="title-small-med-16px md:title-large-sb-24px text-dashboardSectionTitle">
              {t('words.teacher')}
            </h4>
            <div className="flex h-fit flex-col max-md:gap-4">
              {course.professors.map((professor) => (
                <AuthorCard
                  key={professor.id}
                  professor={professor}
                  hasDonateButton
                  mobileSize="medium"
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
