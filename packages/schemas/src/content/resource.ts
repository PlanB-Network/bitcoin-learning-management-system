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
  type: z.enum([
    'projects',
    'books',
    'movies',
    'podcasts',
    'channels',
    'newsletters',
  ]),
  title: z.string(),
  author: z.string().optional(),
  publicationYear: z.string().optional(),
  category: z.string().optional(),
  description: z.string(),
  links: z
    .object({
      website: z.string().optional(),
      twitter: z.string().optional(),
      github: z.string().optional(),
      nostr: z.string().optional(),
      linkedin: z.string().optional(),
    })
    .optional(),
  resourceLink: z.string().optional(),
  trailerLink: z.string().optional(),
  language: z.string(),
  contentLanguage: z.string().optional(),
  coverImage: z
    .object({
      name: z.string(),
      data: z.string(), // base64
    })
    .optional(),
  duration: z.number().optional(),
});
