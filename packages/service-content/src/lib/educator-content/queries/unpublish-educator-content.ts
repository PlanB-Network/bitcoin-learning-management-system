import { sql } from '@blms/database';

export const unpublishEducatorContentQuery = (id: string) => {
  return sql`
    UPDATE content.educator_contents
    SET status = 'unpublished'
    WHERE id = ${id}
  `;
};
