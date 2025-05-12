import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { MdTimer } from 'react-icons/md';

import type { CourseChapterResponse, PartialExamQuestion } from '@blms/types';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  cn,
} from '@blms/ui';

import SandClockEmpty from '#src/assets/icons/sandClock/sand_clock_empty.svg';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { EXAM_QUESTION_DURATION_SECONDS } from '#src/utils/courses.ts';
import { formatSecondsToMinutes } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const ExamSession = ({
  startedAt,
  questions,
  onCompleteExam,
  chapter,
  examName,
}: {
  startedAt: Date;
  questions: PartialExamQuestion[];
  onCompleteExam: () => void;
  chapter: CourseChapterResponse;
  examName: string;
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState(
    Array.from({ length: questions.length }, (_, i) => ({
      questionId: questions[i].id,
      order: -1,
      index: -1,
    })),
  );

  const temporarySaveExamAttemptProcedure =
    trpc.user.courses.temporarySaveExamAttempt.useMutation();

  const completeExamAttempt =
    trpc.user.courses.completeExamAttempt.useMutation();

  const { data: examResults, isFetched: isExamResultsFetched } =
    trpc.user.courses.getLatestExamResults.useQuery({
      courseId: chapter.courseId,
    });

  // when isExamResultsFetched is true, we need to set the selectedAnswers state with the examResults
  useEffect(() => {
    if (isExamResultsFetched && examResults) {
      const newSelectedAnswers = questions.map((question) => {
        const answer = examResults.questions.find(
          (q) => q.text === question.text,
        );
        return {
          questionId: question.id,
          order: answer?.userAnswer ?? -1,
          index: answer
            ? question.answers.findIndex(
                (ans) => ans.order === answer.userAnswer,
              )
            : -1,
        };
      });
      setSelectedAnswers(newSelectedAnswers);
    }
  }, [isExamResultsFetched, examResults, questions]);

  const onSubmit = useCallback(async () => {
    const validAnswers = selectedAnswers.filter(
      (answer) => answer.order !== -1,
    );

    await completeExamAttempt.mutateAsync({
      answers: validAnswers.map((answer) => ({
        questionId: answer.questionId,
        order: answer.order,
      })),
      chapterId: chapter.chapterId,
      courseId: chapter.courseId,
      examId: examResults?.id ?? '',
    });
  }, [chapter, completeExamAttempt, selectedAnswers]);

  const handleAnswerClick = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => {
      const currentAnswer = prev[questionIndex];
      return prev.map((ans, i) =>
        i === questionIndex
          ? currentAnswer.index === answerIndex
            ? { ...ans, index: -1, order: -1 }
            : {
                ...ans,
                order: questions[questionIndex].answers[answerIndex].order,
                index: answerIndex,
              }
          : ans,
      );
    });
  };

  const [isTimeLeftAlertOpen, setIsTimeLeftAlertOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const now = new Date();
  const secondsSinceStart = Math.round(
    (now.getTime() - new Date(startedAt).getTime()) / 1000,
  );
  const timeLeftInSeconds = Math.max(
    0,
    questions.length * EXAM_QUESTION_DURATION_SECONDS -
      (startedAt ? secondsSinceStart : 0),
  );
  const [timeLeft, setTimeLeft] = useState(timeLeftInSeconds);

  // Timer
  useEffect(() => {
    handleActionsBasedOnTime();
  }, [timeLeft, selectedAnswers]);

  function handleActionsBasedOnTime() {
    if (timeLeft === 61) {
      setIsTimeLeftAlertOpen(true);
    }

    if (timeLeft % 30 === 0 && timeLeft > 0) {
      const filteredAnswers = selectedAnswers.filter(
        (answer) => answer.order !== -1,
      );

      if (filteredAnswers.length !== 0) {
        temporarySaveExamAttemptProcedure.mutateAsync({
          answers: filteredAnswers.map((answer) => ({
            questionId: answer.questionId,
            order: answer.order,
          })),
          examId: examResults?.id ?? '',
          chapterId: chapter.chapterId,
          courseId: chapter.courseId,
        });
      }
    }

    if (timeLeft === 0 && !hasSubmitted) {
      onSubmit();
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft !== 0) {
        setTimeLeft((prev) => {
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Handle exam completion
  useEffect(() => {
    if (completeExamAttempt.status === 'success') {
      setHasSubmitted(true);
      onCompleteExam();
    }
  }, [completeExamAttempt.status]);

  // Prevent closing the tab
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const isMobile = window.innerWidth < 768;

  return (
    <section className="flex flex-col w-full max-w-[1056px] rounded-2xl overflow-hidden shadow-course-navigation border-2 border-newBlack-1">
      <div className="flex flex-col w-full gap-5 bg-darkOrange-1 border-b-2 border-newBlack-1 px-4 py-2.5 md:px-7 md:py-5">
        <div className="flex w-full items-center gap-1 md:gap-4 ">
          <h2 className="body-medium-16px uppercase md:display-medium-bold-caps-40px text-darkOrange-11">
            {examName}
          </h2>
        </div>
        <div className="flex flex-wrap w-full gap-2 max-md:hidden">
          {questions.map((_, questionIndex) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={questionIndex}
              type="button"
              onClick={() => {
                const article =
                  document.querySelectorAll('article')[questionIndex];
                const container = document.querySelector('#examContainer');

                if (!container) return;
                const containerRect = container.getBoundingClientRect();
                const articleRect = article.getBoundingClientRect();

                container.scrollTo({
                  top:
                    articleRect.top - containerRect.top + container.scrollTop,
                  behavior: 'smooth',
                });
              }}
              className={cn(
                'size-8 flex justify-center items-center rounded-lg border border-newGray-1 bg-white text-newBlack-1 cursor-pointer label-medium-med-16px',
                selectedAnswers[questionIndex].order !== -1 &&
                  'bg-darkOrange-4',
              )}
            >
              {questionIndex + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center px-2.5 md:px-10 py-5 md:pt-10 md:pb-6 bg-newGray-6 w-full gap-5 md:gap-11">
        <div
          className="relative w-full scrollbar-light overflow-y-scroll max-h-[929px] md:max-h-[1201px] pb-1.5 pr-3 md:pr-2 flex flex-col items-center"
          id="examContainer"
        >
          <div className="sticky top-0 left-0 w-full">
            <Button
              variant="primary"
              size={isMobile ? 'xs' : 'm'}
              className="absolute left-0 w-fit pointer-events-none flex gap-2 md:gap-2.5 items-center !bg-darkOrange-7 z-10"
            >
              <MdTimer size={isMobile ? 16 : 24} className="shrink-0" />
              <span className="w-9 md:w-12 text-xs md:text-lg leading-normal font-medium text-white">
                {formatSecondsToMinutes(timeLeft)}
              </span>
            </Button>
          </div>
          <div className="flex flex-col gap-5 md:gap-11 max-md:pt-10 max-lg:pt-16 max-md:w-full max-md:max-w-full">
            {questions.map((q, questionIndex) => (
              <article
                key={q.id}
                className={cn(
                  'flex flex-col gap-4 md:gap-6 w-full max-w-[584px]',
                  questionIndex === 0 && 'pt-0',
                )}
              >
                <p className="body-medium-16px md:subtitle-large-med-20px text-newBlack-1">
                  {questionIndex + 1}. {q.text}
                </p>
                <section className="flex flex-col gap-2.5 md:gap-4 w-full">
                  {q.answers.map((answer, answerIndex) => (
                    <button
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={answerIndex}
                      type="button"
                      onClick={() =>
                        handleAnswerClick(questionIndex, answerIndex)
                      }
                      className="group border-newBlack-1 flex w-full cursor-pointer items-stretch rounded-lg border overflow-hidden"
                    >
                      <span
                        className={cn(
                          'label-medium-med-16px md:title-large-24px text-newBlack-1 uppercase px-4 flex items-center bg-newGray-5 lg:group-hover:bg-newGray-3',
                          selectedAnswers[questionIndex].index ===
                            answerIndex &&
                            '!bg-darkOrange-4 lg:group-hover:!bg-darkOrange-3',
                        )}
                      >
                        {String.fromCodePoint(97 + answerIndex)}
                      </span>
                      <p
                        className={cn(
                          'label-small-12px md:body-16px text-newBlack-1 text-start w-full flex items-center px-[5px] md:px-4 border-l border-newBlack-1 max-md:py-0.5 bg-white lg:group-hover:bg-newGray-4',
                          selectedAnswers[questionIndex].index ===
                            answerIndex &&
                            '!bg-darkOrange-1 lg:group-hover:!bg-darkOrange-0',
                        )}
                      >
                        {answer.text}
                      </p>
                    </button>
                  ))}
                </section>
              </article>
            ))}
          </div>
        </div>
        {/* Handle submit */}
        <Dialog>
          <DialogTrigger asChild>
            <ButtonWithArrow
              size={isMobile ? 's' : 'l'}
              className="w-fit self-center"
              variant="primary"
            >
              {t('courses.exam.submit')}
            </ButtonWithArrow>
          </DialogTrigger>
          <DialogContent
            className="!bg-white !shadow-course-navigation !border-[#D1D5DB] !rounded-[20px] !flex !flex-col !items-center !w-full max-w-[87.5%] md:!max-w-[530px] p-4 md:!px-6 md:!py-11 gap-6 md:gap-14"
            showCloseButton
          >
            <DialogHeader className="max-md:mt-10">
              <DialogTitle className="!body-16px md:!display-small-32px !text-newBlack-1 px-7 md:!px-4 !text-center md:!mt-14 !w-full !max-w-[482px]">
                {t('courses.exam.sureSubmit')}
              </DialogTitle>
              <DialogDescription className="hidden">
                {t('courses.exam.sureSubmit')}
              </DialogDescription>
            </DialogHeader>
            <div className="!flex !gap-[18px] max-md:mb-5">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size={isMobile ? 's' : 'l'}
                  className="!w-fit"
                >
                  {t('courses.exam.noGoBack')}
                </Button>
              </DialogClose>
              <Button
                variant="primary"
                size={isMobile ? 's' : 'l'}
                className="w-fit"
                onClick={onSubmit}
              >
                {t('courses.exam.yesSubmit')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Time left alert */}
      <Dialog open={isTimeLeftAlertOpen} onOpenChange={setIsTimeLeftAlertOpen}>
        <DialogContent
          className="!bg-white !shadow-course-navigation !border-[#D1D5DB] !rounded-[20px] !flex !flex-col !w-full max-w-[87.5%] md:!max-w-[530px] p-4 md:!px-6 md:!py-11 !gap-10 !items-center"
          showCloseButton
        >
          <DialogHeader className="hidden">
            <DialogTitle>{t('courses.exam.oneMinuteLeft')}</DialogTitle>
            <DialogDescription>
              {t('courses.exam.oneMinuteLeft')}
            </DialogDescription>
          </DialogHeader>

          <div className="body-medium-16px md:title-large-sb-24px text-newBlack-1 text-center items-center max-w-[482px] md:px-5 flex flex-col gap-6 md:gap-10 md:py-10">
            <img
              src={SandClockEmpty}
              alt={t('courses.exam.oneMinuteLeft')}
              className="w-16 md:w-20"
            />
            {t('courses.exam.oneMinuteLeft')}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
