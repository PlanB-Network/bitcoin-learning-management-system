import { sql } from '@sovereign-university/database';
import type { UserAccount } from '@sovereign-university/types';

type GetUserOptions =
  | {
      uid: string;
    }
  | {
      username: string;
    }
  | {
      lud4PublicKey: string;
    };

export const getUserQuery = (options: GetUserOptions) => {
  const [key, value] = Object.entries(options)[0];

  if (key === 'lud4PublicKey') {
    return sql<UserAccount[]>`
      SELECT a.* 
      FROM users.accounts a
      JOIN users.lud4_public_keys l ON a.uid = l.uid
      WHERE l.public_key = ${value};
    `;
  }

  return sql<UserAccount[]>`
    SELECT * FROM users.accounts
    WHERE ${sql(key)} ILIKE ${value};
  `;
};

export const getUserByIdQuery = (uid: string) => {
  return sql<UserAccount[]>`
    SELECT * FROM users.accounts
    WHERE uid = ${uid};
  `;
};

export const getUserByEmailQuery = (email: string) => {
  // UserAccount & { email: string } is used to specify that the email field will be not null
  // at this point, the email field is not null because it is being used in the WHERE clause
  return sql<(UserAccount & { email: string })[]>`
    SELECT * FROM users.accounts
    WHERE email = ${email};
  `;
};
