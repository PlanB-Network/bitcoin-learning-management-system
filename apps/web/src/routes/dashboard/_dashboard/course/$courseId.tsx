import { Link, createFileRoute, useLocation } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsTwitterX } from 'react-icons/bs';
import { FiDownload } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { IoReload } from 'react-icons/io5';
import { z } from 'zod';

import type {
  CourseExamResults,
  CourseProgressExtended,
  JoinedCourseWithAll,
} from '@blms/types';
import {
  Button,
  Divider,
  Loader,
  Tabs,
  TabsContent,
  TextTag,
  cn,
} from '@blms/ui';

import CertificateLockImage from '#src/assets/courses/completion-diploma-lock.webp';
import CertificateSatoshiImage from '#src/assets/courses/completion-diploma-satoshi.webp';
import ApprovedIcon from '#src/assets/icons/approved.svg?react';
import LockGif from '#src/assets/icons/lock.gif';
import SandClockGif from '#src/assets/icons/sandClock/sandclock.gif';
import { AuthorCard } from '#src/components/author-card.tsx';
import { TabsListUnderlined } from '#src/components/Tabs/TabsListUnderlined.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { CourseCurriculum } from '#src/organisms/course-curriculum.tsx';
import { CourseReview } from '#src/routes/_content/courses/$courseId/-components/course-review.tsx';
import {
  AnswersReviewPanel,
  TimeStampDialog,
} from '#src/routes/_content/courses/$courseId/-components/exam-results.tsx';
import { addSpaceToCourseId } from '#src/utils/courses.ts';
import { oneDayInMs } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

import { ProgressBar } from '../-components/courses-progress-list.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/course/$courseId')({
  params: {
    parse: (params) => ({
      courseId: z.string().parse(params.courseId),
    }),
    stringify: ({ courseId }) => ({ courseId: `${courseId}` }),
  },
  component: DashboardStudentCourse,
});

