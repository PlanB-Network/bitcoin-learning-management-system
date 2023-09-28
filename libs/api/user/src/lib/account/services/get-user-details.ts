import { firstRow } from '@sovereign-university/database';
import { Dependencies } from '../../../dependencies';
import { getUserDetailsQuery } from '../queries';
import { TRPCError } from '@trpc/server';

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
