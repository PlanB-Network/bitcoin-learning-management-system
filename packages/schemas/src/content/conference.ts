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
    videos: conferenceStageVideoSchema.array(),
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
      stages: joinedConferenceStageSchema.array(),
      tags: z.array(z.string()),
      thumbnail: z.string(),
    }),
  );
