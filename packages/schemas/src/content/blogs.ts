import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentBlogTags,
  contentBlogs,
  contentBlogsLocalized,
} from '@blms/database';

export const blogSchema = createSelectSchema(contentBlogs);
export const blogLocalizedSchema = createSelectSchema(contentBlogsLocalized);
export const blogTagSchema = createSelectSchema(contentBlogTags);

export const joinedBlogLightSchema = blogSchema
  .pick({
    id: true,
    path: true,
    name: true,
    category: true,
    author: true,
    lastUpdated: true,
    lastCommit: true,
    lastSync: true,
    date: true,
  })
  .merge(
    blogLocalizedSchema.pick({
      language: true,
      title: true,
      description: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()).optional(),
    }),
  );

export const joinedBlogSchema = joinedBlogLightSchema.merge(
  blogLocalizedSchema.pick({
    rawContent: true,
  }),
);

export const blogWithTagDetailsSchema = joinedBlogLightSchema.merge(
  z.object({
    tagDetails: blogTagSchema.array().optional(),
  }),
);
