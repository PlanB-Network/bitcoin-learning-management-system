import type { Dependencies } from '../../../dependencies.js';
import { calculateCourseScoreForUser } from '../queries/calculate-score.js';
import { completeChapterQuery } from '../queries/complete-chapter.js';
import {
  insertExamAttemptAnswersQuery,
  updateExamAttemptQuery,
} from '../queries/complete-exam.js';
import {
  getCorrectAnswersCountQuery,
  getExamQuestionsCountQuery,
} from '../queries/get-exam-questions.js';

interface Options {
  answers: Array<{ questionId: string; order: number }>;
  uid: string;
  chapterId: string;
  courseId: string;
  examId: string;
}

export const createTemporarySaveExamAttempt = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<void> => {
    await postgres.exec(
      insertExamAttemptAnswersQuery({ answers: options.answers }),
    );
  };
};

export const createCompleteExamAttempt = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<void> => {
    const examId = options.examId;

    if (options.answers.length > 0) {
      await postgres.exec(
        insertExamAttemptAnswersQuery({ answers: options.answers }),
      );
    }

    const correctAnswersCount = await postgres
      .exec(getCorrectAnswersCountQuery({ examId }))
      .then((result) => result[0].correctAnswers);

    const questionsCount = await postgres
      .exec(getExamQuestionsCountQuery({ examId }))
      .then((result) => result[0].questionsCount);

    const succeeded = correctAnswersCount >= questionsCount * 0.8;
    await postgres
      .exec(
        updateExamAttemptQuery({
          examId,
          score: Math.round((correctAnswersCount / questionsCount) * 100),
          succeeded: succeeded,
        }),
      )
      .then(async (result) => {
        await postgres.exec(
          calculateCourseScoreForUser(options.uid, options.courseId),
        );

        if (succeeded) {
          await postgres.exec(
            completeChapterQuery(
              options.uid,
              options.courseId,
              options.chapterId,
            ),
          );
        }
        return result;
      });
  };
};
