import type { Dependencies } from '../../../dependencies.js';
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

    await postgres.exec(
      updateExamAttemptQuery({
        examId,
        succeeded: correctAnswersCount >= questionsCount * 0.8,
        score: Math.round((correctAnswersCount / questionsCount) * 100),
      }),
    );
  };
};
