import { sql } from '@blms/database';

export const leaveCommunityQuery = (uid: string) => {
  return sql`
    UPDATE users.accounts
    SET
      community_id = NULL,
      community_joined_at = NULL
    WHERE uid = ${uid};
  `;
};
