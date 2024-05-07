import { sql } from '@sovereign-university/database';
import type { UserEvent } from '@sovereign-university/types';

export const getUserEventsQuery = (uid: string) => {
  return sql<UserEvent[]>`
    SELECT *
    FROM users.user_event
    WHERE uid = ${uid}
    ;
  `;
};
