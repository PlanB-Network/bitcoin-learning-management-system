import { sql } from '@blms/database';

export const anyContributorIdExistsQuery = (ids: string[]) => {
  return sql<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM users.accounts WHERE contributor_id = ANY(${ids}::varchar[])
    ) AS exists;
  `;
};

export const contributorIdExistsQuery = (id: string) => {
  return sql<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM users.accounts WHERE contributor_id = ${id}
    ) AS exists;
  `;
};
