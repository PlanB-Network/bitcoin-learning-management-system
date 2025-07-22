import type {
  CourseChapterResponse,
  CourseExamResultsExtended,
  CourseProgressExtended,
  CourseResponse,
  CourseReview,
} from '@blms/types';
import { Button, cn, RadialGauge } from '@blms/ui';
import {
  type UseMutationResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { type JSX, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { TbX } from 'react-icons/tb';
import congratsDark from '#src/assets/animations/congrats_animation_dark.webm';
import congratsDarkMobile from '#src/assets/animations/congrats_animation_dark_mobile.webm';
import completionSteps from '#src/assets/courses/completion-steps-course.webp?no-inline';
import completionStepsMobile from '#src/assets/courses/completion-steps-course-mobile.webp?no-inline';
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
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { CourseCurriculum } from '#src/patterns/course-curriculum.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { ONE_DAY_IN_MS } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';
import { CourseReviewComponent } from '../course-review-component.tsx';
import { ConclusionFinish } from './conclusion-finish.tsx';
import { StepMessage } from './step-message.tsx';

interface CourseConclusionProps {
  chapter: CourseChapterResponse;
}

const STEP_DURATION = 2100;
const INITIAL_STEP_DELAY = 1000;

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
      { courseId: course?.id ?? '' },
      { enabled: course !== undefined && !!session?.user },
    ),
  );

  const { data: courseChapters } = useQuery(
    trpc.content.getCourseChapters.queryOptions({
      id: chapter.courseId,
      language: i18n.language,
    }),
  );

  const { data: courseReview } = useQuery(
    trpc.user.courses.getCourseReview.queryOptions(
      { courseId: course?.id || '' },
      { enabled: step >= 1 },
    ),
  );

  const hasAssignment = course?.hasAssignment;
  const hasSingleTrialExamOrAssignment =
    course?.parts.some((part) =>
      part.chapters.some((chapter) => chapter.isSingleTrialExam),
    ) || hasAssignment;

  const { data: previousExamResults } = useQuery(
    trpc.user.courses.getLatestExamResults.queryOptions(
      { courseId: chapter.courseId },
      { enabled: step >= 2 && !hasSingleTrialExamOrAssignment },
    ),
  );

  const completeAllChaptersMutation = useMutation(
    trpc.user.courses.completeAllChapters.mutationOptions({
      onSuccess: () => refetchCourseProgress(),
    }),
  );

  const completeChapterMutation = useMutation(
    trpc.user.courses.completeChapter.mutationOptions(),
  );

  const now = new Date();
  const isProfessorLed = course?.teachingFormat === 'professor_led';
  const completedChapters = courseProgress?.[0]?.chapters;
  const totalScore = courseProgress?.[0]?.totalScore;

  const multiAttemptsExamChapterId = courseChapters?.find(
    (c) => c.isCourseExam,
  )?.chapterId;

  const reviewChapterId = courseChapters?.find(
    (c) => c.isCourseReview,
  )?.chapterId;

  const conclusionChapter = courseChapters?.find((c) => c.isCourseConclusion);

  const isConclusionNotReleased =
    conclusionChapter?.releaseDate &&
    conclusionChapter.releaseDate.getTime() > now.getTime();

  const hasPassedCourseThreshold =
    totalScore !== undefined &&
    totalScore !== null &&
    course?.passingGradeThreshold !== undefined &&
    course?.passingGradeThreshold !== null &&
    totalScore >= course.passingGradeThreshold;

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

  // Effects for step progression
  useEffect(() => {
    if (step === 0 && session?.user) {
      setTimeout(() => updateStep(1, false), INITIAL_STEP_DELAY);
    }
  }, [step, session]);

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
      (previousExamResults?.succeeded || hasSingleTrialExamOrAssignment) &&
      step === 3
    ) {
      setTimeout(() => updateStep(4), STEP_DURATION);
    }
  }, [
    previousExamResults,
    isCourseExamSkipped,
    step,
    hasSingleTrialExamOrAssignment,
  ]);

  useEffect(() => {
    if (step === 4) {
      completeChapterMutation.mutate({
        chapterId: chapter.chapterId,
        courseId: chapter.course.id,
        language: chapter.language,
      });
      updateStep(5);
    }
  }, [step, completeChapterMutation, chapter]);

  // Effects for chapter completion tracking
  useEffect(() => {
    if (course && courseProgress) {
      const completedChaptersIds =
        completedChapters?.map((c) => c.chapterId) ?? [];

      const classicChapters = course.parts
        .flatMap((p) => p.chapters)
        .filter(
          (c) =>
            c &&
            !c.isCourseConclusion &&
            !c.isCourseExam &&
            !c.isCourseReview &&
            !c.isSingleTrialExam,
        );

      const unfinishedClassicChapters = classicChapters.filter(
        (c) => c && !completedChaptersIds.includes(c.chapterId),
      );

      const completionPercentage = Math.round(
        ((classicChapters.length - unfinishedClassicChapters.length) /
          classicChapters.length) *
          100,
      );

      setClassicChapterCompletion(completionPercentage);

      if (unfinishedClassicChapters.length === 0) {
        setIsAllClassicChaptersDone(true);
      }
    }
  }, [completedChapters, course, courseProgress]);

  // Effects for UI/completion logic
  useEffect(() => {
    document.body.style.overflow = step === 5 ? 'hidden' : 'auto';

    if (step === 6 && !isCourseReviewSkipped && !isCourseExamSkipped) {
      completeConclusionChapter();
    }
  }, [step, isCourseReviewSkipped, isCourseExamSkipped]);

  useEffect(() => {
    if (!multiAttemptsExamChapterId && !hasSingleTrialExamOrAssignment) {
      completeConclusionChapter();
    }
  }, [multiAttemptsExamChapterId, hasSingleTrialExamOrAssignment]);

  useEffect(() => {
    scrollToHeader();
  }, []);

  const iconSizeClass = 'size-7 md:size-14';

  if (isConclusionNotReleased) {
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

  const hasExamOrAssignment =
    multiAttemptsExamChapterId || hasSingleTrialExamOrAssignment;
  const showFinalStep = step >= 5;
  const showProgressSteps = session?.user && hasExamOrAssignment;

  return (
    <>
      <p className="text-darkOrange-5 text-2xl leading-snug max-md:title-medium-sb-18px">
        {t('courses.conclusion.congratulationsEnd')}
      </p>

      {showProgressSteps ? (
        <>
          <p className="text-newBlack-1 body-16px mb-3 max-md:hidden">
            {showFinalStep
              ? t('courses.conclusion.finalStep')
              : t('courses.conclusion.stepsToComplete')}
          </p>

          <ProgressBar
            step={step}
            iconSizeClass={iconSizeClass}
            classicChapterCompletion={classicChapterCompletion}
            isAllClassicChaptersDone={isAllClassicChaptersDone}
            isCourseReviewSubmitted={isCourseReviewSubmitted}
            isCourseReviewSkipped={isCourseReviewSkipped}
            isCourseExamSkipped={isCourseExamSkipped}
            hasSingleTrialExamOrAssignment={hasSingleTrialExamOrAssignment}
            courseReview={courseReview}
            previousExamResults={previousExamResults}
          />

          <StepsContent
            course={course}
            chapter={chapter}
            step={step}
            isAllClassicChaptersDone={isAllClassicChaptersDone}
            completedChapters={completedChapters}
            reviewChapterId={reviewChapterId}
            courseReview={courseReview}
            courseProgress={courseProgress}
            previousExamResults={previousExamResults}
            isProfessorLed={isProfessorLed}
            totalScore={totalScore}
            hasPassedCourseThreshold={hasPassedCourseThreshold}
            multiAttemptsExamChapterId={multiAttemptsExamChapterId}
            hasSingleTrialExamOrAssignment={hasSingleTrialExamOrAssignment}
            isCourseReviewSubmitted={isCourseReviewSubmitted}
            setIsCourseReviewSubmitted={setIsCourseReviewSubmitted}
            setIsCourseReviewSkipped={setIsCourseReviewSkipped}
            setIsCourseExamSkipped={setIsCourseExamSkipped}
            updateStep={updateStep}
            completeAllChaptersMutation={completeAllChaptersMutation}
          />
        </>
      ) : course ? (
        <>
          {session?.user || !multiAttemptsExamChapterId ? (
            <p className="text-newBlack-1 body-16px mb-3 max-md:hidden">
              {t('courses.conclusion.finalStep')}
            </p>
          ) : (
            <LockedBar />
          )}
          <div>
            <ConclusionFinish course={course} isProfessorLed={isProfessorLed} />
          </div>
        </>
      ) : null}
    </>
  );
};

