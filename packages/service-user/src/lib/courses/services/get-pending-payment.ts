import { sql } from '@blms/database';
import type { EventPayment } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

export const createGetPendingCoursePayments = ({ postgres }: Dependencies) => {
  type Result = Pick<EventPayment, 'uid' | 'eventId' | 'paymentId'>;

  return (): Promise<Result[]> => {
    return postgres.exec(sql<Result[]>`
      SELECT
        uid,
        event_id,
        payment_id
      FROM
        users.event_payment
      WHERE
        payment_status = 'pending'
        AND method = 'sbp'
      ;
    `);
  };
};
