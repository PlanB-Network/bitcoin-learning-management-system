import type { UserDetails } from '@sovereign-academy/types';

import { sql } from '../../index';

export const anyContributorIdExistsQuery = (ids: string[]) => {
  return sql`
    SELECT COUNT(*) FROM users.accounts WHERE contributor_id = ANY(${ids}::varchar[]);
  `;
};

export const contributorIdExistsQuery = (id: string) => {
  return sql`
    SELECT COUNT(*) FROM users.accounts WHERE contributor_id = ${id};
  `;
};

export const changePasswordQuery = (uid: string, newPasswordHash: string) => {
  return sql`
    UPDATE users.accounts
    SET password_hash = ${newPasswordHash}
    WHERE uid = ${uid};
  `;
};

export const getUserDetailsQuery = (uid: string) => {
  return sql<UserDetails[]>`
    SELECT 
      uid,
      username,
      email,
      contributor_id,
      created_at
    FROM users.accounts
    WHERE uid = ${uid};
  `;
};
