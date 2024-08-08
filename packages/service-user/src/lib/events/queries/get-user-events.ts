import { sql } from '@blms/database';
import type { UserEvent } from '@blms/types';

export const getUserEventsQuery = (uid: string) => {
  return sql<UserEvent[]>`
    SELECT *
    FROM users.user_event
    WHERE uid = ${uid}
    ;
  `;
};
