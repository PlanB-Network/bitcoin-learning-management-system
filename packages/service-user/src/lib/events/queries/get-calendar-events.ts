import { sql } from '@blms/database';
import type { CalendarEvent } from '@blms/types';

export const getCalendarEventsQuery = (
  uid?: string,
  upcomingEvents?: boolean,
) => {
  return sql<CalendarEvent[]>`
  SELECT
    e.id::text as id,
    '' as sub_id,
    'event' as type,
    e.name,
    COALESCE(
      (SELECT bu.name FROM content.projects bu WHERE bu.id = e.project_id LIMIT 1),
      ''
      ) AS organizer,
    e.start_date,
    e.end_date,
    e.timezone,
    e.book_online as is_online,
    COALESCE(e.book_in_person, false) AS is_in_person,
    e.address_line_1,
    e.address_line_2,
    e.address_line_3
  FROM content.events e
  FULL JOIN users.user_event ue on e.id = ue.event_id
  WHERE 1 = 1
    ${uid ? sql`AND ue.uid = ${uid} AND ue.booked = true` : sql``}
    ${upcomingEvents ? sql`AND e.start_date > (NOW() - INTERVAL '1 DAY')` : sql``}

  UNION

  SELECT
    e.id::text,
    '' as sub_id,
    'event' as type,
    e.name,
    COALESCE(
      (SELECT bu.name FROM content.projects bu WHERE bu.id = e.project_id LIMIT 1),
      ''
      ) AS organizer,
    e.start_date,
    e.end_date,
    e.timezone,
    e.book_online as is_online,
    COALESCE(e.book_in_person, false) AS is_in_person,
    e.address_line_1,
    e.address_line_2,
    e.address_line_3
  FROM content.events e
  JOIN users.event_payment ep ON e.id = ep.event_id
  WHERE ep.payment_status = 'paid'
    ${uid ? sql`AND ep.uid = ${uid}` : sql``}
    ${upcomingEvents ? sql`AND e.start_date > (NOW() - INTERVAL '1 DAY')` : sql``}

  UNION

  SELECT
    cl.course_id as id,
    cl.chapter_id::text as sub_id,
    'class' as type,
    CONCAT(UPPER(c.index),' ',cl.title) as name,
    COALESCE(array_to_string(cp_agg.professors, ', '), '') as organizer,
    cl.start_date,
    cl.end_date,
    cl.timezone,
    cl.is_online,
    cl.is_in_person,
    cl.address_line_1,
    cl.address_line_2,
    cl.address_line_3
  FROM content.course_chapters_localized cl
  JOIN content.courses c ON c.id = cl.course_id
  ${uid ? sql`JOIN users.course_payment cp on cl.course_id = cp.course_id` : sql``}
  LEFT JOIN LATERAL (
    SELECT ARRAY_AGG(pr.name) as professors
    FROM content.course_professors cp
    JOIN content.professors pr on cp.professor_id = pr.id
    WHERE cp.course_id = cl.course_id
  ) AS cp_agg ON TRUE
  WHERE 1 = 1
    ${uid ? sql`AND cp.uid = ${uid} AND cp.payment_status = 'paid'` : sql``}
    AND cl.start_date IS NOT NULL
    ${upcomingEvents ? sql`AND cl.start_date > (NOW() - INTERVAL '1 DAY')` : sql``}
  `;
};
