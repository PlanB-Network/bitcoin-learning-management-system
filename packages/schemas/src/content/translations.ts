import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { TranslationStatus } from '@blms/constants';
import {
  contentCourseChapters,
  contentCourseChaptersLocalized,
  contentCourseParts,
  contentCoursePartsLocalized,
  contentCourseTranslationChapters,
  contentCourseTranslationSlides,
  contentCourseTranslations,
  contentCourses,
  contentCoursesLocalized,
  usersLanguages,
  usersReviewerLanguages,
  usersTranslationAssignments,
  usersTranslationChapterAssignments,
  usersTranslationReviews,
} from '@blms/database';

import { assignmentStatusEnum, translationStatusEnum } from '../enums.js';

// Create select schemas for database tables
export const courseTranslationSchema = createSelectSchema(
  contentCourseTranslations,
);
export const courseTranslationChapterSchema = createSelectSchema(
  contentCourseTranslationChapters,
);
export const courseBasicSchema = createSelectSchema(contentCourses);
export const coursesLocalizedSchema = createSelectSchema(
  contentCoursesLocalized,
);
export const coursePartsSchema = createSelectSchema(contentCourseParts);
export const coursePartsLocalizedSchema = createSelectSchema(
  contentCoursePartsLocalized,
);
export const courseChaptersSchema = createSelectSchema(contentCourseChapters);
export const courseChaptersLocalizedSchema = createSelectSchema(
  contentCourseChaptersLocalized,
);
export const courseTranslationSlidesSchema = createSelectSchema(
  contentCourseTranslationSlides,
);
export const usersLanguagesSchema = createSelectSchema(usersLanguages);
export const usersReviewerLanguagesSchema = createSelectSchema(
  usersReviewerLanguages,
);
export const usersTranslationAssignmentsSchema = createSelectSchema(
  usersTranslationAssignments,
);
export const usersTranslationChapterAssignmentsSchema = createSelectSchema(
  usersTranslationChapterAssignments,
);
export const usersTranslationReviewsSchema = createSelectSchema(
  usersTranslationReviews,
);

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
    courseBasicSchema.pick({
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

// Input schemas for API operations - these are API interfaces, keep as z.object
export const getTranslationStatusInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
});

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
export const courseLanguageInfoSchema = courseBasicSchema
  .pick({
    id: true,
    index: true,
  })
  .merge(
    coursesLocalizedSchema.pick({
      name: true,
    }),
  )
  .merge(
    z.object({
      languages: z.array(courseLanguageSchema),
    }),
  );

// Course chapter details schema - based on course chapters schema
export const courseChapterDetailsSchema = courseChaptersSchema
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
export const coursePartDetailsSchema = coursePartsSchema
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

// Course details schema - based on course schema
export const courseDetailsSchema = courseBasicSchema
  .pick({
    id: true,
    index: true,
  })
  .merge(
    z.object({
      courseName: z.string().nullable(),
      translationStatus: z.string().nullable(),
      assigneeDisplayName: z.string().nullable(),
      progress: z.number(),
      totalChapters: z.number(),
      completedChapters: z.number(),
      parts: coursePartDetailsSchema.array(),
    }),
  );

// Service response schema - complex joined data, based on course schema
export const courseTranslationDetailsServiceResponseSchema = courseBasicSchema
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
export const courseWithTodoTranslationsSchema = courseBasicSchema
  .pick({
    id: true,
    index: true,
  })
  .merge(
    z.object({
      courseName: z.string(),
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
      status: translationStatusEnum,
    }),
  );

// Schema for chapter translation context - based on course and chapter schemas
export const chapterTranslationContextSchema = courseBasicSchema
  .pick({
    id: true,
  })
  .merge(
    courseChaptersSchema.pick({
      chapterId: true,
      chapterIndex: true,
    }),
  )
  .merge(
    coursePartsSchema.pick({
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
});

// Schema for chapter progress in course translation overview - based on chapter schema
export const chapterProgressSchema = courseChaptersSchema
  .pick({
    chapterId: true,
    chapterIndex: true,
  })
  .merge(
    coursePartsSchema.pick({
      partId: true,
      partIndex: true,
    }),
  )
  .merge(
    z.object({
      chapterTitle: z.string(),
      totalSlides: z.number(),
      completedSlides: z.number(),
      inProgressSlides: z.number(),
      todoSlides: z.number(),
      status: z.enum(['completed', 'in-progress', 'not-started']),
    }),
  );

// Input schema for getting chapter progress
export const getCourseTranslationChapterProgressInputSchema = z.object({
  courseId: z.string(),
  language: z.string(),
});
