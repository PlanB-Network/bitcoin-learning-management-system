import { sql } from '@blms/database';
import type { UserRoles } from '@blms/types';

export const getUserRolesQuery = (name: string, role: string) => {
  const rolePattern = `%${role}`;
  const searchPattern = `%${name}%`;

  return sql<UserRoles[]>`
    SELECT 
      a.uid,
      a.username,
      a.display_name,
      a.email,
      a.contributor_id,
      a.role,
      a.professor_id,
      COALESCE(p.name, '') as professor_name
    FROM users.accounts a
    LEFT JOIN content.professors p ON p.id = a.professor_id
    WHERE
      role::text ILIKE ${rolePattern}
      AND (username ILIKE ${searchPattern}
        OR display_name ILIKE ${searchPattern})
    ORDER BY username
    LIMIT 5
    ;
  `;
};
