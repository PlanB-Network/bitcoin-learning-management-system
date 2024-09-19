/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { sql } from '@blms/database';
import type { BuilderLocation } from '@blms/types';

export const getBuildersWithoutLocationQuery = () => {
  return sql<Array<{ name: string }>>`
    SELECT b.address_line_1 as name
    FROM content.builders b
    LEFT JOIN content.builders_locations bl
    ON b.address_line_1 = bl.name
    WHERE bl.name IS NULL AND b.address_line_1 IS NOT NULL
    GROUP BY b.address_line_1
  `;
};

export const setBuilderLocationQuery = (input: BuilderLocation) => {
  return sql`
    INSERT INTO content.builders_locations (place_id, name, lat, lng)
    VALUES (${input.placeId}, ${input.name}, ${input.lat}, ${input.lng})
  `;
};

export const getBuildersLocationsQuery = () => {
  return sql<BuilderLocation[]>`
    SELECT *
    FROM content.builders_locations
  `;
};