interface ProgressBarProps {
  step: number;
  iconSizeClass: string;
  classicChapterCompletion: number;
  isAllClassicChaptersDone: boolean;
  isCourseReviewSubmitted: boolean;
  isCourseReviewSkipped: boolean;
  isCourseExamSkipped: boolean;
  hasSingleTrialExamOrAssignment?: boolean;
  courseReview?: CourseReview | null;
  previousExamResults?: CourseExamResultsExtended | null;
}

const ProgressBar = ({
  step,
  iconSizeClass,
  classicChapterCompletion,
  isAllClassicChaptersDone,
  isCourseReviewSubmitted,
  isCourseReviewSkipped,
  isCourseExamSkipped,
  hasSingleTrialExamOrAssignment,
  courseReview,
  previousExamResults,
}: ProgressBarProps) => {
  const lineContainerClass = 'flex items-center w-full h-12 md:h-[100px]';
  const lineSizeClass = 'w-full h-1 md:h-[5px] rounded-l-full';
  const linkMainClass = `${lineSizeClass} bg-newGray-5`;
  const linkSubClass = `${lineSizeClass}absolute bg-gradient-to-r from-white to-darkOrange-5 transition-all ease-in-out start-animation`;
  const stepPercentageClass =
    'label-small-med-12px md:title-large-sb-24px text-darkOrange-5 text-center';

  // Chapter conditions
  const isChapterStepComplete = step >= 1 && isAllClassicChaptersDone;
  const isCurrentlyOnChapterStep = step === 1;
  const isChapterStepNotReached = step < 1;
  const isChapterStepInProgress = step === 1 && !isAllClassicChaptersDone;

  // Review conditions
  const hasCourseReviewData = !!courseReview || isCourseReviewSubmitted;
  const isReviewStepComplete = step >= 2 && hasCourseReviewData;
  const isCurrentlyOnReviewStep = step === 2 || isCourseReviewSkipped;
  const isReviewStepNotReachedOrIncomplete =
    step < 2 || (!courseReview && !isCourseReviewSubmitted);
  const canProgressFromReviewStep =
    step >= 2 &&
    (courseReview || isCourseReviewSubmitted || isCourseReviewSkipped);

  // Exam conditions
  const hasExamSucceeded = !!previousExamResults?.succeeded;
  const isExamStepComplete =
    step >= 3 && (hasExamSucceeded || !!hasSingleTrialExamOrAssignment);
  const isCurrentlyOnExamStep = step === 3 || isCourseExamSkipped;
  const isExamStepNotReachedOrNoData =
    step < 3 || (!previousExamResults && !hasSingleTrialExamOrAssignment);
  const canProgressFromExamStep =
    step >= 3 &&
    (hasExamSucceeded ||
      !!hasSingleTrialExamOrAssignment ||
      isCourseExamSkipped);

  // Final conditions
  const isFinalStepComplete =
    step >= 4 && !isCourseExamSkipped && !isCourseReviewSkipped;
  const isCurrentlyOnLockedFinalStep =
    step === 6 && (isCourseExamSkipped || isCourseReviewSkipped);
  const isFinalStepNotReached = step <= 3;
  const isFinalStepLocked = isCourseExamSkipped || isCourseReviewSkipped;

  return (
    <div
      className={cn('flex flex-row', step >= 5 ? 'md:pb-3' : 'md:pb-8')}
      id="progressBar"
    >
      <div className={cn(lineContainerClass, 'w-[26px] md:w-[70px] shrink-0')}>
        <div className={cn(linkMainClass, 'w-full shrink-0')}>
          {step >= 0 ? (
            <div className={cn(linkSubClass, '!duration-1000')} />
          ) : null}
        </div>
      </div>

      <HeaderBox
        text={t('words.chapters')}
        isDone={isChapterStepComplete}
        isCurrentStep={isCurrentlyOnChapterStep}
      >
        {isChapterStepNotReached ? (
          <BookOpen
            className={cn(
              iconSizeClass,
              step === 1 ? 'fill-newOrange-1' : 'fill-newGray-5',
            )}
          />
        ) : isChapterStepInProgress ? (
          <span className={stepPercentageClass}>
            {classicChapterCompletion}%
          </span>
        ) : (
          <ThumbUp className={cn(iconSizeClass, 'fill-white')} />
        )}
      </HeaderBox>

      <div className={lineContainerClass}>
        <div className={linkMainClass}>
          {isChapterStepComplete ? <div className={linkSubClass} /> : null}
        </div>
      </div>

      <HeaderBox
        text={t('courses.review.feedback')}
        isDone={isReviewStepComplete}
        isCurrentStep={isCurrentlyOnReviewStep}
      >
        {isReviewStepNotReachedOrIncomplete ? (
          <SpeechIcon
            className={cn(
              iconSizeClass,
              isCurrentlyOnReviewStep ? 'fill-newOrange-1' : 'fill-newGray-5',
            )}
          />
        ) : (
          <HeartPixel className={cn(iconSizeClass, 'fill-white')} />
        )}
      </HeaderBox>

      <div className={lineContainerClass}>
        <div className={linkMainClass}>
          {canProgressFromReviewStep ? <div className={linkSubClass} /> : null}
        </div>
      </div>

      <HeaderBox
        text={t('words.exam')}
        isDone={isExamStepComplete}
        isCurrentStep={isCurrentlyOnExamStep}
      >
        {(() => {
          // Not yet reached exam step or no exam data available
          if (isExamStepNotReachedOrNoData) {
            return (
              <BookPixel
                className={cn(
                  iconSizeClass,
                  isCurrentlyOnExamStep ? 'fill-newOrange-1' : 'fill-newGray-5',
                )}
              />
            );
          }

          // Single trial exam or assignment completed
          if (hasSingleTrialExamOrAssignment) {
            return (
              <Certificate className={cn(iconSizeClass, 'filter-white')} />
            );
          }

          // Multi-attempt exam passed
          if (hasExamSucceeded) {
            return <SuccessParty className={cn(iconSizeClass, 'fill-white')} />;
          }

          // Multi-attempt exam failed - show score
          return (
            <span className={stepPercentageClass}>
              {previousExamResults?.score}%
            </span>
          );
        })()}
      </HeaderBox>

      <div className={lineContainerClass}>
        <div className={linkMainClass}>
          {canProgressFromExamStep ? <div className={linkSubClass} /> : null}
        </div>
      </div>

      <HeaderBox
        text={t('words.congrats')}
        isDone={isFinalStepComplete}
        isCurrentStep={isCurrentlyOnLockedFinalStep}
      >
        {isFinalStepNotReached ? (
          <Finish className={cn(iconSizeClass, 'fill-newGray-5')} />
        ) : isFinalStepLocked ? (
          <Padlock className={cn(iconSizeClass, 'fill-newOrange-1')} />
        ) : (
          <Finish className={cn(iconSizeClass, 'fill-white')} />
        )}
      </HeaderBox>
    </div>
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
        <div className="relative w-full">
          <span
            className={cn(
              'text-center text-nowrap title-medium-sb-18px max-md:hidden absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap',
              isDone || isCurrentStep ? 'text-newBlack-1' : 'text-newGray-4',
            )}
          >
            {text}
          </span>
        </div>
      )}
    </div>
  );
};

