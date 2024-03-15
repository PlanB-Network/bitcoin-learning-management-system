import { sql } from '@sovereign-university/database';
import type { Event } from '@sovereign-university/types';

export const getEventQuery = (id: string) => {
  return sql<Event[]>`
    SELECT 
      *
    FROM content.events
    WHERE id = ${id} 
  `;
};
