import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { UserPermission, UserRole } from '@blms/constants';
import {
  usersAccountSettings,
  usersAccounts,
  usersApiKeys,
  usersLud4PublicKeys,
} from '@blms/database';

export const userRoleSchema = z.nativeEnum(UserRole);
export const userPermissionSchema = z.nativeEnum(UserPermission);

export const userAccountSchema = createSelectSchema(usersAccounts);

export const userAccountSettingsSchema =
  createSelectSchema(usersAccountSettings);

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
    permissions: true,
  })
  .merge(
    z.object({
      professorCourses: z.string().array(),
      professorTutorials: z.string().array(),
      boughtCourses: z.string().array(),
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
    permissions: true,
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
