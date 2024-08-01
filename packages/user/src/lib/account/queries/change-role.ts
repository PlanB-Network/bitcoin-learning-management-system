import { sql } from '@blms/database';

export const changeRoleQuery = (uid: string, role: string) => {
  return sql`
    UPDATE users.accounts
    SET role = ${role}
    WHERE uid = ${uid};
  `;
};
