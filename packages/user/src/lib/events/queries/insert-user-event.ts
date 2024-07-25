import { sql } from '@blms/database';
import type { UserEvent } from '@blms/types';

export const insertUserEvent = ({
  uid,
  eventId,
  booked,
  withPhysical,
}: {
  uid: string;
  eventId: string;
  booked: boolean;
  withPhysical: boolean;
}) => {
  return sql<UserEvent[]>`
  INSERT INTO users.user_event (
    uid, event_id, booked, with_physical
  ) VALUES (
    ${uid}, ${eventId}, ${booked}, ${withPhysical}
  )
  ON CONFLICT (uid, event_id) DO UPDATE SET
    booked = EXCLUDED.booked,
    with_physical = EXCLUDED.with_physical
  RETURNING *;
  `;
};
