import type { EventLocation } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getEventsLocationsQuery } from '../queries/events-locations.js';

export const createGetEventsLocations = ({ postgres }: Dependencies) => {
  return (): Promise<EventLocation[]> => {
    return postgres.exec(getEventsLocationsQuery());
  };
};
