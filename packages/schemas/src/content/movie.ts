import { contentMovies } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { resourceSchema } from './resource.js';

export const movieSchema = createSelectSchema(contentMovies);

export const joinedMovieSchema = resourceSchema
  .pick({
    lastCommit: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    movieSchema.pick({
      author: true,
      description: true,
      duration: true,
      language: true,
      platform: true,
      publicationYear: true,
      title: true,
      trailer: true,
    }),
  )
  .merge(
    z.object({
      id: z.string(),
      tags: z.array(z.string()),
      uuid: z.string(),
    }),
  );
