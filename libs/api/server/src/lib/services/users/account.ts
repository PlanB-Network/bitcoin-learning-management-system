import { firstRow } from '@sovereign-university/database';
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
  }
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

export const getUserByAny = async (
  postgres: PostgresClient,
  {
    username,
    uid,
  }: {
    username?: string;
    uid?: string;
  } = {}
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
    SELECT *
    FROM users.accounts
    WHERE
      ${username ? postgres`username = ${username}` : postgres``}
      ${username && uid ? postgres`OR` : postgres``}
      ${uid ? postgres`id = ${uid}` : postgres``};
  `.then(firstRow);
};
