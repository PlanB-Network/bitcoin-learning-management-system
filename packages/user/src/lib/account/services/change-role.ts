// TODO: use normal error
import { TRPCError } from '@trpc/server';

import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { changeRoleQuery, getUserByIdQuery } from '../queries/index.js';

export const createChangeRole =
  (dependencies: Dependencies) =>
  async ({ uid, role }: { uid: string; role: string }) => {
    const { postgres } = dependencies;

    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Unknown uid',
      });
    }

    await postgres.exec(changeRoleQuery(uid, role));
  };
