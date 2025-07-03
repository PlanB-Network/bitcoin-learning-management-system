// TODO: use normal error

import type { UserRole } from '@blms/constants';

import { firstRow } from '@blms/database';
import { TRPCError } from '@trpc/server';
import type { Dependencies } from '../../../dependencies.js';
import { changeRoleQuery } from '../queries/change-role.js';
import { getUserByIdQuery } from '../queries/get-user.js';

interface ChangeRoleOptions {
  uid: string;
  role: UserRole;
  professorId?: string | null;
}

export const createChangeRole = ({ postgres }: Dependencies) => {
  return async ({ uid, role, professorId = null }: ChangeRoleOptions) => {
    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Unknown uid',
      });
    }

    await postgres.exec(changeRoleQuery(uid, role, professorId));
  };
};
