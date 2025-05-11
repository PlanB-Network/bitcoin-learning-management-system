import { useContext } from 'react';

import type { CourseChapterResponse } from '@blms/types';

import { trpc } from '#src/utils/trpc.ts';

import { AppContext } from '#src/providers/context.tsx';
import { CourseExamPresentation } from './course-exam-presentation.tsx';
import { CourseExamSession } from './course-exam-session.tsx';
import { ExamNotTranslated } from './exam-not-translated.tsx';
import { ExamResults } from './exam-results.tsx';

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
  } = trpc.user.courses.getLatestExamResults.useQuery(
    {
      courseId: chapter.courseId,
    },
    {
      enabled: isLoggedIn,
    },
  );

  const { data: partialExamQuestions } =
    trpc.user.courses.getExamQuestions.useQuery(
      {
        examId: previousExamResults?.id ?? '',
        language: chapter.language,
      },
      {
        enabled: !!previousExamResults?.id,
      },
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
        <CourseExamSession
          startedAt={previousExamResults?.startedAt}
          questions={partialExamQuestions}
          onCompleteExam={onRefreshExam}
          chapter={chapter}
        />
      )}

      {isExamStarted && !isExamCompleted && !examHasQuestions && (
        <ExamNotTranslated chapter={chapter} />
      )}

      {((!isExamCompleted && !isExamStarted && previousExamResults) ||
        isExamCompleted) && (
        <ExamResults chapter={chapter} onStartExam={onRefreshExam} />
      )}
    </>
  );
};
