// TODO: use normal error
import { TRPCError } from '@trpc/server';

import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { changeDisplayNameQuery } from '../queries/change-display-name.js';
import { getUserByIdQuery } from '../queries/get-user.js';

interface Options {
  uid: string;
  displayName: string;
}

export const createChangeDisplayName = ({ postgres }: Dependencies) => {
  return async ({ uid, displayName }: Options) => {
    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    await postgres.exec(changeDisplayNameQuery(uid, displayName));
  };
};
