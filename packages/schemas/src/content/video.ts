import { VideoProvider, VideoSourceType } from '@blms/constants';
import { contentVideos, contentVideosLocalized } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const videoSourceTypeSchema = z.nativeEnum(VideoSourceType);
export const videoProviderSchema = z.nativeEnum(VideoProvider);

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
  )
  .extend({
    sourceType: videoSourceTypeSchema,
  });
