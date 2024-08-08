import type { Dependencies } from '../../../dependencies.js';
import { getUserEventsQuery } from '../queries/get-user-events.js';

export const createGetUserEvents =
  (dependencies: Dependencies) =>
  async ({ uid }: { uid: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(getUserEventsQuery(uid));
  };
