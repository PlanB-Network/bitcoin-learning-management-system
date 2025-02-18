import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentResourceTags,
  contentResources,
  contentTags,
} from '@blms/database';

import { CourseLevel } from '@blms/constants';

export const resourceSchema = createSelectSchema(contentResources);
export const resourceTagSchema = createSelectSchema(contentResourceTags);
export const tagsSchema = createSelectSchema(contentTags);
export const courseLevelSchema = z.nativeEnum(CourseLevel);
