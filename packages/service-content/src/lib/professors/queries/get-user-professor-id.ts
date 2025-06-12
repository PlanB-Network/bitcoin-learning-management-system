import { sql } from '@blms/database';

export const getUserProfessorIdQuery = (uid: string) => {
  return sql`
    SELECT
      professor_id
    FROM users.accounts ua
    WHERE ua.uid = ${uid}
  `;
};
