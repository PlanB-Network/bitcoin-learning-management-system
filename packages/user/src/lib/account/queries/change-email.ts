import { sql } from '@sovereign-university/database';
import { UserAccount } from '@sovereign-university/types';

export const changeEmailQuery = (uid: string, email: string) => {
  return sql<Array<Pick<UserAccount, 'email'>>>`
    UPDATE users.accounts
    SET email = ${email}
    WHERE uid = ${uid}
    RETURNING email;
  `;
};
