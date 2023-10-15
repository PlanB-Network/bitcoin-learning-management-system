import { Dependencies } from '../../../dependencies';
import { insertQuizAttempt } from '../queries/insert-quiz-attempt';

export const createSaveQuizAttempt =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    partIndex,
    chapterIndex,
    questionsCount,
    correctAnswersCount,
  }: {
    uid: string;
    courseId: string;
    partIndex: number;
    chapterIndex: number;
    questionsCount: number;
    correctAnswersCount: number;
  }) => {
    const { postgres } = dependencies;

    await postgres.exec(
      insertQuizAttempt({
        uid,
        courseId,
        partIndex,
        chapterIndex,
        questionsCount,
        correctAnswersCount,
      }),
    );
  };
