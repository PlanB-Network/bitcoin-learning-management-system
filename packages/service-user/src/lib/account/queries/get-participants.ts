import { sql } from '@blms/database';

export const getAllParticipants = () => {
  return sql`
    SELECT
      ue.uid,
      ue.event_id,
      ua.username,
      ua.display_name,
      ue.booked,
      ue.with_physical
    FROM
      users.user_event AS ue
    JOIN
      users.accounts AS ua ON ue.uid = ua.uid;

  `;
};
