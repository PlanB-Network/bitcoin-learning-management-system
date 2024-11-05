import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  userRoleEnum,
  usersAccounts,
  usersApiKeys,
  usersLud4PublicKeys,
} from '@blms/database';

export const userRoleSchema = z.enum(userRoleEnum.enumValues);

export const userAccountSchema = createSelectSchema(usersAccounts);

export const userDetailsSchema = userAccountSchema
  .pick({
    uid: true,
    role: true,
    email: true,
    picture: true,
    username: true,
    displayName: true,
    certificateName: true,
    professorId: true,
    contributorId: true,
  })
  .merge(
    z.object({
      professorCourses: z.string().array(),
      professorTutorials: z.number().array(),
    }),
  );

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

export const loginResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  user: z.object({
    uid: z.string(),
    username: z.string(),
    email: z.string().nullable(),
  }),
});

export const apiKeySchema = createSelectSchema(usersApiKeys);
