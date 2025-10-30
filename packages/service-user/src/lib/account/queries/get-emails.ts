import { sql } from '@blms/database';

export const getCareerAdminEmailsQuery = () => {
  return sql<{ email: string }[]>`
    SELECT
      a.email
    FROM users.accounts a
    WHERE
      a.email IS NOT NULL
      AND (
        a.role = 'superadmin'
        OR (
          a.role = 'admin'
          AND 'admin:career' = ANY(a.permissions)
        )
      )
    ;
  `;
};
