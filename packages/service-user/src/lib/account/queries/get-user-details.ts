import { sql } from '@blms/database';
import type { UserDetails } from '@blms/types';

export const getUserDetailsQuery = (uid: string) => {
  return sql<UserDetails[]>`
    SELECT 
      uid,
      username,
      display_name,
      email,
      picture,
      contributor_id,
      created_at
    FROM users.accounts
    WHERE uid = ${uid};
  `;
};
