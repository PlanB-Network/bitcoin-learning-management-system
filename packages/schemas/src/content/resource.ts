import {
  contentResources,
  contentResourceTags,
  contentTags,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const resourceSchema = createSelectSchema(contentResources);
export const resourceTagSchema = createSelectSchema(contentResourceTags);
export const tagsSchema = createSelectSchema(contentTags);

export const createResourcePRSchema = z.object({
  type: z.string(),
  title: z.string(),
  category: z.string().optional(),
  country: z.string().optional(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  links: z
    .object({
      website: z.string().optional(),
      twitter: z.string().optional(),
      github: z.string().optional(),
      nostr: z.string().optional(),
      linkedin: z.string().optional(),
    })
    .optional(),
  language: z.string(),
  coverImage: z
    .object({
      name: z.string(),
      data: z.string(), // base64
    })
    .optional(),
});
