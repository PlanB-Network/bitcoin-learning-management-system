import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { type JSX, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { CourseChapterResponse } from '@blms/types';
import { Button, cn } from '@blms/ui';

import congratsDark from '#src/assets/animations/congrats_animation_dark.webm';
import congratsDarkMobile from '#src/assets/animations/congrats_animation_dark_mobile.webm';
import completionStepsMobile from '#src/assets/courses/completion-steps-course-mobile.webp?no-inline';
import completionSteps from '#src/assets/courses/completion-steps-course.webp?no-inline';
import conclusionBlurred from '#src/assets/courses/conclusion_blurred.webp?no-inline';
import BookOpen from '#src/assets/icons/book_open.svg?react';
import Certificate from '#src/assets/icons/certificate.svg?react';
import FailurePixel from '#src/assets/icons/failure-pixelated.svg?react';
import Finish from '#src/assets/icons/finish.svg?react';
import HeartPixel from '#src/assets/icons/heart-pixelated.svg?react';
import LockGif from '#src/assets/icons/lock.gif?no-inline';
import Padlock from '#src/assets/icons/padlock.svg?react';
import BookPixel from '#src/assets/icons/pixelated/book.svg?react';
import SpeechIcon from '#src/assets/icons/speech_icon.svg?react';
import SuccessParty from '#src/assets/icons/success_party.svg?react';
import ThumbUp from '#src/assets/icons/thumb-up-pixelated.svg?react';
import { CourseCurriculum } from '#src/patterns/course-curriculum.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { trpc } from '#src/utils/trpc.ts';

import { useMutation, useQuery } from '@tanstack/react-query';
import { TbX } from 'react-icons/tb';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { ONE_DAY_IN_MS } from '#src/utils/date.ts';
import { CourseReviewComponent } from '../course-review-component.tsx';
import { ConclusionFinish } from './conclusion-finish.tsx';
import { StepMessage } from './step-message.tsx';

interface CourseConclusionProps {
  chapter: CourseChapterResponse;
}

const STEP_DURATION = 2100;

// TODO: Huge refactor needed here, this component is too big and complex (especially conditions)
export const CourseConclusion = ({ chapter }: CourseConclusionProps) => {
  const { i18n } = useTranslation();

  const { session } = useContext(AppContext);

  const [step, setStep] = useState(0);
  const [isAllClassicChaptersDone, setIsAllClassicChaptersDone] =
    useState(false);
  const [classicChapterCompletion, setClassicChapterCompletion] = useState(0);
  const [isCourseReviewSubmitted, setIsCourseReviewSubmitted] = useState(false);
  const [isCourseReviewSkipped, setIsCourseReviewSkipped] = useState(false);
  const [isCourseExamSkipped, setIsCourseExamSkipped] = useState(false);

  const { data: course } = useQuery(
    trpc.content.getCourse.queryOptions({
      id: chapter.courseId,
      language: i18n.language,
    }),
  );

  const { data: courseProgress, refetch: refetchCourseProgress } = useQuery(
    trpc.user.courses.getProgress.queryOptions(
      {
        courseId: course?.id ?? '',
      },
      {
        enabled: course !== undefined && !!session?.user,
      },
    ),
  );

  const { data: courseChapters } = useQuery(
    trpc.content.getCourseChapters.queryOptions({
      id: chapter.courseId,
      language: i18n.language,
    }),
  );

  const examChapterId = courseChapters?.find((c) => c.isCourseExam)?.chapterId;
  const reviewChapterId = courseChapters?.find(
    (c) => c.isCourseReview,
  )?.chapterId;
  const conclusionChapter = courseChapters?.find((c) => c.isCourseConclusion);

  const hasSingleTrialExamAndThreshold =
    course?.parts.some((part) =>
      part.chapters.some((chapter) => chapter.isSingleTrialExam),
    ) && !!course.passingGradeThreshold;
  const totalScore = courseProgress?.[0]?.totalScore;
  const hasPassedCourseThreshold =
    totalScore !== undefined &&
    totalScore !== null &&
    course?.passingGradeThreshold !== undefined &&
    course?.passingGradeThreshold !== null &&
    totalScore >= course.passingGradeThreshold;

  const completeAllChaptersMutation = useMutation(
    trpc.user.courses.completeAllChapters.mutationOptions({
      onSuccess: () => {
        refetchCourseProgress();
      },
    }),
  );

  const { data: courseReview } = useQuery(
    trpc.user.courses.getCourseReview.queryOptions(
      {
        courseId: course?.id || '',
      },
      {
        enabled: step >= 1,
      },
    ),
  );

  const { data: previousExamResults } = useQuery(
    trpc.user.courses.getLatestExamResults.queryOptions(
      {
        courseId: chapter.courseId,
      },
      {
        enabled: step >= 2 && !hasSingleTrialExamAndThreshold,
      },
    ),
  );

  const completeChapterMutation = useMutation(
    trpc.user.courses.completeChapter.mutationOptions(),
  );

  const completedChapters = courseProgress?.[0]?.chapters;

  function updateStep(step: number, forceScroll = false) {
    if (forceScroll) {
      scrollToHeader();
    }
    setStep(step);
  }

  function completeConclusionChapter() {
    const progress = courseProgress?.[0];
    if (progress && progress.progressPercentage < 100) {
      if (conclusionChapter && course) {
        completeChapterMutation.mutate({
          chapterId: conclusionChapter.chapterId,
          courseId: course?.id,
          language: i18n.language,
        });
      }
    }
  }

  useEffect(() => {
    if (step === 0 && session?.user) {
      setTimeout(() => updateStep(1, false), 1000);
    }
  }, [step, session]);

  useEffect(() => {
    if (course && courseProgress) {
      const completedChaptersIds = [
        completedChapters?.map((c) => c.chapterId),
      ].flat();

      const classicChapters = course?.parts
        .flatMap((p) => p.chapters)
        .filter(
          (c) =>
            c &&
            !c?.isCourseConclusion &&
            !c?.isCourseExam &&
            !c?.isCourseReview &&
            !c?.isSingleTrialExam,
        );

      const unfinishedClassicChapters = classicChapters.filter(
        (c) => c && !completedChaptersIds?.includes(c.chapterId),
      );

      setClassicChapterCompletion(
        Math.round(
          ((classicChapters.length - unfinishedClassicChapters.length) /
            classicChapters.length) *
            100,
        ),
      );

      if (unfinishedClassicChapters && unfinishedClassicChapters.length === 0) {
        setIsAllClassicChaptersDone(true);
      }
    }
  }, [completedChapters, course, courseProgress, isAllClassicChaptersDone]);

  useEffect(() => {
    if (isAllClassicChaptersDone && step === 1) {
      setTimeout(() => updateStep(2), STEP_DURATION);
    }
  }, [isAllClassicChaptersDone, step]);

  useEffect(() => {
    if (
      (courseReview || isCourseReviewSubmitted || isCourseReviewSkipped) &&
      step === 2
    ) {
      setTimeout(() => updateStep(3), STEP_DURATION);
    }
  }, [courseReview, isCourseReviewSubmitted, isCourseReviewSkipped, step]);

  useEffect(() => {
    if (isCourseExamSkipped && step === 3) {
      setTimeout(() => updateStep(6), STEP_DURATION);
    }
    if (
      (previousExamResults?.succeeded || hasSingleTrialExamAndThreshold) &&
      step === 3
    ) {
      setTimeout(
        () => updateStep(isCourseReviewSkipped ? 6 : 4),
        STEP_DURATION,
      );
    }
  }, [previousExamResults, isCourseExamSkipped, step]);

  useEffect(() => {
    if (step === 4) {
      completeChapterMutation.mutate({
        courseId: chapter.course.id,
        chapterId: chapter.chapterId,
        language: chapter.language,
      });
      updateStep(5);
    }
  }, [step, completeChapterMutation, chapter]);

  useEffect(() => {
    document.body.style.overflow = step === 5 ? 'hidden' : 'auto';

    if (step === 6 && !isCourseReviewSkipped && !isCourseExamSkipped) {
      completeConclusionChapter();
    }
  }, [step]);

  useEffect(() => {
    if (!examChapterId) {
      completeConclusionChapter();
    }
  }, [step]);

  useEffect(() => {
    scrollToHeader();
  }, []);

  const lineContainerClass = 'flex items-center w-full h-12 md:h-[100px]';
  const lineSizeClass = 'w-full h-1 md:h-[5px] rounded-l-full';
  const linkMainClass = `${lineSizeClass} bg-newGray-5`;
  const linkSubClass = `${lineSizeClass}absolute bg-gradient-to-r from-white to-darkOrange-5 transition-all ease-in-out start-animation`;
  const iconSizeClass = 'size-7 md:size-14';
  const stepMessageIconClass = 'size-10 md:size-20 mx-auto';
  const stepPercentageClass =
    'label-small-med-12px md:title-large-sb-24px text-darkOrange-5 text-center';
  const titleStepClass =
    'text-newGray-1 subtitle-small-caps-14px md:subtitle-medium-caps-18px';

  const isMobile = useSmaller('md');
  const now = new Date();

  if (
    conclusionChapter?.releaseDate &&
    conclusionChapter.releaseDate.getTime() > now.getTime()
  ) {
    return (
      <div className="relative flex items-center w-full h-28 md:h-40 rounded-lg border border-newGray-5 bg-gradient-to-b from-white/75 to-[#e2e2e2]/75">
        <img
          src={conclusionBlurred}
          alt="Congratulations"
          className="absolute opacity-30"
        />
        <div className="absolute flex flex-row ml-6 md:ml-20 p-2 gap-4 items-center">
          <Padlock className={cn(iconSizeClass, 'fill-newOrange-1')} />
          <p className="text-black font-semibold">
            {t('dashboard.course.conclusionNotReleased')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="text-darkOrange-5 text-2xl leading-snug max-md:title-medium-sb-18px">
        {t('courses.conclusion.congratulationsEnd')}
      </p>
      {session?.user && (examChapterId || conclusionChapter?.releaseDate) ? (
        <>
          <p className="text-newBlack-1 body-16px mb-3 max-md:hidden">
            {step >= 5
              ? t('courses.conclusion.finalStep')
              : t('courses.conclusion.stepsToComplete')}
          </p>
          <div
            className={cn('flex flex-row', step >= 5 ? 'md:pb-3' : 'md:pb-8')}
            id="progressBar"
          >
            <div
              className={cn(
                lineContainerClass,
                'w-[26px] md:w-[70px] shrink-0',
              )}
            >
              <div className={cn(linkMainClass, 'w-full shrink-0')}>
                {step >= 0 ? (
                  <div className={cn(linkSubClass, '!duration-1000')} />
                ) : null}
              </div>
            </div>

            <HeaderBox
              text={t('words.chapters')}
              isDone={step >= 1 && isAllClassicChaptersDone}
              isCurrentStep={step === 1}
            >
              {step < 1 ? (
                <BookOpen
                  className={cn(
                    iconSizeClass,
                    step === 1 ? 'fill-newOrange-1' : 'fill-newGray-5',
                  )}
                />
              ) : step === 1 && !isAllClassicChaptersDone ? (
                <span className={stepPercentageClass}>
                  {classicChapterCompletion}%
                </span>
              ) : (
                <ThumbUp className={cn(iconSizeClass, 'fill-white')} />
              )}
            </HeaderBox>
            <div className={lineContainerClass}>
              <div className={linkMainClass}>
                {step >= 1 && isAllClassicChaptersDone ? (
                  <div className={linkSubClass} />
                ) : null}
              </div>
            </div>

            <HeaderBox
              text={t('courses.review.feedback')}
              isDone={step >= 2 && (!!courseReview || isCourseReviewSubmitted)}
              isCurrentStep={step === 2 || isCourseReviewSkipped}
            >
              {step < 2 || (!courseReview && !isCourseReviewSubmitted) ? (
                <SpeechIcon
                  className={cn(
                    iconSizeClass,
                    step === 2 || isCourseReviewSkipped
                      ? 'fill-newOrange-1'
                      : 'fill-newGray-5',
                  )}
                />
              ) : (
                <HeartPixel className={cn(iconSizeClass, 'fill-white')} />
              )}
            </HeaderBox>
            <div className={lineContainerClass}>
              <div className={linkMainClass}>
                {step >= 2 &&
                (courseReview ||
                  isCourseReviewSubmitted ||
                  isCourseReviewSkipped) ? (
                  <div className={linkSubClass} />
                ) : null}
              </div>
            </div>

            <HeaderBox
              text={t('words.exam')}
              isDone={
                step >= 3 &&
                (!!previousExamResults?.succeeded ||
                  !!hasSingleTrialExamAndThreshold)
              }
              isCurrentStep={step === 3 || isCourseExamSkipped}
            >
              {step < 3 ||
              (!previousExamResults && !hasSingleTrialExamAndThreshold) ? (
                <BookPixel
                  className={cn(
                    iconSizeClass,
                    step === 3 || isCourseExamSkipped
                      ? 'fill-newOrange-1'
                      : 'fill-newGray-5',
                  )}
                />
              ) : (
                <>
                  {hasSingleTrialExamAndThreshold ? (
                    <Certificate
                      className={cn(iconSizeClass, 'filter-white')}
                    />
                  ) : previousExamResults?.succeeded ? (
                    <SuccessParty className={cn(iconSizeClass, 'fill-white')} />
                  ) : (
                    <span className={stepPercentageClass}>
                      {previousExamResults?.score}%
                    </span>
                  )}
                </>
              )}
            </HeaderBox>
            <div className={lineContainerClass}>
              <div className={linkMainClass}>
                {step >= 3 &&
                (previousExamResults?.succeeded ||
                  !!hasSingleTrialExamAndThreshold ||
                  isCourseExamSkipped) ? (
                  <div className={linkSubClass} />
                ) : null}
              </div>
            </div>

            <HeaderBox
              text={t('words.congrats')}
              isDone={
                step >= 4 && !isCourseExamSkipped && !isCourseReviewSkipped
              }
              isCurrentStep={
                step === 6 && (isCourseExamSkipped || isCourseReviewSkipped)
              }
            >
              {step <= 3 ? (
                <Finish className={cn(iconSizeClass, 'fill-newGray-5')} />
              ) : isCourseExamSkipped || isCourseReviewSkipped ? (
                <Padlock className={cn(iconSizeClass, 'fill-newOrange-1')} />
              ) : (
                <Finish className={cn(iconSizeClass, 'fill-white')} />
              )}
            </HeaderBox>
          </div>

          <div
            className={cn(
              step >= 5
                ? ''
                : 'bg-maroon-1 p-2 md:px-[30px] md:py-8 rounded-[10px] md:rounded-[20px] shadow-course-navigation',
            )}
          >
            {course && step <= 1 ? (
              isAllClassicChaptersDone ? (
                <StepMessage
                  title={t('words.chapters')}
                  headline={t('courses.conclusion.completedChaptersHeadline')}
                  icon={
                    <ThumbUp
                      className={cn(stepMessageIconClass, 'fill-darkOrange-5')}
                    />
                  }
                />
              ) : (
                <section className="flex flex-col w-full gap-5 md:gap-[30px]">
                  <p className={titleStepClass}>{t('words.chapters')}</p>
                  <p className="text-newBlack-1 body-16px md:subtitle-large-18px whitespace-pre-line">
                    {t('dashboard.course.conclusionHeadline')}
                  </p>
                  <CourseCurriculum
                    course={course}
                    completedChapters={completedChapters?.map(
                      (chapter) => chapter.chapterId,
                    )}
                    nextChapter={courseProgress?.[0]?.nextChapter?.chapterId}
                    hideGithubLink
                    displayNotStarted
                    expandAll
                    className="self-start w-full md:mt-2.5"
                  />
                  {step > 1 ? null : (
                    <Button
                      className="ml-auto mr-6"
                      onClick={() => {
                        scrollToHeader();
                        completeAllChaptersMutation.mutate({
                          courseId: chapter.course.id,
                          language: chapter.language,
                        });
                      }}
                    >
                      {t('dashboard.myCourses.completeAll')}
                    </Button>
                  )}
                </section>
              )
            ) : null}

            {step === 2 ? (
              courseReview || isCourseReviewSubmitted ? (
                <StepMessage
                  title={t('courses.review.feedback')}
                  headline={t('courses.conclusion.completedFeedbackHeadline')}
                  subHeadline={t(
                    'courses.conclusion.completedFeedbackSubHeadline',
                  )}
                  icon={
                    <HeartPixel
                      className={cn(stepMessageIconClass, 'fill-darkOrange-5')}
                    />
                  }
                />
              ) : (
                <section className="flex flex-col w-full gap-5 md:gap-[30px]">
                  <span className={titleStepClass}>
                    {t('courses.review.feedback')}
                  </span>
                  <div>
                    {course && reviewChapterId ? (
                      <CourseReviewComponent
                        courseId={course?.id}
                        chapterId={reviewChapterId}
                        isConclusionReview
                        onReviewSuccess={() => setIsCourseReviewSubmitted(true)}
                        onSkip={() => {
                          scrollToHeader();
                          setIsCourseReviewSkipped(true);
                        }}
                      />
                    ) : null}
                  </div>
                </section>
              )
            ) : null}

            {step >= 3 && step <= 4 ? (
              hasSingleTrialExamAndThreshold ? (
                <StepMessage
                  title={t('courses.exam.finalScore')}
                  headline={
                    <>
                      <p className="whitespace-pre-line">
                        {hasPassedCourseThreshold
                          ? t('courses.exam.successfulPassedThreshold')
                          : t('courses.exam.solidEffort')}
                      </p>
                      <br />
                      <span>
                        {t('courses.exam.score')}{' '}
                        <span
                          className={cn(
                            'font-semibold',
                            hasPassedCourseThreshold
                              ? 'text-brightGreen-5'
                              : 'text-red-5',
                          )}
                        >
                          {totalScore || 'N/A'}%
                        </span>
                      </span>
                    </>
                  }
                  icon={
                    hasPassedCourseThreshold ? (
                      <SuccessParty
                        className={cn(
                          stepMessageIconClass,
                          'fill-brightGreen-5',
                        )}
                      />
                    ) : (
                      <Certificate
                        className={cn(stepMessageIconClass, 'fill-red-5')}
                      />
                    )
                  }
                />
              ) : (
                <StepMessage
                  title={t('courses.exam.finalExam')}
                  headline={
                    previousExamResults ? (
                      previousExamResults.succeeded ? (
                        <Trans i18nKey={'courses.exam.congratulationsPassed'}>
                          <span className="font-semibold">{'passed'}</span>
                        </Trans>
                      ) : (
                        <>
                          <Trans i18nKey={'courses.exam.oopsFailed'}>
                            <span className="font-semibold">{'failed'}</span>
                          </Trans>
                          <br />
                          <span>
                            {t('courses.exam.score')}{' '}
                            <span
                              className={cn(
                                'font-semibold',
                                previousExamResults.succeeded
                                  ? 'text-brightGreen-5'
                                  : 'text-red-5',
                              )}
                            >
                              {previousExamResults.score}%
                            </span>
                          </span>
                          <br />
                          {!previousExamResults.succeeded &&
                            t('courses.exam.dontWorryRetake')}
                        </>
                      )
                    ) : (
                      t('courses.conclusion.takeFinalExam')
                    )
                  }
                  icon={
                    previousExamResults ? (
                      previousExamResults.succeeded ? (
                        <SuccessParty
                          className={cn(
                            stepMessageIconClass,
                            'fill-brightGreen-5',
                          )}
                        />
                      ) : (
                        <FailurePixel
                          className={cn(stepMessageIconClass, 'fill-red-5')}
                        />
                      )
                    ) : (
                      <BookPixel
                        className={cn(
                          stepMessageIconClass,
                          'fill-darkOrange-5',
                        )}
                      />
                    )
                  }
                  actionButton={
                    previousExamResults?.succeeded ? undefined : (
                      <div className="flex max-md:flex-col gap-4">
                        <Button
                          disabled={
                            previousExamResults
                              ? previousExamResults.succeeded
                                ? false
                                : new Date(
                                    previousExamResults.startedAt,
                                  ).getTime() +
                                    ONE_DAY_IN_MS >
                                  Date.now()
                              : false
                          }
                        >
                          <Link
                            to="/courses/$courseId/$chapterId"
                            params={{
                              courseId: course?.id,
                              chapterId: examChapterId,
                            }}
                          >
                            {previousExamResults
                              ? t('courses.exam.tryAgain')
                              : t('courses.exam.takeExam')}
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-fit mx-auto"
                          onClick={() => {
                            scrollToHeader();
                            setIsCourseExamSkipped(true);
                          }}
                        >
                          {t('words.skip')}
                        </Button>
                      </div>
                    )
                  }
                />
              )
            ) : null}

            {step === 5 && (
              <div className="fixed inset-0 flex justify-center items-center bg-black md:bg-black/80 md:backdrop-blur-md z-50">
                <button
                  onClick={() => updateStep(6)}
                  className="absolute top-4 right-4 z-10"
                  type="button"
                >
                  <TbX className="size-8 text-white hover:opacity-80 transition-opacity" />
                </button>

                {isMobile ? (
                  <video
                    className="relative w-full max-h-full"
                    src={congratsDarkMobile}
                    autoPlay
                    muted
                    preload="auto"
                    onEnded={() => {
                      updateStep(6);
                    }}
                  />
                ) : (
                  <div className="flex justify-center w-full max-h-[85%] bg-black px-[100px]">
                    <video
                      className="relative w-full"
                      src={congratsDark}
                      autoPlay
                      muted
                      preload="auto"
                      onEnded={() => {
                        updateStep(6);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {step === 6 && course ? (
              <ConclusionFinish
                course={course}
                examResults={previousExamResults ?? undefined}
                hasSingleTrialExamAndThreshold={hasSingleTrialExamAndThreshold}
                hasPassedCourseThreshold={hasPassedCourseThreshold}
              />
            ) : null}
          </div>
        </>
      ) : course ? (
        <>
          {session?.user || !examChapterId ? (
            <p className="text-newBlack-1 body-16px mb-3 max-md:hidden">
              {t('courses.conclusion.finalStep')}
            </p>
          ) : (
            <>
              <div className="relative w-full aspect-[110/25] md:aspect-[110/18] rounded-lg overflow-hidden">
                <img
                  src={completionSteps}
                  alt="Congratulations"
                  className="absolute w-full top-5 object-cover aspect-auto max-md:hidden"
                />
                <img
                  src={completionStepsMobile}
                  alt="Congratulations"
                  className="absolute w-full top-1 object-cover aspect-auto md:hidden"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-[#e2e2e2]/80 backdrop-blur-xs md:backdrop-blur-md flex items-center justify-center md:gap-6">
                  <img
                    src={LockGif}
                    alt="Lock"
                    className="size-11 md:size-[74px] shrink-0"
                  />
                  <p className="text-black body-medium-12px md:subtitle-medium-med-16px w-full max-w-[831px] flex flex-col">
                    <span>{t('courses.conclusion.unlockFeatures1')}</span>
                    <span className="max-md:hidden">
                      {t('courses.conclusion.unlockFeatures2')}
                    </span>
                  </p>
                </div>
              </div>
            </>
          )}
          <div>
            <ConclusionFinish course={course} />
          </div>
        </>
      ) : null}
    </>
  );
};

interface HeaderBoxProps {
  children: string | JSX.Element;
  text?: string;
  isDone: boolean;
  isCurrentStep?: boolean;
}

const HeaderBox = ({
  children,
  text,
  isDone,
  isCurrentStep,
}: HeaderBoxProps) => {
  return (
    <div className="flex flex-col max-w-12 md:max-w-[100px] gap-4">
      <div
        className={cn(
          'size-12 md:size-[100px] border-4 rounded-xl flex flex-col items-center justify-center z-10 shrink-0',
          isDone
            ? 'border-darkOrange-1 bg-darkOrange-5 shadow-course-navigation-sm'
            : isCurrentStep
              ? 'border-darkOrange-5 shadow-sm-card-dark'
              : 'border-newGray-5',
        )}
      >
        {children}
      </div>
      {text && (
        <span
          className={cn(
            'text-center text-wrap title-medium-sb-18px max-md:hidden',
            isDone || isCurrentStep ? 'text-newBlack-1' : 'text-newGray-4',
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
};

function scrollToHeader() {
  const element = document.querySelector('#headerChapter');
  if (element) {
    const yOffset = -110;
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}
