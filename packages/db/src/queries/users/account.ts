import { sql } from '../../index';

export const anyContributorIdExistsQuery = (ids: string[]) => {
  return sql`
    SELECT COUNT(*) FROM users.accounts WHERE contributor_id = ANY(${ids}::varchar[]);
  `;
};

export const contributorIdExistsQuery = (id: string) => {
  return sql`
    SELECT COUNT(*) FROM users.accounts WHERE contributor_id = ${id};
  `;
};
