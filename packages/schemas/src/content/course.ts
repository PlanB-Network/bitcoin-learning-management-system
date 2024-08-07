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

import { levelSchema } from './index.js';

export const courseSchema = createSelectSchema(contentCourses);
export const courseLocalizedSchema = createSelectSchema(
  contentCoursesLocalized,
  {
    // TODO: Remove this when the issue is fixed
    // https://github.com/drizzle-team/drizzle-orm/issues/1609
    objectives: z.array(z.string()),
  },
);
export const coursePartSchema = createSelectSchema(contentCourseParts);
export const coursePartLocalizedSchema = createSelectSchema(
  contentCoursePartsLocalized,
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

export const courseChapterSchema = createSelectSchema(contentCourseChapters);
export const courseChapterLocalizedSchema = createSelectSchema(
  contentCourseChaptersLocalized,
  {
    // TODO: Remove this when the issue is fixed
    // https://github.com/drizzle-team/drizzle-orm/issues/1609
    sections: z.array(z.string()),
  },
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
    hours: true,
    topic: true,
    subtopic: true,
    requiresPayment: true,
    paidPriceDollars: true,
    paidDescription: true,
    paidVideoLink: true,
    paidStartDate: true,
    paidEndDate: true,
    contact: true,
    lastUpdated: true,
    lastCommit: true,
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
      level: levelSchema,
      chaptersCount: z.number().optional(),
    }),
  );

export const joinedCourseSchema = minimalJoinedCourseSchema.merge(
  z.object({
    professors: formattedProfessorSchema.array(),
  }),
);

export const joinedCourseWithProfessorsSchema = minimalJoinedCourseSchema.merge(
  z.object({ professors: formattedProfessorSchema.array() }),
);

export const joinedCourseWithAllSchema = minimalJoinedCourseSchema.merge(
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
    courseSchema
      .pick({
        lastUpdated: true,
        lastCommit: true,
      })
      .merge(z.object({ professors: formattedProfessorSchema.array() })),
  );
