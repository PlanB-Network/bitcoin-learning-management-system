import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentResourceTags,
  contentResources,
  contentTags,
} from '@sovereign-university/database/schemas';

export const resourceSchema = createSelectSchema(contentResources);
export const resourceTagSchema = createSelectSchema(contentResourceTags);
export const tagsSchema = createSelectSchema(contentTags);

export const levelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
  'developer',
]);
