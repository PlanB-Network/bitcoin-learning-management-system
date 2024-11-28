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
                WHEN e.book_online = false THEN true
                WHEN ep.uid IS NOT NULL AND ep.payment_status = 'paid' THEN true
                ELSE false
            END AS allowed
        FROM
            content.events e
        LEFT JOIN
            users.event_payment ep ON e.id = ep.event_id AND ep.uid = ${uid}
        WHERE
            e.id = ${eid};
      `,
      )
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
