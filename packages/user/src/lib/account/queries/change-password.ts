import { sql } from '@blms/database';

export const changePasswordQuery = (uid: string, newPasswordHash: string) => {
  return sql`
    UPDATE users.accounts
    SET password_hash = ${newPasswordHash}
    WHERE uid = ${uid};
  `;
};
