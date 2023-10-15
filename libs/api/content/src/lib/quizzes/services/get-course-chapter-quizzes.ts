import { Dependencies } from '../../dependencies';
import { getCourseChapterQuizzesQuery } from '../queries';

export const createGetCourseChapterQuizzes =
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

    const quizzes = await postgres.exec(
      getCourseChapterQuizzesQuery({
        courseId,
        partIndex,
        chapterIndex,
        language,
      }),
    );

    return quizzes;
  };
