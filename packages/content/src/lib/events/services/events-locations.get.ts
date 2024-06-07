import type { Dependencies } from '../../dependencies.js';
import { getEventsLocationsQuery } from '../queries/events-locations.js';

export const createGetEventsLocations = ({ postgres }: Dependencies) => {
  return async () => {
    return postgres.exec(getEventsLocationsQuery());
  };
};
