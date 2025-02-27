import { sql } from '@blms/database';
import type { UserAccount } from '@blms/types';

interface NewCredentialsUserOptions {
  username: string;
  passwordHash: string;
  contributorId: string;
  email: string | null;
}

export const newCredentialsUserQuery = ({
  username,
  passwordHash,
  contributorId,
  email,
}: NewCredentialsUserOptions) => {
  return sql<UserAccount[]>`
    INSERT INTO users.accounts (
      username,
      display_name,
      certificate_name,
      password_hash,
      email,
      contributor_id
    ) VALUES (
      ${username.toLowerCase()},
      ${username},
      ${username},
      ${passwordHash},
      ${email || null},
      ${contributorId})
    RETURNING
      uid,
      username,
      display_name,
      certificate_name,
      contributor_id,
      email,
      role,
      permissions
      ;
  `;
};
