import type { Dependencies } from '../../../dependencies.js';
import { completeChapterQuery } from '../queries/complete-chapter.js';
import {
  insertExamAttemptAnswersQuery,
  updateExamAttemptQuery,
} from '../queries/complete-exam.js';
import {
  getCorrectAnswersCountQuery,
  getExamIdFromQuestionIdQuery,
  getExamQuestionsCountQuery,
} from '../queries/get-exam.js';

interface Options {
  answers: Array<{ questionId: string; order: number }>;
  uid: string;
  chapterId: string;
  courseId: string;
}

export const createCompleteExamAttempt = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<void> => {
    await postgres.exec(
      insertExamAttemptAnswersQuery({ answers: options.answers }),
    );

    const examId = await postgres
      .exec(
        getExamIdFromQuestionIdQuery({
          questionId: options.answers[0].questionId,
        }),
      )
      .then((result) => result[0].examId);

    const correctAnswersCount = await postgres
      .exec(getCorrectAnswersCountQuery({ examId }))
      .then((result) => result[0].correctAnswers);

    const questionsCount = await postgres
      .exec(getExamQuestionsCountQuery({ examId }))
      .then((result) => result[0].questionsCount);

    const succeeded = correctAnswersCount >= questionsCount * 0.75;
    await postgres
      .exec(
        updateExamAttemptQuery({
          examId,
          succeeded: succeeded,
          score: Math.round((correctAnswersCount / questionsCount) * 100),
        }),
      )
      .then(async (result) => {
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
