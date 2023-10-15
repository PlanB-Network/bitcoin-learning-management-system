import { sql } from '@sovereign-university/database';
import { QuizAttempt } from '@sovereign-university/types';

export const getQuizAttemptsQuery = (uid: string) => {
  return sql<QuizAttempt[]>`
    SELECT * FROM users.quiz_attempts
    WHERE uid = ${uid};
  `;
};
