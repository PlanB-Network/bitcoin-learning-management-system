import type { UserEvent } from '@blms/types';

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
