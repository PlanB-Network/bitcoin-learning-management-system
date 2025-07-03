import { contentVideos, contentVideosLocalized } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';

export const videoSchema = createSelectSchema(contentVideos);
export const videosLocalizedSchema = createSelectSchema(contentVideosLocalized);

export const joinedVideoSchema = videoSchema
  .pick({
    courseId: true,
    id: true,
  })
  .merge(
    videosLocalizedSchema.pick({
      idFromProvider: true,
      language: true,
      provider: true,
    }),
  );
