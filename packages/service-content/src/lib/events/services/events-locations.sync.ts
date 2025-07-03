import { z } from 'zod';

import type { Dependencies } from '../../dependencies.js';
import {
  getEventsWithoutLocationQuery,
  setEventLocationQuery,
} from '../queries/events-locations.js';

const expectedResponseSchema = z.array(
  z
    .object({
      display_name: z.string(),
      lat: z.string(),
      lon: z.string(),
      name: z.string(),
      place_id: z.number(),
      place_rank: z.number(),
    })
    .transform((data) => ({
      lat: Number.parseFloat(data.lat),
      lng: Number.parseFloat(data.lon),
      placeId: data.place_id,
    })),
);

const fetchEventLocation = async (query: string) => {
  const q = encodeURIComponent(query);

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${q}`,
  );
  console.log('Searching location for project:', query);

  const data = await res.json();
  return expectedResponseSchema.parse(data)?.[0];
};

export const createSyncEventsLocations = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (syncWarnings: string[]) => {
    try {
      const locations = await postgres.exec(getEventsWithoutLocationQuery());

      for (const { name } of locations) {
        const result = await fetchEventLocation(name).catch(() => null);
        if (!result) {
          const warn = `[sync] Could not find event location ${name}`;
          syncWarnings.push(warn);
          console.log(warn);
          continue;
        }

        await postgres.exec(setEventLocationQuery({ ...result, name }));
      }
    } catch (error) {
      const errMsg = `'-- Error during events locations sync: ${error}`;
      syncWarnings.push(errMsg);
      console.error(errMsg);
    }
  };
};
