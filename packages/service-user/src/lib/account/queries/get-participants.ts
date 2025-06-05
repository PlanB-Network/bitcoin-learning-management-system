import { sql } from '@blms/database';
import type { CalendarEventParticipant } from '@blms/types';

export const getEventParticipants = () => {
  return sql<CalendarEventParticipant[]>`
    SELECT
      ue.uid,
      ua.username,
      ua.display_name,
      COALESCE(ua.email, '') AS email,
      ue.event_id AS id
    FROM
      users.user_event AS ue
    JOIN
      content.events ev ON ue.event_id = ev.id
    JOIN
      users.accounts AS ua ON ue.uid = ua.uid
    WHERE ev.start_date > NOW() - INTERVAL '1 DAY'
      AND ue.booked = true

    UNION

    SELECT
        ua.uid,
        ua.username,
        ua.display_name,
        COALESCE(ua.email, '') AS email,
        uc.chapter_id AS id
    FROM
      users.course_user_chapter uc
    LEFT JOIN
      users.accounts ua ON uc.uid = ua.uid
    JOIN
      content.course_chapters_localized ucl on uc.course_id = ucl.course_id AND uc.chapter_id = ucl.chapter_id
    WHERE
      uc.booked = true
      AND ucl.start_date > NOW() - INTERVAL '1 DAY'

    UNION

    SELECT
      ep.uid,
      ua.username,
      ua.display_name,
      COALESCE(ua.email, '') AS email,
      ep.event_id AS id
    FROM
      users.event_payment AS ep
    JOIN
      content.events ev ON ep.event_id = ev.id
    LEFT JOIN
      users.accounts AS ua ON ep.uid = ua.uid
    WHERE ev.start_date > NOW() - INTERVAL '1 DAY'
  `;
};
