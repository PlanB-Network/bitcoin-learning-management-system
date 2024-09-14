import { z } from 'zod';

import type { Dependencies } from '../../dependencies.js';
import {
  getBuildersWithoutLocationQuery,
  setBuilderLocationQuery,
} from '../queries/builders-locations.js';

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

const fetchBuilderLocation = async (query: string) => {
  const q = encodeURIComponent(query);

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${q}`,
  );

  const data = await res.json();
  return expectedResponseSchema.parse(data)?.[0];
};

export const createSyncBuildersLocations = ({ postgres }: Dependencies) => {
  return async () => {
    try {
      const locations = await postgres.exec(getBuildersWithoutLocationQuery());

      if (locations.length === 0) {
        console.log('-- No builders found without locations');
        return;
      }

      for (const { name } of locations) {
        try {
          const result = await fetchBuilderLocation(name).catch(() => null);
          if (!result) {
            console.log(
              '-- Sync procedure: Could not find location for builder:',
              name,
            );
            continue;
          }

          await postgres.exec(setBuilderLocationQuery({ ...result, name }));
        } catch (error) {
          console.error(
            '-- Error during location fetch or insert for builder:',
            name,
            error,
          );
        }
      }
    } catch (error) {
      console.error('-- Error during builders sync:', error);
    }
  };
};
