import { sql } from '@blms/database';
import type { CommunityMember } from '@blms/types';

export const getCommunityMembersQuery = (communityId: string) => {
  return sql<CommunityMember[]>`
    SELECT username, picture
    FROM users.accounts
    WHERE community_id = ${communityId}
    ORDER BY username ASC;
  `;
};
