import { sql } from '@sovereign-university/database';
import type { UserDetails } from '@sovereign-university/types';

export const setProfilePictureQuery = (uid: string, fileId: string) => {
  return sql<UserDetails[]>`
    UPDATE users.accounts
    SET picture = ${fileId}
    WHERE uid = ${uid}
    RETURNING 
      uid,
      username,
      display_name,
      email,
      picture,
      contributor_id,
      created_at;
  `;
};
