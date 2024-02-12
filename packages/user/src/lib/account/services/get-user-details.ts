import { TRPCError } from '@trpc/server';

import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../../dependencies.js';
import { getUserDetailsQuery } from '../queries/index.js';

export const createGetUserDetails =
  (dependencies: Dependencies) =>
  async ({ uid }: { uid: string }) => {
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
