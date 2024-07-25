// TODO: use normal error
import { TRPCError } from '@trpc/server';

import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { changeDisplayNameQuery, getUserByIdQuery } from '../queries/index.js';

export const createChangeDisplayName =
  (dependencies: Dependencies) =>
  async ({ uid, displayName }: { uid: string; displayName: string }) => {
    const { postgres } = dependencies;

    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    await postgres.exec(changeDisplayNameQuery(uid, displayName));
  };
