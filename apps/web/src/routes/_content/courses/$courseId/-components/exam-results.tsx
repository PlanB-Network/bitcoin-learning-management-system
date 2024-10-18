import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { CourseExamResults, PartialExamQuestion } from '@blms/types';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Divider,
  cn,
} from '@blms/ui';

import QuestionBelow from '#src/assets/icons/question_below.svg';
import ThumbDown from '#src/assets/icons/thumb_down.svg';
import ThumbUp from '#src/assets/icons/thumb_up.svg';
import TimeStamp from '#src/assets/icons/time_stamp.svg';
import Warning from '#src/assets/icons/warning.svg';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { goToChapterParameters } from '#src/utils/courses.ts';
import { oneDayInMs } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';
import type { TRPCRouterOutput } from '#src/utils/trpc.ts';

import { CompletedExamAnswer } from '../../-components/quizz/completed-exam-answer.tsx';

type Chapter = NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;

export const ExamResults = ({
  chapter,
  setIsExamStarted,
  setPartialExamQuestions,
}: {
  chapter: Chapter;
  setIsExamStarted: (value: boolean) => void;
  setPartialExamQuestions: (value: PartialExamQuestion[]) => void;
}) => {
  const { i18n } = useTranslation();

  const { data: examResults, isFetched: isExamResultsFetched } =
    trpc.user.courses.getLatestExamResults.useQuery({
      courseId: chapter.courseId,
    });

  const startExamAttempt = trpc.user.courses.startExamAttempt.useMutation();

  async function onStart() {
    await startExamAttempt.mutateAsync({
      courseId: chapter.courseId,
      language: i18n.language || 'en',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    if (startExamAttempt.isSuccess) {
      setPartialExamQuestions(startExamAttempt.data);
      setIsExamStarted(true);
    }
  }, [startExamAttempt, setPartialExamQuestions, setIsExamStarted]);

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
                    {t('courses.exam.score')}:{' '}
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
                  <img
                    src={examResults.succeeded ? ThumbUp : ThumbDown}
                    alt={examResults.succeeded ? 'Thumb up' : 'Thumb down'}
                    className="size-7 md:size-20"
                  />
                  {examResults.succeeded ? (
                    <>
                      <div className="max-md:text-center md:flex flex-col items-center md:gap-4 body-14px">
                        <span className="text-newBlack-1 md:title-large-sb-24px text-center">
                          {t('courses.exam.certificateGeneration')}

                          {/* Time stamping infos dialog */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="group relative justify-center text-darkOrange-5 underline decoration-darkOrange-5 text-nowrap max-md:font-medium">
                                {t('courses.exam.timeStamped')}
                                <img
                                  src={QuestionBelow}
                                  alt="Question"
                                  className="absolute left-1/2 -translate-x-1/2 -bottom-[76px] size-20 hidden md:group-hover:block"
                                />
                              </button>
                            </DialogTrigger>
                            <DialogContent
                              className="!bg-white !shadow-course-navigation !border-[#D1D5DB] !rounded-[20px] !flex !flex-col !w-full max-w-[87.5%] md:!max-w-[731px] p-4 md:!px-6 md:!py-11 !gap-5 md:!gap-10"
                              showCloseButton
                            >
                              <DialogHeader>
                                <DialogTitle className="!title-medium-sb-18px md:!display-small-32px !text-darkOrange-5 !px-2.5 md:!px-7 !text-center !mt-10 !w-full !max-w-[683px] md:whitespace-pre-line">
                                  {t('courses.exam.whyTimeStamp')}
                                </DialogTitle>
                                <DialogDescription className="hidden">
                                  {t('courses.exam.whyTimeStamp')}
                                </DialogDescription>
                              </DialogHeader>
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
                                    <p className="subtitle-med-16px">
                                      {t(
                                        'courses.exam.timeStampHowDescription',
                                      )}
                                    </p>
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="title-small-med-16px">
                                      {t('courses.exam.timeStampBenefits')}
                                    </span>
                                    <ul className="subtitle-medium-16px text-justify flex flex-col list-disc list-outside pl-6">
                                      <li>
                                        {t('courses.exam.instantVerification')}
                                      </li>
                                      <li>{t('courses.exam.tamperProof')}</li>
                                      <li>
                                        {t('courses.exam.globallyRecognized')}
                                      </li>
                                      <li>{t('courses.exam.futureProof')}</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </span>
                        <span className="text-newBlack-1 md:title-large-24px text-center max-md:pl-1">
                          {t('courses.exam.availableDashboard')}
                        </span>
                      </div>

                      {/* TODO: ensure that certificate is generated before showing the button */}
                      <Link
                        to={`/dashboard/course/${chapter.courseId}#exam`}
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
                    </>
                  ) : (
                    <>
                      <p className="text-newBlack-1 body-14px md:title-large-24px text-center">
                        {t('courses.exam.wishTryAgain')}
                      </p>

                      <TryAgainDialog
                        examResults={examResults}
                        onStart={onStart}
                      />
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
              <ConcludeButton chapter={chapter} />
            </section>
          )}
        </>
      )}
    </div>
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
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-fit"
          size={isMobile ? 's' : 'l'}
          variant="primary"
          disabled={
            examResults
              ? new Date(examResults.startedAt).getTime() + oneDayInMs >
                Date.now()
              : true
          }
        >
          {t('courses.exam.tryAgain')}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="!bg-white !shadow-course-navigation !border-[#D1D5DB] !rounded-[20px] !flex !flex-col !w-full max-w-[87.5%] md:!max-w-[530px] !p-4 md:!px-6 md:!py-11 gap-6 md:!gap-12 !items-center"
        showCloseButton
      >
        <DialogHeader className="pt-5">
          <DialogTitle className="!title-medium-sb-18px md:!display-small-32px !text-darkOrange-5 md:!px-7 !text-center !mt-10 !w-full whitespace-pre-line">
            {t('courses.exam.tryOneMoreTime')}
          </DialogTitle>
          <DialogDescription className="hidden">
            {t('courses.exam.tryOneMoreTime')}
          </DialogDescription>
        </DialogHeader>

        <div className="body-16px md:title-large-24px text-newBlack-1 text-center max-w-[482px] md:px-5 flex flex-col gap-6 md:gap-8">
          <p>{t('courses.exam.sameRules')}</p>
          <p>{t('courses.exam.retakeInstructions')}</p>
          <p>{t('courses.exam.goodLuck')}</p>
        </div>

        <div className="!flex gap-4 md:!gap-5 pb-5">
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
      </DialogContent>
    </Dialog>
  );
};

