// TODO: use normal error
import { TRPCError } from '@trpc/server';

import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import {
  changeRoleQuery,
  changeRoleToProfessorQuery,
} from '../queries/change-role.js';
import { getUserByIdQuery } from '../queries/get-user.js';

interface ChangeRoleOptions {
  uid: string;
  role: string;
}

export const createChangeRole = ({ postgres }: Dependencies) => {
  return async ({ uid, role }: ChangeRoleOptions) => {
    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Unknown uid',
      });
    }

    await postgres.exec(changeRoleQuery(uid, role));
  };
};

interface ChangeRoleToProfessorOptions {
  uid: string;
  role: string;
  professorId?: number | null;
}

export const createChangeRoleToProfessor = ({ postgres }: Dependencies) => {
  return async ({
    uid,
    role,
    professorId = null,
  }: ChangeRoleToProfessorOptions) => {
    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Unknown uid',
      });
    }

    await postgres.exec(changeRoleToProfessorQuery(uid, role, professorId));
  };
};
