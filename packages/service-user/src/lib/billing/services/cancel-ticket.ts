import { sql } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';

export const createCancelTicket = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async ({
    uid,
    ticketId,
    eventType,
  }: {
    uid: string;
    ticketId: string;
    eventType: string;
  }) => {
    console.log(`------------------${eventType} -- ${ticketId}`);
    if (eventType === 'course') {
      return postgres
        .exec(
          sql`UPDATE users.course_user_chapter
              SET booked = false
              WHERE uid = ${uid}
                AND chapter_id = ${ticketId}
        `,
        )
        .then(() => void 0);
    }

    return postgres
      .exec(
        sql`DELETE FROM users.user_event
              WHERE uid = ${uid}
                AND event_id = ${ticketId}
        `,
      )
      .then(() => void 0);
  };
};
