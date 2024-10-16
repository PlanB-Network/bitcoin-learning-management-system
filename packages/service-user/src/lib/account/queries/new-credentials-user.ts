import { sql } from '@blms/database';
import type { UserDetails } from '@blms/types';

interface NewCredentialsUserOptions {
  username: string;
  passwordHash: string;
  contributorId: string;
  email?: string;
}

export const newCredentialsUserQuery = ({
  username,
  passwordHash,
  contributorId,
  email,
}: NewCredentialsUserOptions) => {
  return sql<UserDetails[]>`
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
    RETURNING uid, username, display_name, certificate_name, email, contributor_id;
  `;
};
