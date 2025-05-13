import { t } from 'i18next';

import type { CourseChapterResponse } from '@blms/types';
import { Divider, cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import SuccessExam from '#src/assets/icons/success_exam.svg?react';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { goToChapterParameters } from '#src/utils/courses.ts';
import { trpc } from '#src/utils/trpc.ts';
import { AnswersReviewPanel } from '../shared-between-exams/answers-review-panel.tsx';

export const SingleTrialExamResult = ({
  chapter,
  onStartExam,
}: {
  chapter: CourseChapterResponse;
  onStartExam: () => void;
}) => {
  const { data: examResults, isFetched: isExamResultsFetched } =
    trpc.user.courses.getLatestExamResults.useQuery({
      courseId: chapter.courseId,
      chapterId: chapter.chapterId,
    });

  const completeChapterMutation =
    trpc.user.courses.completeChapter.useMutation();

  const totalGoodUserAnswer = examResults?.questions.reduce(
    (acc, question) =>
      acc +
      (question.userAnswer ===
      question.answers.find((ans) => ans.correctAnswer)?.order
        ? 1
        : 0),
    0,
  );

  const totalWrongUserAnswer = examResults?.questions.reduce(
    (acc, question) =>
      acc +
      (question.userAnswer !== null &&
      question.userAnswer !==
        question.answers.find((ans) => ans.correctAnswer)?.order
        ? 1
        : 0),
    0,
  );

  const totalAnsweredAnswers = examResults?.questions.reduce(
    (acc, question) => acc + (question.userAnswer === null ? 0 : 1),
    0,
  );

  const userExamDuration =
    examResults?.finishedAt && examResults?.startedAt
      ? Math.floor(
          (new Date(examResults.finishedAt).getTime() -
            new Date(examResults.startedAt).getTime()) /
            1000,
        )
      : 0;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}'${remainingSeconds.toString().padStart(2, '0')}"`;
  };

  const completeChapter = () => {
    completeChapterMutation.mutate({
      courseId: chapter.course.id,
      chapterId: chapter.chapterId,
      language: chapter.language,
    });
  };

  return (
    <div className="flex flex-col">
      {isExamResultsFetched && examResults && (
        <>
          <section className="flex flex-col w-full">
            <article className="flex flex-col px-4 md:px-[30px] py-5 md:py-11 items-center gap-2 md:gap-8 bg-newGray-6 rounded-[20px] shadow-course-navigation w-full self-center">
              <>
                <SuccessExam className="size-7 md:size-10 fill-brightGreen-5" />
                <p className="text-newBlack-1 label-medium-16px md:title-large-24px !font-semibold max-md:w-[194px] text-center">
                  {t('courses.exam.completed')}
                </p>
                <span className="subtitle-medium-caps-18px md:display-large-bold-caps-48px text-darkOrange-5 !font-extrabold">
                  <span>{examResults.score}%</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-6 max-w-2xl w-full">
                  <StatsCard
                    label={t('courses.exam.results.questions')}
                    value={`${totalAnsweredAnswers}/${examResults.questions.length}`}
                  />
                  <StatsCard
                    label={t('courses.exam.results.time')}
                    value={formatDuration(userExamDuration)}
                  />
                  <StatsCard
                    label={t('courses.exam.results.correct')}
                    value={`${totalGoodUserAnswer}/${examResults.questions.length}`}
                  />
                  <StatsCard
                    label={t('courses.exam.results.incorrect')}
                    value={`${totalWrongUserAnswer}/${examResults.questions.length}`}
                  />
                </div>
              </>
            </article>
          </section>
          {examResults.finalized && (
            <section className="flex flex-col w-full mt-7">
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
            </section>
          )}
          <Link
            className={cn('flex w-fit max-md:mx-auto md:ml-auto mt-8')}
            to={'/courses/$courseId/$chapterId'}
            params={goToChapterParameters(chapter, 'next')}
          >
            <ButtonWithArrow
              size={window.innerWidth < 768 ? 'm' : 'l'}
              onClick={completeChapter}
            >
              <span>{t('courses.exam.nextChapter')}</span>
            </ButtonWithArrow>
          </Link>
        </>
      )}
    </div>
  );
};

const StatsCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white p-3 md:p-6 rounded-xl shadow-md flex flex-row md:flex-col items-center md:items-start w-full justify-between md:w-auto">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className={'text-sm md:text-2xl font-bold text-gray-800 mt-1'}>
      {value}
    </span>
  </div>
);
