import { sql } from '@blms/database';
import type { JoinedLegalLight } from '@blms/types';

export const getLegalsQuery = (language?: string) => {
  return sql<JoinedLegalLight[]>`
    SELECT 
        l.id, 
        l.path, 
        l.name,
        ll.language, 
        ll.title, 
        l.last_updated, 
        l.last_commit,
        l.last_sync
    FROM content.legals l
    JOIN content.legals_localized ll ON l.id = ll.id
    ${language ? sql`WHERE ll.language = ${language}` : sql``}
    GROUP BY 
        l.id, 
        ll.language, 
        ll.title, 
        l.last_updated, 
        l.last_commit,
        l.last_sync
  `;
};
