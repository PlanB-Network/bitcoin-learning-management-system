import { sql } from '@sovereign-university/database';
import type { QuizAttempt } from '@sovereign-university/types';

export const insertQuizAttempt = ({
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
  return sql<QuizAttempt[]>`
    INSERT INTO users.quiz_attempts (
      uid, course_id, part, chapter, questions_count, correct_answers_count
    ) VALUES (
      ${uid}, ${courseId}, ${partIndex}, ${chapterIndex}, ${questionsCount}, ${correctAnswersCount}
    )
    RETURNING *;
  `;
};
