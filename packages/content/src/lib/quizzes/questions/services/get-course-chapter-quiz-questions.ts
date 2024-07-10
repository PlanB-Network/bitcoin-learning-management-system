import type { Dependencies } from '../../../dependencies.js';
import { getCourseChapterQuizQuestionsQuery } from '../queries/index.js';

export const createGetCourseChapterQuizQuestions =
  (dependencies: Dependencies) =>
  ({ chapterId, language }: { chapterId: string; language?: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(
      getCourseChapterQuizQuestionsQuery({
        chapterId,
        language,
      }),
    );
  };
