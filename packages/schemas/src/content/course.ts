import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentCourseChapters,
  contentCourseChaptersLocalized,
  contentCourseParts,
  contentCoursePartsLocalized,
  contentCourses,
  contentCoursesLocalized,
} from '@blms/database';

import { formattedProfessorSchema } from './professor.js';

import { courseLevelSchema } from './index.js';

export const courseSchema = createSelectSchema(contentCourses);
export const courseLocalizedSchema = createSelectSchema(
  contentCoursesLocalized,
);
export const coursePartSchema = createSelectSchema(contentCourseParts);
export const coursePartLocalizedSchema = createSelectSchema(
  contentCoursePartsLocalized,
);

export const courseChapterSchema = createSelectSchema(contentCourseChapters);
export const courseChapterLocalizedSchema = createSelectSchema(
  contentCourseChaptersLocalized,
);

export const joinedCoursePartLocalizedSchema = coursePartLocalizedSchema
  .pick({
    courseId: true,
    language: true,
    partId: true,
    title: true,
  })
  .merge(
    coursePartSchema.pick({
      partIndex: true,
    }),
  );

export const joinedCourseChapterSchema = courseChapterLocalizedSchema
  .pick({
    chapterId: true,
    language: true,
    title: true,
    sections: true,
    releasePlace: true,
    isOnline: true,
    isInPerson: true,
    isCourseReview: true,
    isCourseExam: true,
    isCourseConclusion: true,
    startDate: true,
    endDate: true,
    timezone: true,
    liveUrl: true,
    chatUrl: true,
    addressLine1: true,
    addressLine2: true,
    addressLine3: true,
    availableSeats: true,
    remainingSeats: true,
    liveLanguage: true,
    rawContent: true,
  })
  .merge(
    courseChapterSchema.pick({
      partId: true,
      chapterIndex: true,
    }),
  )
  .merge(
    coursePartSchema.pick({
      partIndex: true,
    }),
  )
  .merge(
    z.object({
      partTitle: z.string(),
    }),
  );

export const minimalJoinedCourseSchema = courseSchema
  .pick({
    id: true,
    index: true,
    isArchived: true,
    hours: true,
    topic: true,
    subtopic: true,
    originalLanguage: true,
    requiresPayment: true,
    paymentExpirationDate: true,
    publishedAt: true,
    format: true,
    onlinePriceDollars: true,
    inpersonPriceDollars: true,
    paidDescription: true,
    paidVideoLink: true,
    startDate: true,
    endDate: true,
    availableSeats: true,
    remainingSeats: true,
    contact: true,
    lastUpdated: true,
    lastCommit: true,
    numberOfRating: true,
    sumOfAllRating: true,
    isPlanbSchool: true,
    planbSchoolMarkdown: true,
  })
  .merge(
    courseLocalizedSchema.pick({
      language: true,
      name: true,
      goal: true,
      objectives: true,
      rawDescription: true,
    }),
  )
  .merge(
    z.object({
      level: courseLevelSchema,
      chaptersCount: z.number().optional(),
    }),
  )
  .merge(
    z.object({
      averageRating: z.number(),
    }),
  );

export const joinedCourseProfessorIdSchema = minimalJoinedCourseSchema.merge(
  z.object({
    mainProfessorIds: z.string().array(),
    associatedProfessorIds: z.string().array(),
    averageRating: z.number(),
  }),
);

export const joinedCourseSchema = minimalJoinedCourseSchema.merge(
  z.object({
    mainProfessors: formattedProfessorSchema.array(),
    associatedProfessors: formattedProfessorSchema.array(),
    averageRating: z.number(),
  }),
);

export const joinedCourseChapterWithContentSchema = courseChapterLocalizedSchema
  .pick({
    courseId: true,
    chapterId: true,
    language: true,
    title: true,
    sections: true,
    releasePlace: true,
    isOnline: true,
    isInPerson: true,
    isCourseReview: true,
    isCourseExam: true,
    isCourseConclusion: true,
    startDate: true,
    endDate: true,
    timezone: true,
    liveUrl: true,
    chatUrl: true,
    addressLine1: true,
    addressLine2: true,
    addressLine3: true,
    availableSeats: true,
    remainingSeats: true,
    liveLanguage: true,
    rawContent: true,
  })
  .merge(
    courseChapterSchema.pick({
      partId: true,
      chapterIndex: true,
    }),
  )
  .merge(
    coursePartSchema.pick({
      partIndex: true,
    }),
  )
  .merge(
    courseSchema.pick({
      lastUpdated: true,
      lastCommit: true,
    }),
  )
  .merge(
    z.object({
      professors: z.string().array(),
    }),
  );

export const partWithChaptersSchema = joinedCoursePartLocalizedSchema.merge(
  z.object({
    chapters: joinedCourseChapterSchema.array(),
  }),
);

export const courseResponseSchema = minimalJoinedCourseSchema
  .merge(
    z.object({
      professors: formattedProfessorSchema.array(),
      parts: z
        .object({
          part: z.number().optional(),
          language: z.string().optional(),
          title: z.string().optional(),
          chapters: joinedCourseChapterSchema.optional().array(),
        })
        .array(),
      partsCount: z.number(),
      chaptersCount: z.number(),
    }),
  )
  .omit({
    professors: true,
  })
  .merge(
    z.object({
      mainProfessors: formattedProfessorSchema.array(),
      associatedProfessors: formattedProfessorSchema.array(),
      parts: partWithChaptersSchema.array(),
      partsCount: z.number(),
      chaptersCount: z.number(),
    }),
  );

export const courseChapterResponseSchema =
  joinedCourseChapterWithContentSchema.merge(
    z.object({
      course: courseResponseSchema,
      part: partWithChaptersSchema,
      professors: formattedProfessorSchema.array().optional(),
    }),
  );

export const courseReviewsExtendedSchema = z.object({
  general: z.array(z.number()),
  difficulty: z.array(z.number()),
  length: z.array(z.number()),
  faithful: z.array(z.number()),
  recommand: z.array(z.number()),
  quality: z.array(z.number()),
  feedbacks: z.array(
    z.object({
      date: z.string(),
      user: z.string(),
      userPicture: z.string().nullable(),
      publicComment: z.string(),
      teacherComment: z.string().nullable(),
      adminComment: z.string().nullable(),
    }),
  ),
});

export const courseMetaSchema = minimalJoinedCourseSchema.pick({
  id: true,
  index: true,
  topic: true,
  subtopic: true,
  contact: true,
  lastCommit: true,
  language: true,
  name: true,
  goal: true,
  objectives: true,
});

export const courseChapterMetaSchema = joinedCourseChapterSchema
  .pick({
    partId: true,
    chapterId: true,
    language: true,
    title: true,
    sections: true,
    releasePlace: true,
    rawContent: true,
    liveLanguage: true,
  })
  .merge(
    z.object({
      courseId: z.string(),
      courseIndex: z.string(),
      lastCommit: z.string(),
    }),
  );
