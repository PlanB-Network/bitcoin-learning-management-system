import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  userRoleEnum,
  usersAccounts,
  usersLud4PublicKeys,
} from '@blms/database';

export const userRoleSchema = z.enum(userRoleEnum.enumValues);

export const userAccountSchema = createSelectSchema(usersAccounts).merge(
  z.object({
    professorCourses: z.string().array(),
    professorTutorials: z.number().array(),
  }),
);

export const userDetailsSchema = userAccountSchema.pick({
  uid: true,
  username: true,
  displayName: true,
  certificateName: true,
  picture: true,
  email: true,
  contributorId: true,
});

export const userRolesSchema = userAccountSchema
  .pick({
    uid: true,
    username: true,
    displayName: true,
    certificateName: true,
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

export const loginResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  user: z.object({
    uid: z.string(),
    username: z.string(),
    email: z.string().optional(),
  }),
});
