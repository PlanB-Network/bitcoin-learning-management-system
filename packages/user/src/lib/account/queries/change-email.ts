import { sql } from '@blms/database';
import type { UserAccount } from '@blms/types';

export const changeEmailQuery = (uid: string, email: string) => {
  return sql<Array<Pick<UserAccount, 'email'>>>`
    UPDATE users.accounts
    SET email = ${email}
    WHERE uid = ${uid}
    RETURNING email;
  `;
};
