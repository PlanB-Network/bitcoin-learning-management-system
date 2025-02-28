import { sql } from '@blms/database';

export const changePermissionQuery = (uid: string, permissions: string[]) => {
  return sql`
    UPDATE users.accounts
    SET
      permissions = ${permissions}
    WHERE uid = ${uid};
  `;
};
