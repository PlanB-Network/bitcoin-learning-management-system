import { useContext } from 'react';

import type { CourseChapterResponse } from '@blms/types';

import { trpc } from '#src/utils/trpc.ts';

import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { AppContext } from '#src/providers/context.tsx';
import { ExamSession } from '../shared-between-exams/exam-session.tsx';
import { CourseExamNotTranslated } from './course-exam-not-translated.tsx';
import { CourseExamPresentation } from './course-exam-presentation.tsx';
import { CourseExamResult } from './course-exam-result.tsx';

interface CourseExamWorkflowProps {
  chapter: CourseChapterResponse;
}

export const CourseExamWorkflow = ({ chapter }: CourseExamWorkflowProps) => {
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;

  const {
    data: previousExamResults,
    isFetched: isPreviousExamResultsFetched,
    refetch: refetchExamResults,
  } = useQuery(
    trpc.user.courses.getLatestExamResults.queryOptions(
      {
        courseId: chapter.courseId,
      },
      {
        enabled: isLoggedIn,
      },
    ),
  );

  const { data: partialExamQuestions } = useQuery(
    trpc.user.courses.getExamQuestions.queryOptions(
      {
        examId: previousExamResults?.id ?? '',
        language: chapter.language,
      },
      {
        enabled: !!previousExamResults?.id,
      },
    ),
  );

  const isExamStarted =
    previousExamResults?.startedAt !== undefined &&
    previousExamResults?.startedAt !== null;

  const noPreviousExamAttempt =
    !isExamStarted && isPreviousExamResultsFetched && !previousExamResults;

  // const examTimeLimit =
  //   (partialExamQuestions?.length ?? 0) * EXAM_QUESTION_DURATION_SECONDS * 1000;
  const isExamCompleted = previousExamResults?.finishedAt != null;

  function onRefreshExam() {
    refetchExamResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const examHasQuestions =
    partialExamQuestions && partialExamQuestions.length > 0;

  return (
    <>
      {(noPreviousExamAttempt || !isLoggedIn) && (
        <CourseExamPresentation chapter={chapter} onStartExam={onRefreshExam} />
      )}

      {isExamStarted && !isExamCompleted && examHasQuestions && (
        <ExamSession
          startedAt={previousExamResults?.startedAt}
          questions={partialExamQuestions}
          onCompleteExam={onRefreshExam}
          chapter={chapter}
          examName={t('courses.exam.finalExam')}
        />
      )}

      {isExamStarted && !isExamCompleted && !examHasQuestions && (
        <CourseExamNotTranslated chapter={chapter} />
      )}

      {((!isExamCompleted && !isExamStarted && previousExamResults) ||
        isExamCompleted) && (
        <CourseExamResult chapter={chapter} onStartExam={onRefreshExam} />
      )}
    </>
  );
};
