import { z } from 'zod';

import type { Dependencies } from '../../dependencies.js';
import {
  getProjectsWithoutLocationQuery,
  setProjectLocationQuery,
} from '../queries/projects-locations.js';

const expectedResponseSchema = z.array(
  z
    .object({
      name: z.string(),
      place_id: z.number(),
      place_rank: z.number(),
      display_name: z.string(),
      lat: z.string(),
      lon: z.string(),
    })
    .transform((data) => ({
      placeId: data.place_id,
      lat: Number.parseFloat(data.lat),
      lng: Number.parseFloat(data.lon),
    })),
);

const fetchProjectLocation = async (query: string) => {
  const q = encodeURIComponent(query);

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${q}`,
  );
  console.log('Searching location for event:', query);

  const data = await res.json();
  return expectedResponseSchema.parse(data)?.[0];
};

export const createSyncProjectsLocations = ({ postgres }: Dependencies) => {
  return async (syncWarnings: string[]) => {
    try {
      const locations = await postgres.exec(getProjectsWithoutLocationQuery());

      for (const { name } of locations) {
        const result = await fetchProjectLocation(name).catch(() => null);
        if (!result) {
          const warn = `-- Sync: Could not find project location: ${name}`;
          syncWarnings.push(warn);
          continue;
        }

        await postgres.exec(setProjectLocationQuery({ ...result, name }));
      }
    } catch (error) {
      const errMsg = `'-- Error during project locations sync: ${error}`;
      syncWarnings.push(errMsg);
      console.error(errMsg);
    }
  };
};
