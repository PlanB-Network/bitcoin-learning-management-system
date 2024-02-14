import type { JoinedQuizQuestion } from '@sovereign-university/types';

import type { Dependencies } from '../../../dependencies.js';
import { getCourseChapterQuizQuestionsQuery } from '../queries/index.js';

export const createGetCourseChapterQuizQuestions =
  (dependencies: Dependencies) =>
  async ({
    courseId,
    partIndex,
    chapterIndex,
    language,
  }: {
    courseId: string;
    partIndex: number;
    chapterIndex: number;
    language?: string;
  }) => {
    const { postgres } = dependencies;

    return postgres.exec(
      getCourseChapterQuizQuestionsQuery({
        courseId,
        partIndex,
        chapterIndex,
        language,
      }),
    ) as Promise<JoinedQuizQuestion[]>;
  };
