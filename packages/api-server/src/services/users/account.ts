import { TRPCError } from '@trpc/server';
import { hash, verify as verifyHash } from 'argon2';

import {
  changePasswordQuery,
  firstRow,
  getUserDetailsQuery,
} from '@sovereign-academy/database';
import type { PostgresClient } from '@sovereign-academy/database';
import { Account, UserDetails } from '@sovereign-academy/types';

import { Dependencies } from '../../dependencies';

export const createAddCredentialsUser =
  (dependencies: Dependencies) =>
  async ({
    username,
    passwordHash,
    contributorId,
    email,
  }: {
    username: string;
    passwordHash: string;
    contributorId: string;
    email?: string;
  }) => {
    const { postgres } = dependencies;

    return postgres<UserDetails[]>`
      INSERT INTO users.accounts (username, display_name, password_hash, email, contributor_id)
      VALUES (
        ${username},
        ${username},
        ${passwordHash},
        ${email || null}, 
        ${contributorId})
      RETURNING uid, username, display_name, email, contributor_id;
    `.then(firstRow) as Promise<UserDetails>;
  };

export const createGetUserByAny =
  (dependencies: Dependencies) =>
  async ({
    username,
    uid,
  }: {
    username?: string;
    uid?: string;
  } = {}) => {
    const { postgres } = dependencies;

    return postgres<Account[]>`
      SELECT *
      FROM users.accounts
      WHERE
        ${username ? postgres`username = ${username}` : postgres``}
        ${username && uid ? postgres`OR` : postgres``}
        ${uid ? postgres`uid = ${uid}` : postgres``};
    `.then(firstRow);
  };

export const createChangePassword =
  (dependencies: Dependencies) =>
  async (uid: string, oldPassword: string, newPassword: string) => {
    const { postgres } = dependencies;

    const getUserByAny = createGetUserByAny(dependencies);

    const user = await getUserByAny({
      uid,
    });

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    if (!user.password_hash) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This user has no password, try another login method',
      });
    }

    if (!(await verifyHash(user.password_hash, oldPassword))) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    const hashedPassword = await hash(newPassword);

    await postgres.exec(changePasswordQuery(uid, hashedPassword));
  };

export const createGetUserDetails =
  (dependencies: Dependencies) => async (uid: string) => {
    const { postgres } = dependencies;

    const user = await postgres.exec(getUserDetailsQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    return user;
  };
