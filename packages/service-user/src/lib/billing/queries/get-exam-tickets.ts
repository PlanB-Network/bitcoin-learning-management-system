import { sql } from '@blms/database';
import type { Ticket } from '@blms/types';

export const getExamTicketsQuery = (uid: string) => {
  return sql<Ticket[]>`
    SELECT 
      ev.id as event_id,
      COALESCE(ev.start_date, current_date + interval '30 days') as date,
      COALESCE(ev.address_line_1, ev.address_line_2, ev.address_line_3, '') as location, 
      COALESCE(ev.address_line_1, '') as address_line_1,
      COALESCE(ev.address_line_2, '') as address_line_2,
      COALESCE(ev.address_line_3, '') as address_line_3,
      ev.timezone as timezone,
      ev.name as title,
      ev.type::text as type,
      ue.with_physical as is_in_person,
      ev.book_online as is_online
    FROM 
      users.user_event ue
    JOIN 
      content.events ev ON ue.event_id = ev.id 
    WHERE 
      ue.uid = ${uid}
      AND ev.type = 'exam'
    ;
  `;
};
