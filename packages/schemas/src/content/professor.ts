import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentProfessors,
  contentProfessorsLocalized,
} from '@sovereign-university/database/schemas';

export const professorSchema = createSelectSchema(contentProfessors);
export const professorLocalizedSchema = createSelectSchema(
  contentProfessorsLocalized,
);

export const joinedProfessorSchema = professorSchema
  .merge(
    professorLocalizedSchema.pick({
      language: true,
      bio: true,
      shortBio: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()),
      picture: z.string(),
      coursesCount: z.number(),
      tutorialsCount: z.number(),
    }),
  );
