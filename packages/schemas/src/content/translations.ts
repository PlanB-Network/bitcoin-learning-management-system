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
  availableCourseTranslationSchema.merge(
    z.object({
      assignmentStatus: assignmentStatusEnum.optional(),
    }),
  );

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
    .merge(
      z.object({
        partName: z.string(),
        chapterName: z.string(),
      }),
    );
// Schema for admin content management course data
export const adminContentManagementCourseSchema = z.object({
  courseId: z.string(),
  language: z.string(),
  status: translationStatusEnum, // Translation status
  isAssigned: z.enum(['assigned', 'not_assigned']), // Assignment status
  createdAt: z.date(),
  updatedAt: z.date(),
  courseIndex: z.string(),
  courseTopic: z.string().nullable(),
  courseName: z.string().nullable(),
  assignmentId: z.string().nullable(),
  assigneeId: z.string().nullable(),
  assignerId: z.string().nullable(),
  assignmentStatus: z
    .enum(['requested', 'assigned', 'in_progress', 'completed', 'rejected'])
    .nullable(),
  assignedAt: z.date().nullable(),
  completedAt: z.date().nullable().optional(),
  assigneeUsername: z.string().nullable(),
  assigneeDisplayName: z.string().nullable(),
  progress: z.number(),
});

// Schema for available contributors - corrected to match service return
export const availableContributorSchema = z.object({
  uid: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
});

// Schema for all users (includes role and assignedLanguages)
export const allUsersSchema = z.object({
  uid: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  role: z.string(),
  assignedLanguages: z.array(z.string()),
});

// Schema for admin user management
export const adminUserManagementSchema = z.object({
  uid: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  role: z.string(),
  startDate: z.date(),
  assignedCourses: z.number(),
  languages: z.array(z.string()),
});

// Schema for user assignment details
export const userAssignmentDetailsSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  language: z.string(),
  assignmentStatus: z.string(),
  assignedAt: z.date(),
  completedAt: z.date().nullable(),
  courseIndex: z.string().optional(),
  courseName: z.string().nullable(),
  translationStatus: z.string().nullable(),
  translationUpdatedAt: z.date().nullable(),
  progress: z.number(),
});

// Schema for user translation details (includes assignments)
export const userTranslationDetailsSchema = z.object({
  uid: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  startDate: z.date(),
  role: z.string(),
  assignments: z.array(userAssignmentDetailsSchema),
  languages: z.array(z.string()),
});

// Schema for assignment result (what assign/reassign operations return)
export const assignmentResultSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  language: z.string(),
  assigneeId: z.string(),
  assignerId: z.string(),
  status: z.string(),
  assignedAt: z.date(),
  completedAt: z.date().nullable().optional(),
  rejectionReason: z.string().nullable(),
});

// Schema for translation assignment requests (with joined data)
export const translationAssignmentRequestSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  language: z.string(),
  assigneeId: z.string(),
  assignerId: z.string(),
  status: z.string(),
  assignedAt: z.date(),
  completedAt: z.date().nullable().optional(),
  rejectionReason: z.string().nullable(),
  courseIndex: z.string().optional(),
  courseName: z.string().nullable(),
  assigneeUsername: z.string().nullable(),
  assignerUsername: z.string().nullable(),
});

// Schema for user's translation assignments (simplified)
export const userTranslationAssignmentSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  language: z.string(),
  status: z.string(),
  assignedAt: z.date(),
  completedAt: z.date().nullable().optional(),
  rejectionReason: z.string().nullable(),
  courseIndex: z.string().optional(),
  courseName: z.string().nullable(),
});

export type UserTranslationDetails = z.infer<
  typeof userTranslationDetailsSchema
>;

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
export const translationAssignmentResponseSchema = translationAssignmentSchema
  .pick({
    id: true,
    courseId: true,
    language: true,
    assigneeId: true,
    assignerId: true,
    status: true,
    assignedAt: true,
    completedAt: true,
  })
  .merge(
    z.object({
      rejectionReason: z.string().nullable().optional(),
      courseIndex: z.string().optional(),
      courseName: z.string().optional(),
      assigneeUsername: z.string().optional(),
      assignerUsername: z.string().optional(),
    }),
  );

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

// Language info schema
export const languageInfoSchema = z.object({
  code: z.string(),
  name: z.string(),
});

