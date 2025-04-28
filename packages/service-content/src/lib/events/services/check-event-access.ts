import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import type { Event } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';

interface EventAccessResponse extends Pick<Event, 'id'> {
  uid: string | null;
  allowed: string;
}

export const createCheckEventAccess = ({ postgres }: Dependencies) => {
  return (eid: string, uid: string | null): Promise<EventAccessResponse> => {
    return postgres
      .exec(
        sql<EventAccessResponse[]>`
        SELECT
            e.id,
            CASE
                WHEN e.book_in_person = false THEN true
                WHEN ue.uid IS NOT NULL AND ue.booked = true THEN true
                WHEN ep.uid IS NOT NULL AND ep.payment_status = 'paid' THEN true
                ELSE false
            END AS allowed
        FROM
            content.events e
        LEFT JOIN
            users.event_payment ep ON e.id = ep.event_id AND ep.uid = ${uid}
        LEFT JOIN
            users.user_event ue ON e.id = ue.event_id AND ue.uid = ${uid}
        WHERE
            e.id = ${eid};
      `,
      )
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
