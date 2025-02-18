import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { contentMovies } from '@blms/database';

import { resourceSchema } from './resource.js';

export const movieSchema = createSelectSchema(contentMovies);

export const joinedMovieSchema = resourceSchema
  .pick({
    path: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    movieSchema.pick({
      language: true,
      title: true,
      description: true,
      author: true,
      publicationYear: true,
      duration: true,
      platform: true,
      trailer: true,
    }),
  )
  .merge(
    z.object({
      id: z.string(),
      uuid: z.string(),
      tags: z.array(z.string()),
    }),
  );
