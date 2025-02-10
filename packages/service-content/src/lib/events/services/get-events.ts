import type { JoinedEvent } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import {
  getRecentEventsQuery,
  getUpcomingEventQuery,
  getUpcomingEventsBookingQuery,
} from '../queries/get-events.js';

export const createGetUpcomingEventsBooking = ({ postgres }: Dependencies) => {
  return (): Promise<JoinedEvent[]> => {
    return postgres.exec(getUpcomingEventsBookingQuery());
  };
};

export const createGetRecentEvents = ({ postgres }: Dependencies) => {
  return (): Promise<JoinedEvent[]> => {
    return postgres.exec(getRecentEventsQuery());
  };
};

export const createGetUpcomingEvent = ({ postgres }: Dependencies) => {
  return async (): Promise<JoinedEvent | null> => {
    const result = await postgres.exec(getUpcomingEventQuery());
    return result[0] || null;
  };
};
