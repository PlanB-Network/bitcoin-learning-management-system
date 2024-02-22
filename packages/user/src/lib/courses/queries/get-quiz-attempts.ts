import { sql } from '@sovereign-university/database';
import type { CourseQuizAttempts } from '@sovereign-university/types';

export const getQuizAttemptsQuery = (uid: string) => {
  return sql<CourseQuizAttempts[]>`
    SELECT * FROM users.quiz_attempts
    WHERE uid = ${uid};
  `;
};
