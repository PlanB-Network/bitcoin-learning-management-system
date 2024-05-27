import { sql } from '@sovereign-university/database';
import type { Invoice } from '@sovereign-university/types';

export const getInvoicesQuery = (uid: string, language?: string) => {
  return sql<Invoice[]>`
    SELECT ep.last_updated as date , ce.name as title, ce.type::text as type
    FROM  users.event_payment ep
    JOIN content.events ce ON ep.event_id = ce.id 
    WHERE ep.uid = ${uid}
    
    UNION ALL

    SELECT cp.last_updated as date, cl.name as title, 'course' as type
    FROM users.course_payment cp
    JOIN content.courses c ON cp.course_id = c.id
    JOIN content.courses_localized cl ON c.id = cl.course_id
    WHERE cp.uid = ${uid}
    ${language ? sql`AND cl.language = ${language}` : sql``}

    GROUP BY 
      c.id, 
      cl.language,
      cl.name,
      cp.last_updated
    ;
  `;
};
