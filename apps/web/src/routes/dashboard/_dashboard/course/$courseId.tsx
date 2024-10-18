import {
  Link,
  createFileRoute,
  useLocation,
  useParams,
} from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoIosArrowDown } from 'react-icons/io';
import { IoReload } from 'react-icons/io5';

import { Button, Loader, Tabs, TabsContent, TextTag, cn } from '@blms/ui';

import CertificateLockImage from '#src/assets/courses/course-exam-certificate-lock.webp';
import CertificateImage from '#src/assets/courses/course-exam-certificate.webp';
import SandClockGif from '#src/assets/icons/sandClock/sandclock.gif';
import { TabsListUnderlined } from '#src/components/Tabs/TabsListUnderlined.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AnswersReviewPanel } from '#src/routes/_content/courses/$courseId/-components/exam-results.tsx';
import { addSpaceToCourseId } from '#src/utils/courses.ts';
import { oneDayInMs } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute('/dashboard/_dashboard/course/$courseId')({
  component: DashboardStudentCourse,
});

function DashboardStudentCourse() {
  const isSmallDisplay = useSmaller('lg');

  const { i18n } = useTranslation();
  const { courseId } = useParams({
    from: '/dashboard/_dashboard/course/$courseId',
  });
  const location = useLocation();
  const { data: course, isFetched } = trpc.content.getCourse.useQuery(
    {
      id: courseId,
      language: i18n.language,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const tabs = [
    { value: 'overview', key: 'overview', text: t('words.overview') },
    { value: 'exam', key: 'exam', text: t('courses.exam.examAndDiploma') },
    { value: 'ratings', key: 'ratings', text: t('words.ratings') },
  ];

  const getDefaultTab = () => {
    const hash = location.hash.replace('#', '');
    const validTabs = tabs.map((tab) => tab.value);
    return validTabs.includes(hash) ? hash : tabs[0].value;
  };

  const [currentTab, setCurrentTab] = useState(getDefaultTab);

  // Sync tab with URL hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (tabs.some((tab) => tab.value === hash)) {
      setCurrentTab(hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const onTabChange = (value: string) => {
    setCurrentTab(value);
    window.location.hash = value;
  };

  return (
    <>
      {isFetched && course && (
        <div className="flex flex-col gap-4 lg:gap-8">
          <div className="flex max-lg:flex-col lg:items-center gap-2 lg:gap-5">
            <TextTag
              size={isSmallDisplay ? 'verySmall' : 'large'}
              className="uppercase w-fit"
            >
              {addSpaceToCourseId(course.id)}
            </TextTag>
            <h3 className="display-small-32px">{course.name}</h3>
          </div>
          <Tabs
            defaultValue="overview"
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
            <TabsContent value="overview">Under development</TabsContent>

            <TabsContent value="exam">
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
              />
            </TabsContent>

            <TabsContent value="ratings">Under development</TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}

const CourseExams = ({
  courseId,
  examLink,
}: {
  courseId: string;
  examLink: string;
}) => {
  const isMobile = useSmaller('md');

  const { data: examResults, isFetched: isExamResultsFetched } =
    trpc.user.courses.getAllUserCourseExamResults.useQuery({
      courseId,
    });

  const [collapsedStates, setCollapsedStates] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleCollapse = (index: number) => {
    setCollapsedStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div className="flex flex-col mt-4 lg:mt-10">
      <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
        {t('dashboard.course.completionDiploma')}
      </h2>
      <p className="desktop-typo-1 md:body-16px text-dashboardSectionText/75 mt-4">
        {t('dashboard.course.completionExamInfo')}
      </p>

      {!isExamResultsFetched && <Loader />}
      {isExamResultsFetched && examResults && examResults?.length === 0 && (
        <img
          src={CertificateImage}
          alt="Certificate"
          className="mt-8 md:mt-20"
        />
      )}

      {isExamResultsFetched && examResults && examResults?.length > 0 && (
        <div className="max-w-[948px] mt-2.5 md:mt-12">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between body-14px-medium md:body-16px-medium text-dashboardSectionTitle mx-2.5">
              <span className="w-[180px] pl-1 max-md:mr-auto">
                {t('words.date')}
              </span>
              <span className="w-full max-w-[503px] max-md:hidden">
                {t('words.location')}
              </span>
              <span className="w-[70px] md:w-[130px] md:text-center">
                {t('words.grade')}
              </span>
              <span className="max-md:hidden md:w-[138px] pr-1">
                <span className="max-md:hidden">{t('words.status')}</span>
              </span>
            </div>
            <div className="h-px bg-newGray-1"></div>
            {[...examResults]
              .sort(
                (a, b) =>
                  new Date(a.startedAt).getTime() -
                  new Date(b.startedAt).getTime(),
              )
              .map((exam, index) => {
                const isCollapsed = collapsedStates[index];

                return (
                  <div
                    className={cn(
                      'flex flex-col py-2.5',
                      isCollapsed && 'bg-newGray-6',
                    )}
                    key={index}
                  >
                    <div
                      className="cursor-pointer hover:font-medium body-14px md:body-16px text-newBlack-1 flex md:justify-between items-center px-2.5"
                      onClick={() => toggleCollapse(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleCollapse(index);
                        }
                      }}
                    >
                      <span className="pl-1 w-[180px] max-md:mr-auto">
                        {new Date(exam.startedAt).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                          },
                        )}
                      </span>
                      <span className="max-md:hidden w-full max-w-[503px]">
                        {t('words.online')}
                      </span>
                      <span
                        className={cn(
                          'md:text-center font-medium w-[52px] md:w-[130px]',
                          exam.succeeded ? 'text-brightGreen-6' : 'text-red-5',
                        )}
                      >
                        {exam.score}%
                      </span>
                      <div className="flex items-center justify-between pr-1 w-fit md:w-[138px]">
                        <span
                          className={cn(
                            'max-md:hidden body-16px italic',
                            exam.succeeded
                              ? 'text-brightGreen-6'
                              : 'text-red-5',
                          )}
                        >
                          {exam.succeeded
                            ? t('courses.exam.passed')
                            : t('courses.exam.failed')}
                        </span>
                        <IoIosArrowDown
                          className={cn(
                            'transition-all',
                            isCollapsed ? '-rotate-180' : '',
                          )}
                        />
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex flex-col max-md:gap-4 w-full',
                        isCollapsed ? 'w-full' : 'hidden',
                      )}
                    >
                      {!exam.succeeded && (
                        <div className="flex max-md:flex-col w-full gap-7 md:gap-10 md:py-5 md:px-2.5 max-md:pt-7">
                          <img
                            src={CertificateLockImage}
                            alt="Certificate"
                            className="max-md:order-2 max-md:px-3"
                          />
                          <div className="flex flex-col items-center justify-center w-full gap-4 md:gap-7 max-md:px-4">
                            <span className="whitespace-pre-line text-center body-16px-medium text-newBlack-1">
                              {t('courses.exam.dontGiveUpTryAgain')}
                            </span>
                            <img src={SandClockGif} alt="Time" />
                            <Link
                              to={examLink}
                              target="_blank"
                              className="w-fit"
                            >
                              <Button
                                className="w-fit flex gap-2.5"
                                size={isMobile ? 's' : 'm'}
                                variant="primary"
                                disabled={
                                  exam
                                    ? new Date(exam.startedAt).getTime() +
                                        oneDayInMs >
                                      Date.now()
                                    : true
                                }
                              >
                                {t('courses.exam.retakeExam')}
                                <IoReload size={isMobile ? 18 : 24} />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      <section className="flex flex-col max-md:gap-4 w-full md:py-5">
                        <span className="subtitle-small-caps-14px text-newBlack-1 md:text-newBlack-5 px-1.5 md:px-5">
                          {t('courses.exam.answersReview')}
                        </span>
                        <AnswersReviewPanel
                          examResults={exam}
                          className="px-2.5 md:px-5"
                        />
                      </section>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
