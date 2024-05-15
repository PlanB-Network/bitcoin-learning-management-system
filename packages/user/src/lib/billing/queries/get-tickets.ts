import { sql } from '@sovereign-university/database';
import type { Ticket } from '@sovereign-university/types';

export const getTicketsQuery = (uid: string) => {
  return sql<Ticket[]>`
    SELECT
      ev.start_date as date,
      COALESCE(ev.address_line_3, ev.address_line_2, ev.address_line_1) as location, 
      ev.name as title,
      ev.type::text as type,
      ep.with_physical as is_in_person
    FROM  users.event_payment ep
    JOIN content.events ev ON ep.event_id = ev.id 
    WHERE ep.uid = ${uid}
    
    UNION ALL

    SELECT 
      ev.start_date as date,
      COALESCE(ev.address_line_3, ev.address_line_2, ev.address_line_1) as location, 
      ev.name as title,
      ev.type::text as type,
      ue.with_physical as is_in_person
    FROM users.user_event ue
    JOIN content.events ev ON ue.event_id = ev.id 
    WHERE ue.uid = ${uid}
  `;
  // TODO add course_user_chapter when booked => Would need chapter_id
};
