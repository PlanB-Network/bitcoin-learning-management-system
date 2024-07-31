import type { Dependencies } from '../../../dependencies.js';
import { getUserRolesQuery } from '../queries/index.js';

export const createGetUsersRoles =
  (dependencies: Dependencies) =>
  async ({ name, role }: { name: string; role: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(getUserRolesQuery(name, role));
  };
