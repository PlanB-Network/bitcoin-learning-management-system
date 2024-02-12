import type { PostgresClient } from '@sovereign-university/database';

export const addCredentialsUser = async (
  postgres: PostgresClient,
  {
    username,
    passwordHash,
    contributorId,
    email,
  }: {
    username: string;
    passwordHash: string;
    contributorId: string;
    email?: string;
  },
) => {
  return postgres<
    {
      id: string;
      username: string;
      password_hash: string;
      email: string | null;
      contributor_id: string;
    }[]
  >`
    INSERT INTO users.accounts (username, password_hash, email, contributor_id)
    VALUES (${username}, ${passwordHash}, ${email || null}, ${contributorId})
    RETURNING *;
  `;
};
