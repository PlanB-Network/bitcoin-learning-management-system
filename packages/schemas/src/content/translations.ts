import { TranslationStatus } from '@blms/constants';
import {
  contentCourseTranslationChapters,
  contentCourseTranslationSlides,
  contentCourseTranslations,
  contentCourseUploads,
  usersTranslationChapterAssignments,
  usersTranslationReviews,
} from '@blms/database';

import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { assignmentStatusEnum, translationStatusEnum } from '../enums.js';
import {
  courseChapterSchema,
  courseLocalizedSchema,
  coursePartSchema,
  courseSchema,
} from './course.js';

// Create select schemas for database tables
export const courseTranslationSchema = createSelectSchema(
  contentCourseTranslations,
);
export const courseTranslationChapterSchema = createSelectSchema(
  contentCourseTranslationChapters,
);

export const courseTranslationSlidesSchema = createSelectSchema(
  contentCourseTranslationSlides,
);

export const usersTranslationChapterAssignmentsSchema = createSelectSchema(
  usersTranslationChapterAssignments,
);
export const usersTranslationReviewsSchema = createSelectSchema(
  usersTranslationReviews,
);
export const courseTranslationUploadSchema =
  createSelectSchema(contentCourseUploads);

// Schema for simple course translation response (only courseId and language)
export const courseTranslationResponseSchema = courseTranslationSchema.pick({
  courseId: true,
  language: true,
});

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

// Schema for admin content management course data - complex joined data, use base schemas
export const adminContentManagementCourseSchema = courseTranslationSchema
  .pick({
    courseId: true,
    language: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  })
  .merge(
    courseSchema.pick({
      index: true,
      topic: true,
    }),
  )
  .merge(
    z.object({
      isAssigned: z.enum(['assigned', 'not_assigned']),
      courseName: z.string().nullable(),
      assignmentId: z.string().nullable(),
      assigneeId: z.string().nullable(),
      assignerId: z.string().nullable(),
      assignmentStatus: assignmentStatusEnum.nullable(),
      assignedAt: z.date().nullable(),
      completedAt: z.date().nullable().optional(),
      assigneeUsername: z.string().nullable(),
      assigneeDisplayName: z.string().nullable(),
      progress: z.number(),
    }),
  );

// Schema for full translation status with chapters
export const courseTranslationStatusSchema = courseTranslationSchema.merge(
  z.object({
    chapters: translationChapterWithPartInfoSchema.array(),
  }),
);

export const createTranslationInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
  chapterId: z.string(),
  partId: z.string(),
  status: translationStatusEnum
    .optional()
    .default(TranslationStatus.InProgress),
});

export const updateTranslationStatusInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
  chapterId: z.string(),
  status: translationStatusEnum,
});

export const updateCourseTranslationStatusInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
  status: translationStatusEnum,
});

// Course details schemas for course management UI - these are service response schemas, keep as z.object for now
export const courseLanguageSchema = z.object({
  code: z.string(),
  name: z.string().nullable(),
  translationStatus: z.string(),
  assigneeId: z.string().nullable(),
  assigneeUsername: z.string().nullable(),
  assigneeDisplayName: z.string().nullable(),
});

// Schema for CourseInfo - what the UI expects
export const courseLanguageInfoSchema = courseSchema
  .pick({
    id: true,
    index: true,
  })
  .merge(
    courseLocalizedSchema.pick({
      name: true,
    }),
  )
  .merge(
    z.object({
      languages: z.array(courseLanguageSchema),
    }),
  );

// Course chapter details schema - based on course chapters schema
export const courseChapterDetailsSchema = courseChapterSchema
  .pick({
    chapterId: true,
    chapterIndex: true,
  })
  .merge(
    z.object({
      chapterTitle: z.string().nullable(),
      status: z.string(),
      updatedAt: z.date().nullable().optional(),
    }),
  );

// Course part details schema - based on course parts schema
export const coursePartDetailsSchema = coursePartSchema
  .pick({
    partId: true,
    partIndex: true,
  })
  .merge(
    z.object({
      partTitle: z.string().nullable(),
      chapters: z.array(courseChapterDetailsSchema),
    }),
  );

// Service response schema - complex joined data, based on course schema
export const courseTranslationDetailsServiceResponseSchema = courseSchema
  .pick({
    id: true,
    index: true,
  })
  .merge(
    z.object({
      courseName: z.string().nullable(),
      translationStatus: z.string().nullable(),
      translationCreatedAt: z.date().nullable(),
      translationUpdatedAt: z.date().nullable(),
      assigneeId: z.string().nullable(),
      assigneeUsername: z.string().nullable(),
      assigneeDisplayName: z.string().nullable(),
      assignedAt: z.date().nullable(),
      assignmentStatus: z.string().nullable(),
      parts: z.array(coursePartDetailsSchema),
      progress: z.number(),
      totalChapters: z.number(),
      completedChapters: z.number(),
    }),
  );

// Schema for courses with todo translations - service response, based on course schema
export const courseWithTodoTranslationsSchema = courseSchema
  .pick({
    id: true,
    index: true,
  })
  .merge(
    z.object({
      courseName: z.string(),
      originalLanguage: z.string(),
      todoLanguages: z.array(z.string()),
      totalLanguages: z.number(),
    }),
  );

// Schema for course translation slide - based on database schema
export const courseTranslationSlideSchema = courseTranslationSlidesSchema
  .pick({
    courseId: true,
    language: true,
    partId: true,
    chapterId: true,
    slideId: true,
    pptResourcePath: true,
    audioResourcePath: true,
    originalContent: true,
    aiTranslatedContent: true,
    translatedContent: true,
    createdAt: true,
    updatedAt: true,
  })
  .merge(
    z.object({
      slideNumber: z.number(),
      pptValidated: z.boolean(),
      transcriptionValidated: z.boolean(),
      audioValidated: z.boolean(),
      audioTries: z.number(),
      status: translationStatusEnum,
    }),
  );

// Schema for chapter translation context - based on course and chapter schemas
export const chapterTranslationContextSchema = courseSchema
  .pick({
    id: true,
  })
  .merge(
    courseChapterSchema.pick({
      chapterId: true,
      chapterIndex: true,
    }),
  )
  .merge(
    coursePartSchema.pick({
      partId: true,
      partIndex: true,
    }),
  )
  .merge(
    z.object({
      courseId: z.string(),
      courseIndex: z.string(),
      courseName: z.string(),
      partTitle: z.string(),
      chapterTitle: z.string(),
      originalLanguage: z.string(),
      translationStatus: z.string(),
      chapterTranslationStatus: z.string(),
    }),
  );

// Schema for chapter translation data (context + slides)
export const chapterTranslationDataSchema = z.object({
  context: chapterTranslationContextSchema,
  slides: z.array(courseTranslationSlideSchema),
});

// Input schemas for slide operations
export const getCourseTranslationSlidesInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
  chapterId: z.string(),
});

export const updateCourseTranslationSlideInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
  chapterId: z.string(),
  slideId: z.string(),
  translatedContent: z.string().optional(),
  status: translationStatusEnum
    .optional()
    .default(TranslationStatus.InProgress),
  pptValidated: z.boolean().optional(),
  transcriptionValidated: z.boolean().optional(),
  audioValidated: z.boolean().optional(),
  audioTries: z.number().optional(),
});
