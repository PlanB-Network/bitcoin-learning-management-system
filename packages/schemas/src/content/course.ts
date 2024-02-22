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

export const joinedCourseSchema = courseSchema
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
      professors: z.array(z.string()),
    }),
  );

export const joinedCourseChapterSchema = courseChapterLocalizedSchema
  .pick({
    part: true,
    chapter: true,
    language: true,
    title: true,
    sections: true,
    rawContent: true,
  })
  .merge(
    z.object({
      partTitle: z.string(),
    }),
  );
