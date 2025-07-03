import {
  contentConferenceStageVideos,
  contentConferences,
  contentConferencesStages,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { resourceSchema } from './resource.js';

export const conferenceSchema = createSelectSchema(contentConferences, {
  languages: z.array(z.string()),
});
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
    lastCommit: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    z.object({
      projectName: z.string().optional(),
    }),
  )
  .merge(
    conferenceSchema.pick({
      description: true,
      languages: true,
      location: true,
      name: true,
      twitterUrl: true,
      websiteUrl: true,
      year: true,
    }),
  )
  .merge(
    z.object({
      stages: joinedConferenceStageSchema.array(),
      tags: z.array(z.string()),
    }),
  );
