import { createSelectSchema } from 'drizzle-zod';

import { contentVideos, contentVideosLocalized } from '@blms/database';

export const videoSchema = createSelectSchema(contentVideos);
export const videosLocalizedSchema = createSelectSchema(contentVideosLocalized);

export const joinedVideoSchema = videoSchema
  .pick({
    id: true,
    courseId: true,
  })
  .merge(
    videosLocalizedSchema.pick({
      language: true,
      provider: true,
      idFromProvider: true,
    }),
  );
