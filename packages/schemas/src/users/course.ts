import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  usersCoursePayment,
  usersCourseProgress,
  usersCourseUserChapter,
  usersQuizAttempts,
} from '@sovereign-university/database/schemas';

import { courseChapterSchema } from '../content/index.js';

export const courseProgressSchema = createSelectSchema(usersCourseProgress);
export const coursePaymentSchema = createSelectSchema(usersCoursePayment);
export const courseUserChapterSchema = createSelectSchema(
  usersCourseUserChapter,
);
export const courseQuizAttemptsSchema = createSelectSchema(usersQuizAttempts);

export const courseProgressExtendedSchema = courseProgressSchema.merge(
  z.object({
    totalChapters: z.number(),
    chapters: z.array(
      courseUserChapterSchema.pick({
        chapterId: true,
        completedAt: true,
      }),
    ),
    nextChapter: courseChapterSchema
      .pick({
        chapterIndex: true,
        partIndex: true,
        chapterId: true,
        courseId: true,
      })
      .optional(),
    lastCompletedChapter: courseUserChapterSchema
      .pick({
        chapterId: true,
        completedAt: true,
      })
      .optional(),
  }),
);
