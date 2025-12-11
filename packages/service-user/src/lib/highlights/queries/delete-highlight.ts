import { sql } from '@blms/database';

export const deleteHighlight = ({
  uid,
  highlightId,
}: {
  uid: string;
  highlightId: string;
}) => {
  return sql`
    DELETE FROM users.course_highlights
    WHERE id = ${highlightId} AND uid = ${uid};
  `;
};
