import { z } from 'zod';

import type { Dependencies } from '../../dependencies.js';
import {
  getEventsWithoutLocationQuery,
  setEventLocationQuery,
} from '../queries/events-locations.js';

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

const fetchEventLocation = async (query: string) => {
  const q = encodeURIComponent(query);

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${q}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await res.json();

  console.log('Result for', query, ':', data);

  return expectedResponseSchema.parse(data)?.[0];
};

export const createSyncEventsLocations = ({ postgres }: Dependencies) => {
  return async () => {
    const locations = await postgres.exec(getEventsWithoutLocationQuery());

    for (const { name } of locations) {
      const result = await fetchEventLocation(name).catch(() => null);
      if (!result) {
        console.log('Could not find location:', name);
        continue;
      }

      await postgres.exec(setEventLocationQuery({ ...result, name }));
    }
  };
};
