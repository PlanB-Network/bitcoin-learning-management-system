import type { UserRoles } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getUserRolesQuery } from '../queries/get-user-roles.js';

interface Options {
  name: string;
  role: string;
}

export const createGetUsersRoles = ({ postgres }: Dependencies) => {
  return ({ name, role }: Options): Promise<UserRoles[]> => {
    return postgres.exec(getUserRolesQuery(name, role));
  };
};
