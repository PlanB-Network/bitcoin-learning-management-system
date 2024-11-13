import type { CalendarEvent } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getCalendarEventsQuery } from '../queries/get-calendar-events.js';

interface Options {
  uid: string;
  language: string;
  upcomingEvents?: boolean;
}

export const createGetCalendarEvents = ({ postgres }: Dependencies) => {
  return ({
    uid,
    language,
    upcomingEvents,
  }: Options): Promise<CalendarEvent[]> => {
    return postgres.exec(getCalendarEventsQuery(uid, language, upcomingEvents));
  };
};
