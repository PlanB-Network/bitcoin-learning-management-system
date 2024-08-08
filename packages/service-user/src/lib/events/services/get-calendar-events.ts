import type { Dependencies } from '../../../dependencies.js';
import { getCalendarEventsQuery } from '../queries/get-calendar-events.js';

export const createGetCalendarEvents =
  (dependencies: Dependencies) =>
  async ({ uid, language }: { uid: string; language: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(getCalendarEventsQuery(uid, language));
  };
