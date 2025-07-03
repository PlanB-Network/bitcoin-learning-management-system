// TODO: use normal error

import { firstRow } from '@blms/database';
import { TRPCError } from '@trpc/server';
import type { Dependencies } from '../../../dependencies.js';
import { changePermissionQuery } from '../queries/change-permission.js';
import { getUserByIdQuery } from '../queries/get-user.js';

interface ChangePermissionOptions {
  uid: string;
  permissions: string[];
}

export const createChangePermission = ({ postgres }: Dependencies) => {
  return async ({ uid, permissions }: ChangePermissionOptions) => {
    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Unknown uid',
      });
    }

    await postgres.exec(changePermissionQuery(uid, permissions));
  };
};
