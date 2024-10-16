import { sql } from '@blms/database';

export const insertExamAttemptAnswersQuery = ({
  answers,
}: {
  answers: Array<{ questionId: string; order: number }>;
}) => {
  return sql`
        INSERT INTO users.exam_answers (question_id, "order")
        VALUES ${sql(answers.map((a) => [a.questionId, a.order]))}
        ON CONFLICT (question_id) DO NOTHING;
    `;
};

export const updateExamAttemptQuery = ({
  examId,
  succeeded,
  score,
}: {
  examId: string;
  succeeded: boolean;
  score: number;
}) => {
  return sql`
        UPDATE users.exam_attempts
        SET finalized = true, finished_at = NOW(), succeeded = ${succeeded}, score = ${score}
        WHERE id = ${examId};
    `;
};
