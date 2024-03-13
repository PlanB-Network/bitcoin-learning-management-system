import { sql } from '@sovereign-university/database';
import type { EventPayment } from '@sovereign-university/types';

export const getEventPaymentsQuery = (uid: string) => {
  return sql<EventPayment[]>`
    SELECT
      *
    FROM users.event_payment
    WHERE
      uid = ${uid}
    ;
  `;
};
