// TODO: use normal error
import { TRPCError } from '@trpc/server';
import { hash, verify as verifyHash } from 'argon2';

import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { changePasswordQuery } from '../queries/change-password.js';
import { getUserByIdQuery } from '../queries/get-user.js';

export const createChangePassword =
  (dependencies: Dependencies) =>
  async ({
    uid,
    oldPassword,
    newPassword,
  }: {
    uid: string;
    oldPassword: string;
    newPassword: string;
  }) => {
    const { postgres } = dependencies;

    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    if (!user.passwordHash) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This user has no password, try another login method',
      });
    }

    if (!(await verifyHash(user.passwordHash, oldPassword))) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    const hashedPassword = await hash(newPassword);
    await postgres.exec(changePasswordQuery(uid, hashedPassword));
  };
