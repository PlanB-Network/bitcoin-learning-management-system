import { sql } from '@blms/database';
import type { CourseQuizAttempts } from '@blms/types';

export const getQuizAttemptsQuery = (uid: string) => {
  return sql<CourseQuizAttempts[]>`
    SELECT * FROM users.quiz_attempts
    WHERE uid = ${uid};
  `;
};
