import type { UserRoles } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getUserRolesQuery } from '../queries/get-user-roles.js';

interface Options {
  role: string;
  name: string;
  orderField?: 'displayName' | 'username';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  cursor?: string;
}

export const createGetUsersRoles = ({ postgres }: Dependencies) => {
  return async ({
    name,
    role,
    orderField = 'username',
    orderDirection = 'asc',
    limit = 50,
    cursor,
  }: Options): Promise<{ users: UserRoles[]; nextCursor: string | null }> => {
    const data = await postgres.exec(
      getUserRolesQuery(
        role,
        name,
        orderField,
        orderDirection,
        limit + 1,
        cursor,
      ),
    );

    let nextCursor: string | null = null;
    if (data.length > limit) {
      const lastItem = data.pop();
      nextCursor = lastItem?.[orderField] || null;
    }

    return { users: data, nextCursor };
  };
};
