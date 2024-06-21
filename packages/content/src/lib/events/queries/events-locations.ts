import { sql } from '@sovereign-university/database';
import type { EventLocation } from '@sovereign-university/types';

/**
 * Get all "address_line_1" values from the events table that do not
 * have a corresponding entry in the event_locations table.
 */
export const getEventsWithoutLocationQuery = () => {
  return sql<Array<{ name: string }>>`
    SELECT e.address_line_1 as name
      FROM content.events e 
      LEFT JOIN content.event_locations el
      ON e.address_line_1 = el.name
      WHERE el.name IS NULL AND e.address_line_1 IS NOT NULL
      GROUP BY e.address_line_1
  `;
};

/**
 * Set the location in the event_locations table.
 */
export const setEventLocationQuery = (input: EventLocation) => {
  return sql`
    INSERT INTO content.event_locations (place_id, name, lat, lng)
    VALUES (${input.placeId}, ${input.name}, ${input.lat}, ${input.lng})
  `;
};

/**
 * Get all event locations.
 */
export const getEventsLocationsQuery = () => {
  return sql<EventLocation[]>`
    SELECT *
      FROM content.event_locations
  `;
};
