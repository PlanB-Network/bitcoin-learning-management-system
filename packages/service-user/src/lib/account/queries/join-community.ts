import { sql } from '@blms/database';

export const joinCommunityQuery = (uid: string, communityId: string) => {
  return sql`
    UPDATE users.accounts
    SET
      community_id = ${communityId},
      community_joined_at = NOW()
    WHERE uid = ${uid};
  `;
};
