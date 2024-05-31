import type { Dependencies } from '../../../dependencies.js';
import { insertQuizAttempt } from '../queries/insert-quiz-attempt.js';

export const createSaveQuizAttempt =
  (dependencies: Dependencies) =>
  async ({
    uid,
    chapterId,
    questionsCount,
    correctAnswersCount,
  }: {
    uid: string;
    chapterId: string;
    questionsCount: number;
    correctAnswersCount: number;
  }) => {
    const { postgres } = dependencies;

    await postgres.exec(
      insertQuizAttempt({
        uid,
        chapterId,
        questionsCount,
        correctAnswersCount,
      }),
    );
  };
