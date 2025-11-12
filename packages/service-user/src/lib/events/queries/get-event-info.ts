import { sql } from '@blms/database';

export const getEventMinimalInfoQuery = (id: string) => {
  return sql<{ name: string; startDate: string }[]>`
    SELECT
      e.name,
      e.start_date
    FROM content.events e
    WHERE e.id = ${id}
  `;
};
