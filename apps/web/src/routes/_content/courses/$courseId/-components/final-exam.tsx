import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { MdTimer } from 'react-icons/md';

import type { PartialExamQuestion } from '@blms/types';
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
import { formatSecondsToMinutes } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const FinalExam = ({
  questions,
  setIsExamCompleted,
}: {
  questions: PartialExamQuestion[];
  setIsExamCompleted: (value: boolean) => void;
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState(
    Array.from({ length: questions.length }, (_, i) => ({
      questionId: questions[i].id,
      order: -1,
      index: -1,
    })),
  );

  const completeExamAttempt =
    trpc.user.courses.completeExamAttempt.useMutation();

  const onSubmit = useCallback(async () => {
    const validAnswers = selectedAnswers.filter(
      (answer) => answer.order !== -1,
    );

    if (validAnswers.length === 0) {
      setIsExamCompleted(true);
    } else {
      await completeExamAttempt.mutateAsync({
        answers: validAnswers.map((answer) => ({
          questionId: answer.questionId,
          order: answer.order,
        })),
      });
    }
  }, [completeExamAttempt, selectedAnswers, setIsExamCompleted]);

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

  const [timeLeft, setTimeLeft] = useState(20 * 60);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 61) {
          setIsTimeLeftAlertOpen(true);
        }

        if (prev > 0) {
          return prev - 1;
        } else {
          if (!hasSubmitted) {
            onSubmit();
          }
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [onSubmit, hasSubmitted]);

  // Handle exam completion
  useEffect(() => {
    if (completeExamAttempt.status === 'success') {
      setHasSubmitted(true);
      setIsExamCompleted(true);
    }
  }, [completeExamAttempt.status, setIsExamCompleted]);

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
            {t('courses.exam.finalExam')}
          </h2>
        </div>
        <div className="flex flex-wrap w-full gap-2 max-md:hidden">
          {questions.map((_, questionIndex) => (
            <button
              key={questionIndex}
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
          <div className="flex flex-col gap-5 md:gap-11 max-md:pt-10">
            {questions.map((q, questionIndex) => (
              <article
                key={questionIndex}
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
                      key={answerIndex}
                      onClick={() =>
                        handleAnswerClick(questionIndex, answerIndex)
                      }
                      className="group border-newBlack-1 flex w-full cursor-pointer items-stretch rounded-lg border overflow-hidden"
                    >
                      <span
                        className={cn(
                          'label-medium-med-16px md:title-large-24px text-newBlack-1 uppercase px-4 flex items-center bg-newGray-5 group-hover:bg-newGray-3',
                          selectedAnswers[questionIndex].index ===
                            answerIndex &&
                            '!bg-darkOrange-4 group-hover:!bg-darkOrange-3',
                        )}
                      >
                        {String.fromCodePoint(97 + answerIndex)}
                      </span>
                      <p
                        className={cn(
                          'label-small-12px md:body-16px text-newBlack-1 text-start w-full flex items-center px-[5px] md:px-4 border-l border-newBlack-1 max-md:py-0.5 bg-white group-hover:bg-newGray-4',
                          selectedAnswers[questionIndex].index ===
                            answerIndex &&
                            '!bg-darkOrange-1 group-hover:!bg-darkOrange-0',
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
