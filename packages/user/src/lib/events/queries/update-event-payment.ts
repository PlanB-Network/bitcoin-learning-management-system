import { sql } from '@blms/database';
import type { EventPayment } from '@blms/types';

export const updateEventPayment = ({
  id,
  isPaid,
  isExpired,
}: {
  id: string;
  isPaid: boolean;
  isExpired: boolean;
}) => {
  console.log({ id, isPaid, isExpired });
  if (isExpired) {
    return sql<EventPayment[]>`
      UPDATE users.event_payment 
      SET payment_status = 'expired'
      WHERE payment_id = ${id} 
    ;
    `;
  } else if (isPaid) {
    return sql<EventPayment[]>`
      UPDATE users.event_payment 
      SET payment_status = 'paid'
      WHERE payment_id = ${id} 
    ;
    `;
  } else {
    throw new Error('Should have isPaid or isExpired = true');
  }
};
