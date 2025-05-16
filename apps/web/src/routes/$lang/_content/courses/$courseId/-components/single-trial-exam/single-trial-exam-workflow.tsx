import type { CourseChapterResponse } from '@blms/types';
import { useContext } from 'react';
import { AppContext } from '#src/providers/context.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { ExamSession } from '../shared-between-exams/exam-session.tsx';
import { SingleTrialExamPresentation } from './single-trial-exam-presentation.tsx';
import { SingleTrialExamResult } from './single-trial-exam-result.tsx';

interface SingleTrialExamWorkflowProps {
  chapter: CourseChapterResponse;
}

export const SingleTrialExamWorkflow = ({
  chapter,
}: SingleTrialExamWorkflowProps) => {
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;

  const {
    data: previousExamResults,
    isFetched: isPreviousExamResultsFetched,
    refetch: refetchExamResults,
  } = trpc.user.courses.getLatestExamResults.useQuery(
    {
      courseId: chapter.courseId,
      chapterId: chapter.chapterId,
    },
    {
      enabled: isLoggedIn,
    },
  );

  const { data: partialExamQuestions } =
    trpc.user.courses.getExamQuestions.useQuery(
      {
        examId: previousExamResults?.id ?? '',
        language: chapter.course.originalLanguage,
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
        <SingleTrialExamPresentation
          chapter={chapter}
          onStartExam={onRefreshExam}
        />
      )}

      {isExamStarted && !isExamCompleted && examHasQuestions && (
        <ExamSession
          startedAt={previousExamResults?.startedAt}
          questions={partialExamQuestions}
          onCompleteExam={onRefreshExam}
          chapter={chapter}
          examName={chapter.title}
        />
      )}

      {((!isExamCompleted && !isExamStarted && previousExamResults) ||
        isExamCompleted) && (
        <SingleTrialExamResult chapter={chapter} onStartExam={onRefreshExam} />
      )}
    </>
  );
};
