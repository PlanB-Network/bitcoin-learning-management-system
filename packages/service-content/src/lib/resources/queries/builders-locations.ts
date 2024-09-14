/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { sql } from '@blms/database';
import type { BuilderLocation } from '@blms/types';

/**
 * Obtener todas las direcciones (address_line_1) de la tabla builders
 * que no tienen una entrada correspondiente en la tabla builders_locations.
 */
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

/**
 * Insert location in table builders_locations.
 */
export const setBuilderLocationQuery = (input: BuilderLocation) => {
  return sql`
    INSERT INTO content.builders_locations (place_id, name, lat, lng)
    VALUES (${input.placeId}, ${input.name}, ${input.lat}, ${input.lng})
  `;
};

/**
 * Obtener todas las ubicaciones de builders.
 */
export const getBuildersLocationsQuery = () => {
  return sql<BuilderLocation[]>`
    SELECT *
    FROM content.builders_locations
  `;
};
