import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { usersAccounts, usersLud4PublicKeys } from '@blms/database';

export const userAccountSchema = createSelectSchema(usersAccounts).merge(
  z.object({
    professorCourses: z.string().array(),
    professorTutorials: z.number().array(),
    professorShortBio: z.record(z.string()),
    professorTags: z.string().array(),
    professorLightningAddress: z.string(),
  }),
);

export const userDetailsSchema = userAccountSchema.pick({
  uid: true,
  username: true,
  displayName: true,
  picture: true,
  email: true,
  contributorId: true,
});
export const userRolesSchema = userAccountSchema
  .pick({
    uid: true,
    username: true,
    displayName: true,
    email: true,
    contributorId: true,
    role: true,
    professorId: true,
  })
  .merge(
    z.object({
      professorName: z.string().optional(),
    }),
  );

export const usersLud4PublicKeySchema = createSelectSchema(usersLud4PublicKeys);
