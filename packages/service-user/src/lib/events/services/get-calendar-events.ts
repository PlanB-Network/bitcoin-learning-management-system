import type { CalendarEvent } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getCalendarEventsQuery } from '../queries/get-calendar-events.js';

interface Options {
  language: string;
  uid?: string;
  upcomingEvents?: boolean;
}

export const createGetCalendarEvents = ({ postgres }: Dependencies) => {
  return ({
    language,
    uid,
    upcomingEvents,
  }: Options): Promise<CalendarEvent[]> => {
    return postgres.exec(getCalendarEventsQuery(language, uid, upcomingEvents));
  };
};