// Course details schemas for course management UI - corrected to match service return
export const courseLanguageSchema = z.object({
  code: z.string(),
  name: z.string().nullable(),
  translationStatus: z.string(),
  assigneeId: z.string().nullable(),
  assigneeUsername: z.string().nullable(),
  assigneeDisplayName: z.string().nullable(),
});

// Schema that matches the actual service response for getCourseLanguages
export const courseLanguagesServiceResponseSchema = z.object({
  courseId: z.string(),
  courseIndex: z.string(),
  courseName: z.string().nullable(),
  languages: courseLanguageSchema.array(),
});

// Alternative schema with different name to work around type generator issue
export const courseLanguagesWithInfoSchema = z.object({
  courseId: z.string(),
  courseIndex: z.string(),
  courseName: z.string().nullable(),
  languages: courseLanguageSchema.array(),
});

export const courseChapterDetailsSchema = z.object({
  chapterId: z.string(),
  chapterIndex: z.number(),
  chapterTitle: z.string().nullable(),
  status: z.string(),
  updatedAt: z.date().nullable().optional(),
});

export const coursePartDetailsSchema = z.object({
  partId: z.string(),
  partIndex: z.number(),
  partTitle: z.string().nullable(),
  chapters: courseChapterDetailsSchema.array(),
});

export const courseDetailsSchema = z.object({
  id: z.string(),
  courseIndex: z.string(),
  courseName: z.string().nullable(),
  translationStatus: z.string().nullable(),
  assigneeDisplayName: z.string().nullable(),
  progress: z.number(),
  totalChapters: z.number(),
  completedChapters: z.number(),
  parts: coursePartDetailsSchema.array(),
});

// Schema that matches the actual service response for getUserTranslationDetails
export const userTranslationDetailsServiceResponseSchema = z.object({
  uid: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  startDate: z.date(),
  role: z.string(),
  assignments: z.array(
    z.object({
      id: z.string(),
      courseId: z.string(),
      language: z.string(),
      assignmentStatus: z.string(),
      assignedAt: z.date(),
      completedAt: z.date().nullable(),
      courseIndex: z.string().optional(),
      courseName: z.string().nullable(),
      translationStatus: z.string().nullable(),
      translationUpdatedAt: z.date().nullable(),
      progress: z.number(),
    }),
  ),
  languages: z.array(z.string()),
});

export const courseTranslationDetailsServiceResponseSchema = z.object({
  id: z.string(),
  courseIndex: z.string(),
  courseName: z.string().nullable(),
  translationStatus: z.string().nullable(),
  assigneeDisplayName: z.string().nullable(),
  parts: z.array(coursePartDetailsSchema),
  progress: z.number(),
  totalChapters: z.number(),
  completedChapters: z.number(),
});

// Adding minimal schema for user translation details (service response)
export const userTranslationSummarySchema = z.object({
  assignments: userTranslationAssignmentSchema.array(),
  languages: z.array(z.string()),
});

// Schemas that match actual service responses (with string status and Date | null completedAt)
export const serviceTranslationAssignmentSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  language: z.string(),
  assigneeId: z.string(),
  assignerId: z.string(),
  status: z.string(), // Services return string, not enum
  assignedAt: z.date(),
  completedAt: z.date().nullable(), // Services return Date | null, not Date | undefined
  rejectionReason: z.string().nullable(),
  courseIndex: z.string().optional(),
  courseName: z.string().optional(),
  assigneeUsername: z.string().optional(),
  assignerUsername: z.string().optional(),
});

export const serviceTranslationAssignmentRequestSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  language: z.string(),
  assigneeId: z.string(),
  assignerId: z.string(),
  status: z.string(),
  assignedAt: z.date(),
  completedAt: z.date().nullable(),
  rejectionReason: z.string().nullable(),
  courseIndex: z.string().optional(),
  courseName: z.string().optional(),
  assigneeUsername: z.string().optional(),
  assignerUsername: z.string().optional(),
});

export const serviceUserTranslationAssignmentSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  language: z.string(),
  assigneeId: z.string(),
  assignerId: z.string(),
  status: z.string(),
  assignedAt: z.date(),
  completedAt: z.date().nullable(),
  rejectionReason: z.string().nullable(),
  courseIndex: z.string().optional(),
  courseName: z.string().optional(),
});

// Use the same schema as userTranslationDetailsServiceResponseSchema for consistency
export const serviceUserDetailsSchema =
  userTranslationDetailsServiceResponseSchema;
