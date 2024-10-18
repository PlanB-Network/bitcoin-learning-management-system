import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  usersCoursePayment,
  usersCourseProgress,
  usersCourseReview,
  usersCourseUserChapter,
  usersExamAttempts,
  usersExamQuestions,
  usersQuizAttempts,
} from '@blms/database';

import { courseChapterSchema } from '../content/index.js';

export const courseProgressSchema = createSelectSchema(usersCourseProgress);
export const coursePaymentSchema = createSelectSchema(usersCoursePayment);
export const courseUserChapterSchema = createSelectSchema(
  usersCourseUserChapter,
);
export const courseQuizAttemptsSchema = createSelectSchema(usersQuizAttempts);
export const courseReviewSchema = createSelectSchema(usersCourseReview);

export const courseExamAttemptSchema = createSelectSchema(usersExamAttempts);
export const courseExamQuestionSchema = createSelectSchema(usersExamQuestions);

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

export const getUserChapterResponseSchema = courseUserChapterSchema.pick({
  courseId: true,
  chapterId: true,
  completedAt: true,
  booked: true,
});

export const partialExamQuestionSchema = courseExamQuestionSchema
  .pick({
    id: true,
  })
  .merge(
    z.object({
      text: z.string(),
      answers: z
        .object({
          order: z.number(),
          text: z.string(),
        })
        .array(),
    }),
  );

export const courseExamResultsSchema = courseExamAttemptSchema
  .pick({
    score: true,
    finalized: true,
    succeeded: true,
    startedAt: true,
    finishedAt: true,
  })
  .merge(
    z.object({
      questions: z.array(
        z.object({
          text: z.string(),
          explanation: z.string(),
          chapterName: z.string(),
          chapterPart: z.number(),
          chapterIndex: z.number(),
          chapterLink: z.string(),
          userAnswer: z.number().nullable(),
          answers: z.array(
            z.object({
              text: z.string(),
              order: z.number(),
              correctAnswer: z.boolean(),
            }),
          ),
        }),
      ),
    }),
  );

export const courseSuccededExamSchema = courseExamAttemptSchema
  .pick({
    score: true,
    finalized: true,
    succeeded: true,
    startedAt: true,
    finishedAt: true,
    courseId: true,
  })
  .merge(z.object({ courseName: z.string() }));
