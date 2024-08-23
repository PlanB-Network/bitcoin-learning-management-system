import { sql } from '@blms/database';
import type { JoinedLegal } from '@blms/types';

export const getLegalQuery = (name: string, language?: string) => {
  return sql<JoinedLegal[]>`
    SELECT 
        l.id, 
        l.path, 
        l.name,
        ll.language, 
        ll.title, 
        ll.raw_content, 
        l.last_updated, 
        l.last_commit,
        l.last_sync
    FROM content.legals l
    JOIN content.legals_localized ll ON l.id = ll.id
    WHERE l.name = ${name} 
    ${language ? sql`AND ll.language = ${language}` : sql``}
    GROUP BY 
        l.id, 
        ll.language, 
        ll.title, 
        ll.raw_content, 
        l.last_updated, 
        l.last_commit,
        l.last_sync
  `;
};