function DashboardStudentCourse() {
  const { i18n } = useTranslation();
  const params = Route.useParams();

  const location = useLocation();
  const { data: course, isFetched } = trpc.content.getCourse.useQuery(
    {
      id: params.courseId,
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
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="flex max-md:flex-col md:items-center gap-2 md:gap-5">
            <TextTag size="large" className="uppercase w-fit max-md:hidden">
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
            <TabsContent value="overview">
              <CourseOverview course={course} />
            </TabsContent>

            <TabsContent value="exam">
              <CourseExams
                courseId={params.courseId}
                examLink={`/courses/${params.courseId}/${
                  course.parts
                    .find((part) =>
                      part.chapters.find((chapter) => chapter?.isCourseExam),
                    )
                    ?.chapters.find((chapter) => chapter?.isCourseExam)
                    ?.chapterId
                }`}
              />
            </TabsContent>

            <TabsContent value="ratings">
              <CourseRatings courseId={course.id} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}

const CourseOverview = ({ course }: { course: JoinedCourseWithAll }) => {
  const { data: courseProgress } = trpc.user.courses.getProgress.useQuery({
    courseId: course.id,
  });

  return (
    <div className="flex flex-col w-fit">
      {courseProgress &&
        courseProgress.length > 0 &&
        courseProgress[0].progressPercentage < 100 && (
          <>
            <span className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle mt-4 md:mt-10">
              {t('dashboard.myCourses.whereYouAre')}
            </span>

            <CourseProgress courseProgress={courseProgress[0]} />
          </>
        )}

      <CourseCurriculum
        course={course}
        completedChapters={courseProgress?.[0].chapters.map(
          (chapter) => chapter.chapterId,
        )}
        nextChapter={courseProgress?.[0].nextChapter?.chapterId}
        hideGithubLink
        className="self-start mt-7 md:mt-10 w-full"
      >
        <h4 className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-darkOrange-5 mb-7 md:mb-6">
          {t('courses.details.curriculum')}
        </h4>
      </CourseCurriculum>

      <Divider className="my-6 md:my-9" width="w-full" />

      <section className="flex flex-col md:gap-5">
        <h4 className="title-small-med-16px md:title-large-sb-24px text-dashboardSectionTitle">
          {t('words.teacher')}
        </h4>
        <div className="flex h-fit flex-col max-md:gap-4">
          {course.professors.map((professor) => (
            <AuthorCard
              key={professor.id}
              professor={professor}
              hasDonateButton
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const CourseProgress = ({
  courseProgress,
}: {
  courseProgress: CourseProgressExtended;
}) => {
  return (
    <div
      key={courseProgress.courseId}
      className="rounded-lg md:rounded-[20px] md:p-1.5 xl:p-2.5 max-md:border max-md:border-newGray-5 shadow-course-navigation-sm md:shadow-course-navigation bg-white md:bg-newGray-6 w-full max-w-[1082px] mt-2.5 md:mt-10"
    >
      <div className="flex max-md:flex-col md:items-center md:justify-between md:gap-4 p-2 md:p-3 xl:p-5">
        <div className="flex justify-between items-center w-full md:w-[105px] md:shrink-0 max-md:mb-5">
          <span className="mobile-subtitle1 md:hidden">
            {courseProgress.courseId.toUpperCase()}
          </span>
          <span className="max-md:hidden text-xl">{t('words.progress')}</span>
          <span className="mobile-subtitle1 text-darkOrange-5 md:hidden">
            {courseProgress.progressPercentage}%
          </span>
        </div>

        <ProgressBar
          courseCompletedChapters={courseProgress.completedChaptersCount}
          courseTotalChapters={courseProgress.totalChapters}
        />
        <span className="text-xl font-medium text-darkOrange-5 leading-normal w-[52px] shrink-0 text-end max-md:hidden">
          {courseProgress.progressPercentage}%
        </span>
        <div
          className={cn(
            courseProgress.progressPercentage === 100 ? 'hidden' : '',
          )}
        >
          <Link
            to={'/courses/$courseId/$chapterId'}
            params={{
              courseId: courseProgress.courseId,
              chapterId: courseProgress.nextChapter?.chapterId as string,
            }}
          >
            <ButtonWithArrow variant="outline" size="s">
              {t('dashboard.myCourses.resumeLesson')}
            </ButtonWithArrow>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const CourseExams = ({
  courseId,
  examLink,
  openLastExam = true,
}: {
  courseId: string;
  examLink: string;
  openLastExam?: boolean;
}) => {
  const { data: examResults, isFetched: isExamResultsFetched } =
    trpc.user.courses.getAllUserCourseExamResults.useQuery({
      courseId,
    });

  return (
    <div className="flex flex-col mt-4 md:mt-10 w-full">
      <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle max-md:mb-4">
        {t('dashboard.course.completionDiploma')}
      </h2>

      {!isExamResultsFetched && <Loader />}

      {isExamResultsFetched && examResults && examResults.length === 0 && (
        <>
          <p className="body-14px md:subtitle-large-med-20px text-dashboardSectionText/75 md:text-newBlack-1">
            {t('dashboard.course.completionExamInfo')}
          </p>
          <div className="flex justify-center items-center relative w-full max-w-[264px] md:max-w-[652px] mt-7 md:mt-10">
            <img src={CertificateSatoshiImage} alt="Certificate" />
            <img
              src={LockGif}
              alt="Locked"
              className="absolute size-16 md:size-24"
            />
          </div>
        </>
      )}

      {isExamResultsFetched && examResults && examResults?.length > 0 && (
        <CourseExamsTable
          examResults={examResults}
          courseId={courseId}
          examLink={examLink}
          openLastExam={openLastExam}
        />
      )}
    </div>
  );
};

const CourseExamsTable = ({
  examResults,
  courseId,
  examLink,
  openLastExam,
}: {
  examResults: CourseExamResults[];
  courseId: string;
  examLink: string;
  openLastExam?: boolean;
}) => {
  const isMobile = useSmaller('md');

  const [collapsedStates, setCollapsedStates] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleCollapse = (index: number) => {
    setCollapsedStates((prevState) => {
      const newState: { [key: number]: boolean } = {};

      for (const key in prevState) {
        newState[Number(key)] = false;
      }

      return {
        ...newState,
        [index]: !prevState[index],
      };
    });
  };

  return (
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
              new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
          )
          .map((exam, index) => {
            const isCollapsed = collapsedStates[index];

            if (
              openLastExam &&
              isCollapsed === undefined &&
              index === examResults.length - 1
            ) {
              setCollapsedStates({ [index]: true });
            }

            return (
              <div
                className={cn(
                  'flex flex-col py-2.5',
                  isCollapsed && 'bg-newGray-6 rounded-b-[20px]',
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
                    {new Date(exam.startedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                    })}
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
                        exam.succeeded ? 'text-brightGreen-6' : 'text-red-5',
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
                    'flex flex-col max-md:gap-4 w-full items-center',
                    isCollapsed ? 'w-full' : 'hidden',
                  )}
                >
                  {/* Succeeded exam */}
                  {exam.succeeded &&
                    (exam.isTimestamped ? (
                      <div className="flex flex-col w-full max-w-[549px] items-center max-md:px-3 max-md:pt-6 max-md:pb-3 pt-5">
                        <span className="subtitle-small-caps-14px text-newBlack-5">
                          {t('dashboard.myCourses.yourCertificate')}
                        </span>

                        {exam.imgKey && (
                          <img
                            src={`/api/files/${exam.imgKey}`}
                            alt="Certificate"
                            className="mt-4 md:mt-2.5"
                          />
                        )}

                        <div className="flex justify-between w-full mt-7 md:mt-5">
                          <a
                            href={`/api/files/zip/diplomas/${exam.id}`}
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              size={isMobile ? 's' : 'm'}
                              variant="primary"
                              className="items-center flex gap-2.5"
                            >
                              {t('dashboard.myCourses.download')}
                              <FiDownload className="size-[18px] md:size-6" />
                            </Button>
                          </a>

                          <div className="flex items-center gap-4">
                            <span className="text-xs italic font-light text-black max-md:hidden">
                              {t('dashboard.course.shareOnSocials')}
                            </span>
                            <div className="flex items-center gap-2.5">
                              <Link
                                to={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                  t('dashboard.course.tweetText', {
                                    courseId: courseId.toUpperCase(),
                                    certificateUrl: `${window.location.origin}/en/exam-certificates/${exam.id}`,
                                    score: `${exam.score}`,
                                    emoji:
                                      exam.score && exam.score >= 90
                                        ? '🏆'
                                        : '💪',
                                  }),
                                )}`}
                                target="_blank"
                              >
                                <Button variant="tertiary" size="s">
                                  <BsTwitterX size={18} />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                        <Link
                          to={'/tutorials/others/bcert-verification'}
                          target="_blank"
                          className="mt-4 self-start flex flex-row items-center gap-2 text-newBlack-5 hover:text-newOrange-5 hover:underline"
                        >
                          <ApprovedIcon className="size-4" />
                          <span>{t('dashboard.myCourses.verify')}</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex max-md:flex-col w-full gap-7 md:gap-10 md:py-5 md:px-2.5 max-md:pt-7">
                        <div className="flex justify-center items-center relative max-md:order-2 max-md:px-3 w-full max-w-[364px]">
                          <img
                            src={CertificateLockImage}
                            alt="Certificate"
                            className="w-full"
                          />
                        </div>

                        <div className="flex flex-col items-center justify-center w-full gap-4 md:gap-7 max-md:px-4">
                          <span className="whitespace-pre-line text-center body-14px-medium md:body-16px-medium text-newBlack-1">
                            {t('courses.exam.certificateGeneration')}
                            <TimeStampDialog />{' '}
                            {t('courses.exam.certificateAvailable')}
                          </span>
                          <img src={SandClockGif} alt="Time" />
                        </div>
                      </div>
                    ))}

                  {/* Failed exam */}
                  {!exam.succeeded && (
                    <div className="flex max-md:flex-col w-full gap-7 md:gap-10 md:py-5 md:px-2.5 max-md:pt-7">
                      <div className="flex justify-center items-center relative max-md:order-2 max-md:px-3 w-full max-w-[364px]">
                        <img
                          src={CertificateLockImage}
                          alt="Certificate"
                          className="w-full"
                        />
                      </div>
                      {!examResults.some((e) => e.succeeded) && (
                        <div className="flex flex-col items-center justify-center w-full gap-4 md:gap-7 max-md:px-4">
                          <span className="whitespace-pre-line text-center body-14px-medium md:body-16px-medium text-newBlack-1">
                            {t('courses.exam.dontGiveUpTryAgain')}
                          </span>
                          <img src={SandClockGif} alt="Time" />
                          <Link
                            to={examLink}
                            target="_blank"
                            className="w-fit"
                            disabled={
                              examResults
                                ? new Date(exam.startedAt).getTime() +
                                    oneDayInMs >
                                  Date.now()
                                : true
                            }
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
                      )}
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
  );
};

export const CourseRatings = ({ courseId }: { courseId: string }) => {
  const { data: previousCourseReview, isFetched: isReviewFetched } =
    trpc.user.courses.getCourseReview.useQuery({
      courseId: courseId,
    });

  return (
    <section className="flex flex-col mt-4 md:mt-10 w-full">
      <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
        {t('dashboard.course.ratingsAndFeedbacks')}
      </h2>

      {isReviewFetched && !previousCourseReview && (
        <p className="body-14px md:subtitle-large-med-20px text-dashboardSectionText/75 md:text-newBlack-1 mt-4 md:mt-10">
          {t('dashboard.course.submitReviewInfo')}
        </p>
      )}

      {isReviewFetched && previousCourseReview && (
        <p className="desktop-typo-1 md:body-16px text-dashboardSectionText/75 mt-4">
          {t('dashboard.course.feedbacks')}
        </p>
      )}

      <div className="w-full mt-5 md:mt-10">
        <div className="w-full max-w-[716px]">
          {isReviewFetched && !previousCourseReview && (
            <CourseReview courseId={courseId} isLockedReview />
          )}

          {previousCourseReview && (
            <CourseReview
              courseId={courseId}
              existingReview={previousCourseReview}
              isDashboardReview
            />
          )}
        </div>
      </div>
    </section>
  );
};
