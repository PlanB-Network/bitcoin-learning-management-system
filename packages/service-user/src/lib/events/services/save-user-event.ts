import type { Dependencies } from '../../../dependencies.js';
import { insertUserEvent } from '../queries/insert-user-event.js';

export const createSaveUserEvent =
  (dependencies: Dependencies) =>
  async ({
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
    const { postgres } = dependencies;

    return postgres.exec(
      insertUserEvent({ uid, eventId, booked, withPhysical }),
    );
  };
