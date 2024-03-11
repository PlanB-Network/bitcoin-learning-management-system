import { sql } from '@sovereign-university/database';
import type { Event } from '@sovereign-university/types';

export const getEventsQuery = () => {
  return sql<Event[]>`
    SELECT 
      *
    FROM content.events
  `;
};
