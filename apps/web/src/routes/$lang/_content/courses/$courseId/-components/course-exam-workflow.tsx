import { useState } from 'react';

import type { CourseChapterResponse, PartialExamQuestion } from '@blms/types';

import { trpc } from '#src/utils/trpc.ts';

import { CourseExamSession } from './course-exam-session.tsx';
import { ExamNotTranslated } from './exam-not-translated.tsx';
import { ExamPresentation } from './exam-presentation.tsx';
import { ExamResults } from './exam-results.tsx';

interface CourseExamWorkflowProps {
  chapter: CourseChapterResponse;
  disabled?: boolean;
}

export const CourseExamWorkflow = ({
  chapter,
  disabled,
}: CourseExamWorkflowProps) => {
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  const [partialExamQuestions, setPartialExamQuestions] = useState<
    PartialExamQuestion[]
  >([]);

  console.log('partialExamQuestions', partialExamQuestions);

  const { data: previousExamResults, isFetched: isPreviousExamResultsFetched } =
    trpc.user.courses.getLatestExamResults.useQuery(
      {
        courseId: chapter.courseId,
      },
      {
        enabled: !disabled,
      },
    );

  const noPreviousExamAttempt =
    !isExamStarted && isPreviousExamResultsFetched && !previousExamResults;

  const shouldRenderExamPresentation = disabled;

  return (
    <>
      {(noPreviousExamAttempt || shouldRenderExamPresentation) && (
        <ExamPresentation
          disabled={disabled}
          chapter={chapter}
          setIsExamStarted={setIsExamStarted}
          setPartialExamQuestions={setPartialExamQuestions}
        />
      )}

      {isExamStarted && !isExamCompleted && partialExamQuestions.length > 0 && (
        <CourseExamSession
          questions={partialExamQuestions}
          setIsExamCompleted={setIsExamCompleted}
          chapter={chapter}
        />
      )}

      {isExamStarted &&
        !isExamCompleted &&
        partialExamQuestions.length === 0 && (
          <ExamNotTranslated chapter={chapter} />
        )}

      {((!isExamCompleted && !isExamStarted && previousExamResults) ||
        isExamCompleted) && (
        <ExamResults
          chapter={chapter}
          setIsExamStarted={setIsExamStarted}
          setPartialExamQuestions={setPartialExamQuestions}
        />
      )}
    </>
  );
};
