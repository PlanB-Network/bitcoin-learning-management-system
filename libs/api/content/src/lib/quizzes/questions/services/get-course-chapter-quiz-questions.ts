import { Dependencies } from '../../../dependencies';
import { getCourseChapterQuizQuestionsQuery } from '../queries';

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

    const quizQuestions = await postgres.exec(
      getCourseChapterQuizQuestionsQuery({
        courseId,
        partIndex,
        chapterIndex,
        language,
      }),
    );

    return quizQuestions;
  };
