import { sql } from '@sovereign-university/database';

export const changeDisplayNameQuery = (uid: string, displayName: string) => {
  return sql`
    UPDATE users.accounts
    SET display_name = ${displayName}
    WHERE uid = ${uid};
  `;
};
