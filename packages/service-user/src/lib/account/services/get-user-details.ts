import { TRPCError } from '@trpc/server';

import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { getUserDetailsQuery } from '../queries/get-user-details.js';

export const createGetUserDetails = ({ postgres }: Dependencies) => {
  return async ({ uid }: { uid: string }) => {
    const user = await postgres.exec(getUserDetailsQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    return user;
  };
};
