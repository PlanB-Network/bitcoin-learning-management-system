import {
  contentEducatorContentFiles,
  contentEducatorContentLinks,
  contentEducatorContents,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const educatorContentSchema = createSelectSchema(
  contentEducatorContents,
);

export const educatorContentLinkSchema = createSelectSchema(
  contentEducatorContentLinks,
);

export const educatorContentFileSchema = createSelectSchema(
  contentEducatorContentFiles,
);

export const joinedEducatorContentSchema = educatorContentSchema.merge(
  z.object({
    links: z.array(educatorContentLinkSchema).optional(),
    files: z.array(educatorContentFileSchema).optional(),
    displayName: z.string().optional(),
  }),
);
