import { firstRow } from '@sovereign-academy/database';
import type { PostgresClient } from '@sovereign-academy/database';
import { Account } from '@sovereign-academy/types';

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
    Pick<Account, 'uid' | 'username' | 'email' | 'contributor_id'>[]
  >`
    INSERT INTO users.accounts (username, password_hash, email, contributor_id)
    VALUES (${username}, ${passwordHash}, ${email || null}, ${contributorId})
    RETURNING uid, username, email, contributor_id;
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
  return postgres<Account[]>`
    SELECT *
    FROM users.accounts
    WHERE
      ${username ? postgres`username = ${username}` : postgres``}
      ${username && uid ? postgres`OR` : postgres``}
      ${uid ? postgres`uid = ${uid}` : postgres``};
  `.then(firstRow);
};
