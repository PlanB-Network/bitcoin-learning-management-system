import type { CalendarEvent } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getCalendarEventsQuery } from '../queries/get-calendar-events.js';

interface Options {
  uid?: string;
  upcomingEvents?: boolean;
  types?: string[];
  language?: string;
}

export const createGetCalendarEvents = ({ postgres }: Dependencies) => {
  return ({
    uid,
    upcomingEvents,
    types,
    language,
  }: Options): Promise<CalendarEvent[]> => {
    return postgres.exec(
      getCalendarEventsQuery(uid, upcomingEvents, types, language),
    );
  };
};