export const AnswersReviewPanel = ({
  examResults,
  hasBackground,
  className,
}: {
  examResults: CourseExamResults;
  hasBackground?: boolean;
  className?: string;
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  return (
    <section
      className={cn(
        'flex flex-col gap-6 md:gap-5 w-full',
        hasBackground && 'bg-newGray-6 rounded-[20px] shadow-course-navigation',
        className,
      )}
    >
      {/* Question selection */}
      <section className="flex flex-wrap gap-2 md:gap-4 md:py-4 w-full max-md:justify-center">
        {examResults.questions.map((q, index) => (
          <button
            key={index}
            onClick={() => setSelectedQuestion(index)}
            className={cn(
              'size-8 md:size-12 flex justify-center items-center border border-newGray-1 rounded-lg label-medium-med-16px md:title-large-24px text-newBlack-1',
              q.userAnswer === q.answers.find((ans) => ans.correctAnswer)?.order
                ? selectedQuestion === index
                  ? 'bg-brightGreen-4'
                  : 'bg-brightGreen-2 hover:bg-brightGreen-4'
                : selectedQuestion === index
                  ? 'bg-red-4'
                  : 'bg-red-2 hover:bg-red-4',
            )}
          >
            {index + 1}
          </button>
        ))}
      </section>

      {/* Question details */}
      <article className="flex flex-col md:border-t border-newBlack-5 md:px-5 gap-4 md:gap-6 w-full md:pt-5">
        <h3 className="body-medium-16px md:title-large-sb-24px text-newBlack-1">
          {selectedQuestion + 1} .{' '}
          {examResults.questions[selectedQuestion].text}
        </h3>

        <section className="flex flex-col gap-2.5 md:gap-4 w-full md:p-2.5">
          {examResults.questions[selectedQuestion].answers.map(
            (answer, answerIndex) => (
              <CompletedExamAnswer
                key={answerIndex}
                answer={answer.text}
                answerIndex={answerIndex}
                answerOrder={answer.order}
                correctAnswer={
                  examResults.questions[selectedQuestion].answers.find(
                    (ans) => ans.correctAnswer,
                  )?.order
                }
                selectedAnswer={
                  examResults.questions[selectedQuestion].userAnswer
                }
              />
            ),
          )}
        </section>

        {/* Explanations */}
        <section className="flex flex-col gap-2.5">
          <h5 className="body-medium-16px md:subtitle-large-med-20px text-newBlack-1">
            {t('courses.exam.explanations')}
          </h5>
          <p className="whitespace-pre-line text-newBlack-1 body-12px md:body-16px text-justify">
            {examResults.questions[selectedQuestion].explanation}
          </p>
        </section>

        {/* Link to chapter */}
        <section className="flex max-md:flex-col md:items-center gap-2.5">
          <h5 className="body-medium-12px md:body-medium-16px text-newBlack-1">
            {t('courses.exam.findInformationChapter')}
          </h5>
          <Link
            to={examResults.questions[selectedQuestion].chapterLink}
            target="_blank"
            className="text-newBlue-1 body-12px md:body-16px underline text-justify"
          >
            {examResults.questions[selectedQuestion].chapterPart}.
            {examResults.questions[selectedQuestion].chapterIndex}.{' '}
            {examResults.questions[selectedQuestion].chapterName}
          </Link>
        </section>
      </article>
    </section>
  );
};

const ConcludeButton = ({ chapter }: { chapter: Chapter }) => {
  const completeChapterMutation =
    trpc.user.courses.completeChapter.useMutation();

  const completeChapter = () => {
    completeChapterMutation.mutate({
      courseId: chapter.course.id,
      chapterId: chapter.chapterId,
    });
  };

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  return (
    <Link
      className="flex w-fit !mt-8 md:!mt-16 max-md:mx-auto md:ml-auto"
      to={
        isLastChapter ? '/courses/$courseId' : '/courses/$courseId/$chapterId'
      }
      params={goToChapterParameters(chapter, 'next')}
    >
      <ButtonWithArrow
        variant="primary"
        size={window.innerWidth < 768 ? 'm' : 'l'}
        onClick={completeChapter}
      >
        <span>{t('courses.exam.letsConclude')}</span>
      </ButtonWithArrow>
    </Link>
  );
};
