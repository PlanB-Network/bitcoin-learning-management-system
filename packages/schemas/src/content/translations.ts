import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentCourseTranslationChapters,
  contentCourseTranslations,
  usersTranslationAssignments,
} from '@blms/database';

import { assignmentStatusEnum, translationStatusEnum } from '../enums.js';

// Create select schemas for database tables
export const courseTranslationSchema = createSelectSchema(
  contentCourseTranslations,
);
export const courseTranslationChapterSchema = createSelectSchema(
  contentCourseTranslationChapters,
);
export const translationAssignmentSchema = createSelectSchema(
  usersTranslationAssignments,
);

// Schema for getting available translations for a language
export const availableCourseTranslationSchema = courseTranslationSchema.pick({
  courseId: true,
  language: true,
  status: true,
});

// Schema for available course translations with assignment status (for user contributions)
export const availableCourseTranslationWithAssignmentSchema =
  availableCourseTranslationSchema.extend({
    assignmentStatus: assignmentStatusEnum.optional(),
  });

// Schema for joined translation chapter with part info
export const translationChapterWithPartInfoSchema =
  courseTranslationChapterSchema
    .pick({
      courseId: true,
      language: true,
      partId: true,
      chapterId: true,
      status: true,
    })
    .extend({
      partName: z.string(),
      chapterName: z.string(),
    });
// Schema for admin content management course data
export const adminContentManagementCourseSchema = z.object({
  courseId: z.string(),
  language: z.string(),
  status: translationStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  courseIndex: z.string(),
  courseName: z.string().nullable(),
  assignmentId: z.string().nullable(),
  assigneeId: z.string().nullable(),
  assignerId: z.string().nullable(),
  assignmentStatus: assignmentStatusEnum.nullable(),
  assignedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  assigneeUsername: z.string().nullable(),
  assigneeDisplayName: z.string().nullable(),
  progress: z.number(),
});

// Schema for available contributors
export const availableContributorSchema = z.object({
  uid: z.string(),
  username: z.string(),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
});

// Schema for assigning course to contributor
export const assignCourseToContributorInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
  assigneeId: z.string(),
});

// Schema for reassigning course to contributor
export const reassignCourseToContributorInputSchema = z.object({
  assignmentId: z.string(),
  newAssigneeId: z.string(),
});

// Schema for full translation status with chapters
export const courseTranslationStatusSchema = courseTranslationSchema.merge(
  z.object({
    chapters: translationChapterWithPartInfoSchema.array(),
  }),
);

// Input schemas for API operations
export const getTranslationStatusInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
});

export const createTranslationInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
});

export const updateTranslationStatusInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
  status: translationStatusEnum,
});

// Translation assignment schemas
export const translationAssignmentResponseSchema =
  translationAssignmentSchema.pick({
    id: true,
    courseId: true,
    language: true,
    assigneeId: true,
    assignerId: true,
    status: true,
    assignedAt: true,
    completedAt: true,
  });

export const createTranslationAssignmentInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
});

export const updateTranslationAssignmentInputSchema = z.object({
  assignmentId: z.string(),
  status: assignmentStatusEnum,
});

export const getUserTranslationAssignmentsInputSchema = z.object({
  language: z.string().optional(),
  status: assignmentStatusEnum.optional(),
});
