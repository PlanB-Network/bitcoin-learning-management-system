import { UserPermission, UserRole } from '@blms/constants';
import {
  usersAccountSettings,
  usersAccounts,
  usersApiKeys,
  usersLud4PublicKeys,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const userRoleSchema = z.nativeEnum(UserRole);
export const userPermissionSchema = z.nativeEnum(UserPermission);

export const userAccountSchema = createSelectSchema(usersAccounts);

export const userAccountSettingsSchema =
  createSelectSchema(usersAccountSettings);

export const userDetailsSchema = userAccountSchema
  .pick({
    certificateName: true,
    contributorId: true,
    displayName: true,
    email: true,
    permissions: true,
    picture: true,
    professorId: true,
    role: true,
    uid: true,
    username: true,
  })
  .merge(
    z.object({
      boughtCourses: z.string().array(),
      professorCourses: z.string().array(),
      professorTutorials: z.string().array(),
    }),
  );

export const userRolesSchema = userAccountSchema
  .pick({
    contributorId: true,
    displayName: true,
    email: true,
    permissions: true,
    professorId: true,
    role: true,
    uid: true,
    username: true,
  })
  .merge(
    z.object({
      professorName: z.string().optional(),
    }),
  );

export const usersLud4PublicKeySchema = createSelectSchema(usersLud4PublicKeys);

export const loginResponseSchema = z.object({
  message: z.string(),
  status: z.number(),
  user: z.object({
    email: z.string().nullable(),
    uid: z.string(),
    username: z.string(),
  }),
});

export const apiKeySchema = createSelectSchema(usersApiKeys);

export const emailSettingsSchema = userAccountSettingsSchema.pick({
  emailNotifyCourses: true,
  emailNotifyGeneral: true,
});
