import { sql } from '@blms/database';
import type { UserDetails } from '@blms/types';

interface NewLnurlUserOptions {
  username: string;
  publicKey: string;
  contributorId: string;
}

export const newLnurlUserQuery = ({
  username,
  publicKey,
  contributorId,
}: NewLnurlUserOptions) => {
  return sql<UserDetails[]>`
    WITH inserted_user AS (
      INSERT INTO users.accounts (
        username, 
        display_name,
        certificate_name,
        contributor_id
      ) VALUES (
        ${username.toLowerCase()},
        ${username},
        ${username},
        ${contributorId})
      RETURNING *
    ),
    inserted_key AS (
      INSERT INTO users.lud4_public_keys (uid, public_key)
      SELECT uid, ${publicKey} FROM inserted_user
      RETURNING uid
    )
    SELECT iu.uid, iu.username, iu.display_name, iu.certificate_name, iu.contributor_id 
    FROM inserted_user iu;
  `;
};
