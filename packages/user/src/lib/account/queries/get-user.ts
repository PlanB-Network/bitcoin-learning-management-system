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
    WHERE ${sql(key)} = ${value};
  `;
};
