import { sql } from '@sovereign-university/database';
import { Account } from '@sovereign-university/types';

type GetUserOptions =
  | {
      uid: string;
    }
  | {
      username: string;
    };

export const getUserQuery = (options: GetUserOptions) => {
  const [key, value] = Object.entries(options)[0];

  return sql<Account[]>`
    SELECT * FROM users.accounts
    WHERE ${sql(key)} = ${value};
  `;
};
