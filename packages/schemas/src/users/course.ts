import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  usersCourseCompletedChapters,
  usersCoursePayment,
  usersCourseProgress,
  usersQuizAttempts,
} from '@sovereign-university/database/schemas';

import { courseChapterSchema } from '#src/content/index.js';

export const courseProgressSchema = createSelectSchema(usersCourseProgress);
export const coursePaymentSchema = createSelectSchema(usersCoursePayment);
export const courseCompletedChaptersSchema = createSelectSchema(
  usersCourseCompletedChapters,
);
export const courseQuizAttemptsSchema = createSelectSchema(usersQuizAttempts);

export const courseProgressExtendedSchema = courseProgressSchema.merge(
  z.object({
    totalChapters: z.number(),
    chapters: z.array(
      courseCompletedChaptersSchema.pick({
        part: true,
        chapter: true,
        completedAt: true,
      }),
    ),
    nextChapter: courseChapterSchema
      .pick({ part: true, chapter: true })
      .optional(),
    lastCompletedChapter: courseCompletedChaptersSchema
      .pick({
        part: true,
        chapter: true,
        completedAt: true,
      })
      .optional(),
  }),
);
