import { sql } from '@blms/database';
import type { EventPayment } from '@blms/types';

export const getEventPaymentsQuery = (uid: string) => {
  return sql<EventPayment[]>`
    SELECT *
    FROM users.event_payment
    WHERE uid = ${uid}
    ;
  `;
};
