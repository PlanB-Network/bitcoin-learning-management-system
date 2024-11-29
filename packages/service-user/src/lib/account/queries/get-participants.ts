import { sql } from '@blms/database';

export const getEventParticipants = () => {
  return sql`
    SELECT
      ue.uid,
      ua.username,
      ua.display_name,
      COALESCE(ua.email, '') AS email,
      ue.event_id AS id
    FROM
      users.user_event AS ue
    JOIN
      users.accounts AS ua ON ue.uid = ua.uid
    WHERE ue.booked = true

    UNION

    SELECT
        ua.uid,
        ua.username,
        ua.display_name,
        COALESCE(ua.email, '') AS email,
        uc.chapter_id::text AS id
      FROM users.course_user_chapter uc
      LEFT JOIN users.accounts ua ON uc.uid = ua.uid

    UNION

    SELECT
      ep.uid,
      ua.username,
      ua.display_name,
      COALESCE(ua.email, '') AS email,
      ep.event_id AS id
    FROM
      users.event_payment AS ep
    LEFT JOIN
      users.accounts AS ua ON ep.uid = ua.uid
  `;
};
