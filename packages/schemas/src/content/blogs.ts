import {
  contentBlogs,
  contentBlogsLocalized,
  contentBlogTags,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const blogSchema = createSelectSchema(contentBlogs);
export const blogLocalizedSchema = createSelectSchema(contentBlogsLocalized);
export const blogTagSchema = createSelectSchema(contentBlogTags);

export const joinedBlogLightSchema = blogSchema
  .pick({
    author: true,
    category: true,
    createdAt: true,
    date: true,
    id: true,
    lastCommit: true,
    lastSync: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    blogLocalizedSchema.pick({
      description: true,
      language: true,
      title: true,
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
