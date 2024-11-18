import { sql } from '@blms/database';
import type { UserRoles } from '@blms/types';

export const getUserRolesQuery = (
  role: string,
  name: string,
  orderField: 'displayName' | 'username',
  orderDirection: 'asc' | 'desc',
  limit?: number,
  cursor?: string,
) => {
  const rolePattern = `%${role}`;
  const searchPattern = `%${name}%`;
  const orderFieldPattern =
    orderField === 'displayName' ? 'display_name' : 'username';

  const comparisonOperator = orderDirection === 'asc' ? sql`>=` : sql`<=`;
  const cursorCondition = cursor
    ? sql`AND a.${sql(orderFieldPattern)} ${comparisonOperator} ${cursor}`
    : sql``;
  const orderDirectionKeyword = orderDirection === 'asc' ? sql`ASC` : sql`DESC`;

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
      ${cursorCondition}
    ORDER BY a.${sql(orderFieldPattern)} ${orderDirectionKeyword}
    ${limit && sql`LIMIT ${limit}`}
    ;
  `;
};
