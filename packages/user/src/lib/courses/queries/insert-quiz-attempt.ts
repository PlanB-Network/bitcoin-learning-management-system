import { sql } from '@blms/database';
import type { CourseQuizAttempts } from '@blms/types';

export const insertQuizAttempt = ({
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
  return sql<CourseQuizAttempts[]>`
    INSERT INTO users.quiz_attempts (
      uid, chapter_id, questions_count, correct_answers_count
    ) VALUES (
      ${uid}, ${chapterId}, ${questionsCount}, ${correctAnswersCount}
    )
    RETURNING *;
  `;
};
