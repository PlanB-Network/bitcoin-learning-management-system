import { usersTranslationAssignments } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { assignmentStatusEnum } from '../enums.js';
import { userAccountSchema } from './account.js';
import { languageSchema } from './career.js';

// Create select schemas for database tables
export const translationAssignmentSchema = createSelectSchema(
  usersTranslationAssignments,
);

// Schema for available contributors - based on user account schema
export const availableContributorSchema = userAccountSchema.pick({
  uid: true,
  username: true,
  displayName: true,
  email: true,
});

// Schema for all users (includes role and assignedLanguages)
export const allUsersSchema = userAccountSchema
  .pick({
    uid: true,
    username: true,
    displayName: true,
    email: true,
    role: true,
  })
  .merge(
    z.object({
      assignedLanguages: z.array(z.string()),
    }),
  );

// Schema for admin user management
export const adminUserManagementSchema = userAccountSchema
  .pick({
    uid: true,
    username: true,
    displayName: true,
    email: true,
    role: true,
    createdAt: true,
  })
  .merge(
    z.object({
      startDate: z.date(),
      assignedCourses: z.number(),
      languages: z.array(z.string()),
    }),
  );

// Schema for user assignment details - based on translation assignment schema
export const userAssignmentDetailsSchema = translationAssignmentSchema
  .pick({
    id: true,
    courseId: true,
    language: true,
    assignedAt: true,
    completedAt: true,
  })
  .merge(
    z.object({
      assignmentStatus: assignmentStatusEnum,
      index: z.string().optional(),
      courseName: z.string().nullable(),
      translationStatus: z.string().nullable(),
      translationUpdatedAt: z.date().nullable(),
      progress: z.number(),
    }),
  );

// Schema for user translation details (includes assignments)
export const userTranslationDetailsSchema = userAccountSchema
  .pick({
    uid: true,
    username: true,
    displayName: true,
    email: true,
    createdAt: true,
    role: true,
  })
  .merge(
    z.object({
      assignments: z.array(userAssignmentDetailsSchema),
      languages: z.array(z.string()),
    }),
  );

// Language info schema - based on language schema
export const languageInfoSchema = languageSchema.pick({
  code: true,
  name: true,
});

// Schema that matches the actual service response for getUserTranslationDetails
export const userTranslationDetailsServiceResponseSchema = userAccountSchema
  .pick({
    uid: true,
    username: true,
    displayName: true,
    email: true,
    createdAt: true,
    role: true,
  })
  .merge(
    z.object({
      startDate: z.date(),
      assignments: z.array(userAssignmentDetailsSchema),
      languages: z.array(z.string()),
    }),
  );

// Schemas that match actual service responses
export const serviceTranslationAssignmentSchema = translationAssignmentSchema
  .pick({
    id: true,
    courseId: true,
    language: true,
    assigneeId: true,
    assignerId: true,
    assignedAt: true,
    completedAt: true,
    rejectionReason: true,
  })
  .merge(
    z.object({
      status: assignmentStatusEnum,
      index: z.string().optional(),
      courseName: z.string().optional(),
      assigneeUsername: z.string().optional(),
      assignerUsername: z.string().optional(),
    }),
  );

// Type exports
export type UserTranslationDetails = z.infer<
  typeof userTranslationDetailsSchema
>;
