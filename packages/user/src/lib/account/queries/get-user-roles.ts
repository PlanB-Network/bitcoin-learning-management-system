import { sql } from '@blms/database';
import type { UserRoles } from '@blms/types';

export const getUserRolesQuery = (name: string, role: string) => {
  const rolePattern = `%${role}`;
  const searchPattern = `%${name}%`;

  return sql<UserRoles[]>`
    SELECT 
      uid,
      username,
      display_name,
      email,
      contributor_id,
      role
    FROM users.accounts
    WHERE
      role::text ILIKE ${rolePattern}
      AND (username ILIKE ${searchPattern}
        OR display_name ILIKE ${searchPattern})
    ORDER BY username
    LIMIT 5
    ;
  `;
};
