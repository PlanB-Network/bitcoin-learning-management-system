import { firstRow, sql } from '@blms/database';
import type { UserEvent } from '@blms/types';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../../dependencies.js';
import { insertUserEvent } from '../queries/insert-user-event.js';
import { createSendEventBookingEmail } from './send-booking-email.js';

interface Options {
  uid: string;
  eventId: string;
  booked: boolean;
  withPhysical: boolean;
}

export const createSaveUserEvent = (dependencies: Dependencies) => {
  return async (options: Options): Promise<UserEvent[]> => {
    const { postgres, config } = dependencies;

    // Booking without a checkout is only for free events: a paid event needs
    // a paid payment from this user first.
    if (options.booked) {
      const event = await postgres
        .exec(
          sql<{ priceDollars: number | null }[]>`
            SELECT price_dollars FROM content.events WHERE id = ${options.eventId}
          `,
        )
        .then(firstRow);

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }

      if (event.priceDollars) {
        const payment = await postgres
          .exec(
            sql<{ uid: string }[]>`
              SELECT uid FROM users.event_payment
              WHERE uid = ${options.uid}
                AND event_id = ${options.eventId}
                AND payment_status = 'paid'
            `,
          )
          .then(firstRow);

        if (!payment) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Payment required to book this event',
          });
        }
      }
    }

    const userEvent = await postgres.exec(insertUserEvent(options));

    if (options.booked) {
      await createSendEventBookingEmail({ postgres, config })({
        eventId: options.eventId,
        userId: options.uid,
      });
    }

    return userEvent;
  };
};