interface StepsContentProps {
  course?: CourseResponse;
  chapter: CourseChapterResponse;
  courseProgress?: CourseProgressExtended[];
  courseReview?: CourseReview | null;
  previousExamResults?: CourseExamResultsExtended | null;
  completedChapters?: CourseProgressExtended['chapters'] | null;
  reviewChapterId?: string;
  multiAttemptsExamChapterId?: string;
  step: number;
  isAllClassicChaptersDone: boolean;
  isCourseReviewSubmitted?: boolean;
  hasSingleTrialExamOrAssignment?: boolean;
  isProfessorLed?: boolean;
  totalScore?: number | null;
  hasPassedCourseThreshold?: boolean;
  setIsCourseReviewSubmitted: (value: boolean) => void;
  setIsCourseReviewSkipped: (value: boolean) => void;
  setIsCourseExamSkipped: (value: boolean) => void;
  updateStep: (step: number, forceScroll?: boolean) => void;
  completeAllChaptersMutation: UseMutationResult<any, any, any, any>;
}

const StepsContent = ({
  course,
  chapter,
  courseProgress,
  courseReview,
  previousExamResults,
  completedChapters,
  reviewChapterId,
  multiAttemptsExamChapterId,
  step,
  isAllClassicChaptersDone,
  isCourseReviewSubmitted,
  hasSingleTrialExamOrAssignment,
  isProfessorLed,
  totalScore,
  hasPassedCourseThreshold,
  setIsCourseReviewSubmitted,
  setIsCourseReviewSkipped,
  setIsCourseExamSkipped,
  updateStep,
  completeAllChaptersMutation,
}: StepsContentProps) => {
  const stepMessageIconClass = 'size-10 md:size-20 mx-auto';
  const titleStepClass =
    'text-newGray-1 subtitle-small-caps-14px md:subtitle-medium-caps-18px';

  const isMobile = useSmaller('md');

  // Chapter conditions
  const shouldShowChapterStep = course && step <= 1;
  const shouldShowChapterCompleteButton = step <= 1;

  // Review conditions
  const hasCourseReviewData = !!courseReview || isCourseReviewSubmitted;
  const shouldShowReviewStep = step === 2;

  // Exam conditions
  const hasExamResults = !!previousExamResults;
  const hasExamSucceeded = !!previousExamResults?.succeeded;
  const shouldShowExamStep = step >= 3 && step <= 4;
  const isExamButtonDisabled =
    hasExamResults &&
    !hasExamSucceeded &&
    new Date(previousExamResults.startedAt).getTime() + ONE_DAY_IN_MS >
      Date.now();

  // Video conditions
  const shouldShowCongratsVideo = step === 5;

  // Final conditions
  const shouldShowConclusionFinish = step === 6 && !!course;

  // Container styling condition
  const shouldApplyContainerStyling = step < 5;

  return (
    <div
      className={cn(
        shouldApplyContainerStyling
          ? 'bg-maroon-1 p-2 md:px-[30px] md:py-8 rounded-[10px] md:rounded-[20px] shadow-course-navigation'
          : '',
      )}
    >
      {shouldShowChapterStep ? (
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
            {shouldShowChapterCompleteButton ? (
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
            ) : null}
          </section>
        )
      ) : null}

      {shouldShowReviewStep ? (
        hasCourseReviewData ? (
          <StepMessage
            title={t('courses.review.feedback')}
            headline={t('courses.conclusion.completedFeedbackHeadline')}
            subHeadline={t('courses.conclusion.completedFeedbackSubHeadline')}
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

      {shouldShowExamStep ? (
        isProfessorLed ? (
          <StepMessage
            title={t('courses.exam.finalScore')}
            headline={
              <>
                <p className="whitespace-pre-line">
                  {hasPassedCourseThreshold
                    ? t('courses.exam.successfulPassedThreshold')
                    : t('courses.exam.solidEffort')}
                </p>
                <RadialGauge
                  percentage={totalScore || 0}
                  label={t('dashboard.teacher.courses.finalScore')}
                  subLabel={`${t(
                    'dashboard.teacher.courses.thresholdToPass',
                  )}: ${course?.passingGradeThreshold || 'N/A'}%`}
                  variant={hasPassedCourseThreshold ? 'green' : 'yellow'}
                  size="l"
                  showBackground
                  className="mx-auto mt-5 md:mt-7.5"
                />
              </>
            }
            icon={
              hasPassedCourseThreshold ? (
                <SuccessParty
                  className={cn(stepMessageIconClass, 'fill-brightGreen-5')}
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
              hasExamResults ? (
                hasExamSucceeded ? (
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
                          hasExamSucceeded
                            ? 'text-brightGreen-5'
                            : 'text-red-5',
                        )}
                      >
                        {previousExamResults.score}%
                      </span>
                    </span>
                    <br />
                    {!hasExamSucceeded && t('courses.exam.dontWorryRetake')}
                  </>
                )
              ) : (
                t('courses.conclusion.takeFinalExam')
              )
            }
            icon={
              hasExamResults ? (
                hasExamSucceeded ? (
                  <SuccessParty
                    className={cn(stepMessageIconClass, 'fill-brightGreen-5')}
                  />
                ) : (
                  <FailurePixel
                    className={cn(stepMessageIconClass, 'fill-red-5')}
                  />
                )
              ) : (
                <BookPixel
                  className={cn(stepMessageIconClass, 'fill-darkOrange-5')}
                />
              )
            }
            actionButton={
              hasExamSucceeded ? undefined : (
                <div className="flex max-md:flex-col gap-4">
                  <Button disabled={isExamButtonDisabled}>
                    <Link
                      to="/courses/$courseId/$chapterId"
                      params={{
                        chapterId: multiAttemptsExamChapterId,
                        courseId: course?.id,
                      }}
                    >
                      {hasExamResults
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

      {shouldShowCongratsVideo && (
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

      {shouldShowConclusionFinish && (
        <ConclusionFinish
          course={course}
          examResults={previousExamResults ?? undefined}
          isProfessorLed={isProfessorLed}
          hasSingleTrialExamOrAssignment={hasSingleTrialExamOrAssignment}
          hasPassedCourseThreshold={hasPassedCourseThreshold}
        />
      )}
    </div>
  );
};

const LockedBar = () => {
  return (
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
  );
};

function scrollToHeader() {
  const element = document.querySelector('#headerChapter');
  if (element) {
    const yOffset = -110;
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ behavior: 'smooth', top: y });
  }
}
