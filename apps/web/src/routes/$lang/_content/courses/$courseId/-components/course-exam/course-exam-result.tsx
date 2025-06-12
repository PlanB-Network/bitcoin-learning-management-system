import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { CourseChapterResponse, CourseExamResults } from '@blms/types';
import {
  BasicModal,
  Button,
  ButtonWithArrow,
  DialogClose,
  Divider,
  cn,
} from '@blms/ui';

import { ExamType } from '@blms/constants';
import { useMutation, useQuery } from '@tanstack/react-query';
import FaceFailed from '#src/assets/icons/face_failed.svg';
import QuestionBelow from '#src/assets/icons/question_below.svg';
import SuccessParty from '#src/assets/icons/success_party.svg?react';
import TimeStamp from '#src/assets/icons/time_stamp.svg';
import Warning from '#src/assets/icons/warning.svg';
import { goToChapterParameters } from '#src/utils/courses.ts';
import { ONE_DAY_IN_MS } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';
import { AnswersReviewPanel } from '../shared-between-exams/answers-review-panel.tsx';

export const CourseExamResult = ({
  chapter,
  onStartExam,
}: {
  chapter: CourseChapterResponse;
  onStartExam: () => void;
}) => {
  const { i18n } = useTranslation();

  const { data: examResults, isFetched: isExamResultsFetched } = useQuery(
    trpc.user.courses.getLatestExamResults.queryOptions({
      courseId: chapter.courseId,
    }),
  );

  const startExamAttempt = useMutation(
    trpc.user.courses.startExamAttempt.mutationOptions(),
  );

  async function onStart() {
    await startExamAttempt.mutateAsync({
      courseId: chapter.courseId,
      chapterId: chapter.chapterId,
      language: i18n.language || 'en',
      examType: ExamType.Final,
    });
  }

  useEffect(() => {
    if (startExamAttempt.isSuccess) {
      onStartExam();
    }
  }, [startExamAttempt]);

  const isMobile = window.innerWidth < 768;

  return (
    <div className="flex flex-col">
      {/* Test results */}
      {isExamResultsFetched && examResults && (
        <>
          <section className="flex flex-col w-full">
            <h2 className="text-[34px] text-newBlack-1 leading-tight tracking-[0.25px] max-md:hidden">
              {t('courses.exam.testResults')}
            </h2>
            <Divider
              className="mt-1 md:mt-2.5 mb-7 md:mb-10"
              width="w-full"
              mode="light"
            />

            <article className="flex flex-col px-4 md:px-[30px] py-5 md:py-11 items-center gap-4 md:gap-10 bg-newGray-6 rounded-[20px] shadow-course-navigation w-full self-center">
              {examResults.finalized ? (
                <>
                  <p className="text-newBlack-1 label-medium-16px md:title-large-24px max-md:w-[194px] text-center">
                    <Trans
                      i18nKey={
                        examResults.succeeded
                          ? 'courses.exam.congratulationsPassed'
                          : 'courses.exam.oopsFailed'
                      }
                    >
                      <span className="label-medium-med-16px md:title-large-sb-24px">
                        {examResults.succeeded ? 'passed' : 'failed'}
                      </span>
                    </Trans>
                  </p>
                  <span className="subtitle-medium-caps-18px md:display-large-bold-caps-48px text-newBlack-1">
                    {t('courses.exam.score')}{' '}
                    <span
                      className={
                        examResults.succeeded
                          ? 'text-brightGreen-5'
                          : 'text-red-5'
                      }
                    >
                      {examResults.score}%
                    </span>
                  </span>
                  {examResults.succeeded ? (
                    <SuccessParty className="size-7 md:size-20 fill-brightGreen-5" />
                  ) : (
                    <img
                      src={FaceFailed}
                      alt={'Face failed'}
                      className="size-7 md:size-20"
                    />
                  )}

                  {examResults.succeeded ? (
                    <div>
                      <div className="max-md:text-center md:flex flex-col items-center md:gap-4 body-14px">
                        {!examResults.isTimestamped && (
                          <span className="text-newBlack-1 md:title-large-sb-24px text-center">
                            {t('courses.exam.certificateGeneration')}

                            <TimeStampDialog />
                          </span>
                        )}
                        <span className="text-newBlack-1 md:title-large-24px text-center max-md:pl-1">
                          {!examResults.isTimestamped
                            ? t('courses.exam.availableDashboard')
                            : t('courses.exam.availableDashboardTimestamped')}
                        </span>
                      </div>
                      <div className="flex justify-center gap-4 items-center max-md:hidden mt-10">
                        {examResults.isTimestamped && (
                          <Link
                            to={`/dashboard/course/${chapter.courseId}#retakeExam`}
                            className="w-fit"
                          >
                            <ButtonWithArrow
                              className="w-fit"
                              size={isMobile ? 's' : 'l'}
                              variant="primary"
                            >
                              {t('courses.exam.getCertificate')}
                            </ButtonWithArrow>
                          </Link>
                        )}
                        <ConcludeButton
                          chapter={chapter}
                          succeeded={examResults.succeeded}
                          variant={
                            examResults.isTimestamped ? 'outline' : 'primary'
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-newBlack-1 body-14px md:title-large-24px text-center">
                        {t('courses.exam.wishTryAgain')}
                      </p>

                      <div className="flex gap-4 items-center justify-center">
                        <TryAgainDialog
                          examResults={examResults}
                          onStart={onStart}
                        />
                        <ConcludeButton
                          chapter={chapter}
                          succeeded={examResults.succeeded}
                          variant="outline"
                          hideOnMobile
                          hasSkipText
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <img src={Warning} alt="Warning" className="max-md:w-7" />
                  <p className="text-newBlack-1 body-16px md:title-large-24px text-center md:max-w-[584px]">
                    {t('courses.exam.quitWithoutSubmitting')}
                  </p>
                  <p className="text-newBlack-1 body-16px md:title-large-24px text-center">
                    {t('courses.exam.wishTryAgain')}
                  </p>
                  <TryAgainDialog examResults={examResults} onStart={onStart} />
                </>
              )}
            </article>
          </section>
          {/* Answers review */}
          {examResults.finalized && (
            <section className="flex flex-col w-full max-md:mt-7 mt-16">
              <h2 className="body-medium-16px md:text-[34px] text-newBlack-1 leading-tight tracking-[0.25px]">
                {t('courses.exam.answersReview')}
              </h2>
              <Divider
                className="mt-1 md:mt-2.5 mb-2.5 md:mb-10"
                width="w-full"
                mode="light"
              />
              <AnswersReviewPanel
                examResults={examResults}
                hasBackground
                className="p-2.5 md:p-5"
              />
              <ConcludeButton
                chapter={chapter}
                succeeded={examResults.succeeded}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
};

export const TimeStampDialog = ({
  triggerText,
  onHoverAddColor,
}: {
  triggerText?: string;
  onHoverAddColor?: boolean;
}) => {
  return (
    <>
      <BasicModal
        trigger={
          <button
            type="button"
            className={cn(
              'group relative justify-center text-nowrap',
              onHoverAddColor
                ? 'text-newBlack-1 hover:text-darkOrange-5 hover:underline hover:decoration-darkOrange-5 font-medium'
                : 'text-darkOrange-5 underline decoration-darkOrange-5 max-md:font-medium',
            )}
          >
            {triggerText ?? t('courses.exam.timeStamped')}
            <img
              src={QuestionBelow}
              alt="Question"
              className="absolute left-1/2 -translate-x-1/2 -bottom-[76px] size-20 hidden md:group-hover:block"
            />
          </button>
        }
        title={t('courses.exam.whyTimeStamp')}
        content={
          <div className="!flex !flex-col !gap-10 !items-center">
            <img
              src={TimeStamp}
              alt="Time stamp"
              className="shrink-0 max-md:w-[90px]"
            />
            <p className="body-medium-16px md:subtitle-large-med-20px text-newBlack-1 text-center max-w-[541px] md:px-5">
              {t('courses.exam.planBTimeStamp')}
            </p>
            <div className="flex flex-col gap-5 w-full text-newBlack-1">
              <div className="flex flex-col">
                <span className="title-small-med-16px">
                  {t('courses.exam.timeStampHow')}
                </span>
                <p className="subtitle-medium-16px">
                  {t('courses.exam.timeStampHowDescription')}
                </p>
              </div>

              <div className="flex flex-col">
                <span className="title-small-med-16px">
                  {t('courses.exam.timeStampBenefits')}
                </span>
                <ul className="subtitle-medium-16px flex flex-col list-disc list-outside pl-6">
                  <li>{t('courses.exam.instantVerification')}</li>
                  <li>{t('courses.exam.tamperProof')}</li>
                  <li>{t('courses.exam.globallyRecognized')}</li>
                  <li>{t('courses.exam.futureProof')}</li>
                </ul>
              </div>
            </div>
          </div>
        }
        showLogo={true}
      />
    </>
  );
};

const TryAgainDialog = ({
  examResults,
  onStart,
}: {
  examResults: CourseExamResults;
  onStart: () => void;
}) => {
  const isMobile = window.innerWidth < 768;

  return (
    <BasicModal
      trigger={
        <Button
          className="w-fit"
          size={isMobile ? 's' : 'l'}
          variant="primary"
          disabled={
            examResults
              ? new Date(examResults.startedAt).getTime() + ONE_DAY_IN_MS >
                Date.now()
              : true
          }
        >
          {t('courses.exam.tryAgain')}
        </Button>
      }
      title={t('courses.exam.tryOneMoreTime')}
    >
      <div className="body-16px md:title-large-24px text-newBlack-1 text-center max-w-[482px] md:px-5 flex flex-col gap-6 md:gap-8">
        <p>{t('courses.exam.sameRules')}</p>
        <p>{t('courses.exam.retakeInstructions')}</p>
        <p>{t('courses.exam.goodLuck')}</p>
      </div>

      <div className="!flex gap-4 md:!gap-5">
        <DialogClose asChild>
          <Button
            variant="primary"
            size={isMobile ? 's' : 'l'}
            className="!w-fit"
            onClick={onStart}
          >
            {t('courses.exam.startExam')}
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="outline"
            size={isMobile ? 's' : 'l'}
            className="w-fit"
          >
            {t('courses.exam.goBack')}
          </Button>
        </DialogClose>
      </div>
    </BasicModal>
  );
};

const ConcludeButton = ({
  chapter,
  succeeded,
  variant = 'primary',
  alignRight,
  hideOnMobile,
  addMarginTop,
  hasSkipText,
}: {
  chapter: CourseChapterResponse;
  succeeded: boolean;
  variant?: 'primary' | 'outline';
  alignRight?: boolean;
  hideOnMobile?: boolean;
  addMarginTop?: boolean;
  hasSkipText?: boolean;
}) => {
  const completeChapterMutation = useMutation(
    trpc.user.courses.completeChapter.mutationOptions(),
  );

  const completeChapter = () => {
    if (succeeded) {
      completeChapterMutation.mutate({
        courseId: chapter.course.id,
        chapterId: chapter.chapterId,
        language: chapter.language,
      });
    }
  };

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  return (
    <Link
      className={cn(
        'flex w-fit max-md:mx-auto',
        addMarginTop && '!mt-8 md:!mt-16',
        alignRight ? 'md:ml-auto' : 'md:mx-auto',
        hideOnMobile && 'max-md:hidden',
      )}
      to={
        isLastChapter ? '/courses/$courseId' : '/courses/$courseId/$chapterId'
      }
      params={goToChapterParameters(chapter, 'next')}
    >
      <ButtonWithArrow
        variant={variant}
        size={window.innerWidth < 768 ? 'm' : 'l'}
        onClick={completeChapter}
        className={cn(!hasSkipText ? 'mt-4' : '')}
      >
        <span>
          {hasSkipText
            ? t('courses.exam.skipGoConclusion')
            : t('courses.exam.goConclusion')}
        </span>
      </ButtonWithArrow>
    </Link>
  );
};
