import { createSelectSchema } from 'drizzle-zod';

import { contentVideos, contentVideosLocalized } from '@blms/database';

export const videoSchema = createSelectSchema(contentVideos);
export const videosLocalizedSchema = createSelectSchema(contentVideosLocalized);
