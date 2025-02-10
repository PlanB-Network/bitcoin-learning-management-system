import { sql } from '@blms/database';
import type { ProjectLocation } from '@blms/types';

export const getProjectsWithoutLocationQuery = () => {
  return sql<Array<{ name: string }>>`
    SELECT b.address_line_1 as name
    FROM content.projects b
    LEFT JOIN content.projects_locations bl
    ON b.address_line_1 = bl.name
    WHERE bl.name IS NULL AND b.address_line_1 IS NOT NULL
    GROUP BY b.address_line_1
  `;
};

export const setProjectLocationQuery = (input: ProjectLocation) => {
  return sql`
    INSERT INTO content.projects_locations (place_id, name, lat, lng)
    VALUES (${input.placeId}, ${input.name}, ${input.lat}, ${input.lng})
  `;
};

export const getProjectsLocationsQuery = () => {
  return sql<ProjectLocation[]>`
    SELECT *
    FROM content.projects_locations
  `;
};
