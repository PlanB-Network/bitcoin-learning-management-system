import type { JoinedQuizQuestion } from '@sovereign-university/types';

import type { Dependencies } from '../../../dependencies.js';
import { getCourseChapterQuizQuestionsQuery } from '../queries/index.js';

export const createGetCourseChapterQuizQuestions =
  (dependencies: Dependencies) =>
  async ({ chapterId, language }: { chapterId: string; language?: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(
      getCourseChapterQuizQuestionsQuery({
        chapterId,
        language,
      }),
    ) as Promise<JoinedQuizQuestion[]>;
  };
