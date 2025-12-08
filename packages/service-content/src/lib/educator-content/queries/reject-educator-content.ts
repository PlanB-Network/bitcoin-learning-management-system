import { sql } from '@blms/database';

export const rejectEducatorContentQuery = (id: string) => {
  return sql`
    UPDATE content.educator_contents
    SET status = 'rejected'
    WHERE id = ${id}
  `;
};
