import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentCourseChapters,
  contentCourseChaptersLocalized,
  contentCourseParts,
  contentCoursePartsLocalized,
  contentCourses,
  contentCoursesLocalized,
} from '@sovereign-university/database/schemas';

import { formattedProfessorSchema } from './professor.js';

import { levelSchema } from './index.js';

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

export const joinedCourseChapterSchema = courseChapterLocalizedSchema
  .pick({
    part: true,
    chapter: true,
    language: true,
    title: true,
    sections: true,
    releaseDate: true,
    releasePlace: true,
    rawContent: true,
  })
  .merge(
    z.object({
      partTitle: z.string(),
    }),
  );

export const minimalJoinedCourseSchema = courseSchema
  .pick({
    id: true,
    hours: true,
    requiresPayment: true,
    paidPriceEuros: true,
    paidDescription: true,
    paidVideoLink: true,
    paidStartDate: true,
    paidEndDate: true,
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
  }),
);

export const joinedCourseChapterWithContentSchema = courseChapterLocalizedSchema
  .pick({
    part: true,
    chapter: true,
    language: true,
    title: true,
    rawContent: true,
  })
  .merge(
    courseSchema
      .pick({
        lastUpdated: true,
        lastCommit: true,
      })
      .merge(z.object({ professors: formattedProfessorSchema.array() })),
  );
