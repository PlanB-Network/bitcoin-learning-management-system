import type { CourseExamResults } from '@blms/types';
import { Button, cn, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsTwitterX } from 'react-icons/bs';
import { FiDownload } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { IoReload } from 'react-icons/io5';
import CertificateLockImage from '#src/assets/courses/completion-diploma-lock.webp?no-inline';
import CertificateSatoshiImage from '#src/assets/courses/completion-diploma-satoshi.webp?no-inline';
import ApprovedIcon from '#src/assets/icons/approved.svg?react';
import LockGif from '#src/assets/icons/lock.gif?no-inline';
import SandClockGif from '#src/assets/icons/sandClock/sandclock.gif?no-inline';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { TimeStampDialog } from '#src/routes/$lang/_content/courses/$courseId/-components/course-exam/course-exam-result.tsx';
import { AnswersReviewPanel } from '#src/routes/$lang/_content/courses/$courseId/-components/shared-between-exams/answers-review-panel.tsx';
import { ONE_DAY_IN_MS } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const CourseRetakeExam = ({
  courseId,
  courseIndex,
  examLink,
  openLastExam = true,
}: {
  courseId: string;
  courseIndex: string;
  examLink: string;
  openLastExam?: boolean;
}) => {
  const { data: examResults, isFetched: isExamResultsFetched } = useQuery(
    trpc.user.courses.getAllUserCourseExamResults.queryOptions({
      courseId,
    }),
  );

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
          courseIndex={courseIndex}
          examLink={examLink}
          openLastExam={openLastExam}
        />
      )}
    </div>
  );
};

const CourseExamsTable = ({
  examResults,
  courseIndex,
  examLink,
  openLastExam,
}: {
  examResults: CourseExamResults[];
  courseIndex: string;
  examLink: string;
  openLastExam?: boolean;
}) => {
  const isMobile = useSmaller('md');
  const { i18n } = useTranslation();

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
        <div className="h-px bg-newGray-1" />
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
                key={exam.id}
              >
                <button
                  type="button"
                  onClick={() => toggleCollapse(index)}
                  className="cursor-pointer hover:font-medium body-14px md:body-16px text-newBlack-1 flex md:justify-between items-center px-2.5 text-start"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleCollapse(index);
                    }
                  }}
                >
                  <span className="pl-1 w-fit md:w-[180px] max-md:mr-auto">
                    {new Date(exam.startedAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="max-md:hidden w-full max-w-[503px]">
                    {t('words.online')}
                  </span>
                  <span
                    className={cn(
                      'md:text-center font-medium w-[70px] md:w-[130px]',
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
                </button>
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

                        <div className="flex max-md:flex-col max-md:items-center md:justify-between w-full mt-7 md:mt-5">
                          <a
                            href={`/api/files/zip/diplomas/${exam.id}`}
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              size={'m'}
                              variant="primary"
                              className="items-center flex gap-2.5"
                            >
                              {t('dashboard.myCourses.download')}
                              <FiDownload className="size-[18px] md:size-6" />
                            </Button>
                          </a>

                          <div className="flex items-center gap-4 max-md:hidden ">
                            <Link
                              to={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                t('dashboard.course.tweetText', {
                                  certificateUrl: `${window.location.origin}/${i18n.language ?? 'en'}/exam-certificates/${exam.id}`,
                                  courseIndex: courseIndex.toUpperCase(),
                                  emoji:
                                    exam.score && exam.score >= 90
                                      ? '🏆'
                                      : '💪',
                                  score: `${exam.score}`,
                                }),
                              )}`}
                              target="_blank"
                              className="w-fit"
                            >
                              <Button
                                variant="outline"
                                size="m"
                                className="flex gap-2.5 !font-normal"
                              >
                                {t('dashboard.myCourses.shareOn')}
                                <BsTwitterX size={24} />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <Link
                          to={
                            '/tutorials/contribution/others/pbn-certificate-timestamping-dd16f8c0-00c1-45fd-8792-920612bed18f'
                          }
                          target="_blank"
                          className="mt-4 md:mt-1 md:self-start max-md:self-center flex flex-row items-center gap-2 text-newBlack-5 hover:text-newOrange-5 hover:underline max-md:order-3"
                        >
                          <ApprovedIcon className="size-4" />
                          <span>{t('dashboard.myCourses.verify')}</span>
                        </Link>
                        <Link
                          to={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            t('dashboard.course.tweetText', {
                              certificateUrl: `${window.location.origin}/${i18n.language ?? 'en'}/exam-certificates/${exam.id}`,
                              courseIndex: courseIndex.toUpperCase(),
                              emoji:
                                exam.score && exam.score >= 90 ? '🏆' : '💪',
                              score: `${exam.score}`,
                            }),
                          )}`}
                          target="_blank"
                          className="w-fit md:hidden mt-4"
                        >
                          <Button variant="outline" size="m">
                            Share on
                            <BsTwitterX size={18} className="ml-1.5" />
                          </Button>
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
                                    ONE_DAY_IN_MS >
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
                                      ONE_DAY_IN_MS >
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
