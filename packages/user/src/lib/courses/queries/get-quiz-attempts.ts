import { sql } from '@sovereign-university/database';
import type { QuizAttempt } from '@sovereign-university/types';

export const getQuizAttemptsQuery = (uid: string) => {
  return sql<QuizAttempt[]>`
    SELECT * FROM users.quiz_attempts
    WHERE uid = ${uid};
  `;
};
