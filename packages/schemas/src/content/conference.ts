import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentConferenceStageVideos,
  contentConferences,
  contentConferencesStages,
} from '@sovereign-university/database/schemas';

import { resourceSchema } from './resource.js';

export const conferenceSchema = createSelectSchema(contentConferences);
export const conferenceStageSchema = createSelectSchema(
  contentConferencesStages,
);
export const conferenceStageVideoSchema = createSelectSchema(
  contentConferenceStageVideos,
);

export const joinedConferenceStageSchema = conferenceStageSchema.merge(
  z.object({
    videos: z.array(
      conferenceStageVideoSchema.pick({
        name: true,
        rawContent: true,
      }),
    ),
  }),
);

export const joinedConferenceSchema = resourceSchema
  .pick({
    id: true,
    path: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    conferenceSchema.pick({
      name: true,
      description: true,
      year: true,
      builder: true,
      languages: true,
      location: true,
      websiteUrl: true,
      twitterUrl: true,
    }),
  )
  .merge(
    z.object({
      stages: z.array(joinedConferenceStageSchema),
      tags: z.array(z.string()),
    }),
  );
