import {
  contentResources,
  contentResourceTags,
  contentTags,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';

export const resourceSchema = createSelectSchema(contentResources);
export const resourceTagSchema = createSelectSchema(contentResourceTags);
export const tagsSchema = createSelectSchema(contentTags);
