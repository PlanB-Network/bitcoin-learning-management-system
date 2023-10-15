import { z } from 'zod';

import {
  createCompleteChapter,
  createGetProgress,
  createSaveQuizAttempt,
} from '@sovereign-university/api/user';

import { protectedProcedure } from '../../procedures';
import { createTRPCRouter } from '../../trpc';

const completeChapterProcedure = protectedProcedure
  .meta({
    openapi: { method: 'POST', path: '/users/courses/chapters/complete' },
  })
  .input(
    z.object({
      courseId: z.string(),
      part: z.number(),
      chapter: z.number(),
    }),
  )
  .output(z.any())
  .mutation(({ ctx, input }) =>
    createCompleteChapter(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      part: input.part,
      chapter: input.chapter,
    }),
  );

const getProgressProcedure = protectedProcedure
  .meta({
    openapi: { method: 'GET', path: '/users/courses/progress' },
  })
  .input(z.void())
  .output(z.any())
  .query(({ ctx }) =>
    createGetProgress(ctx.dependencies)({ uid: ctx.user.uid }),
  );

const saveQuizAttemptProcedure = protectedProcedure
  .meta({
    openapi: { method: 'POST', path: '/users/courses/quiz' },
  })
  .input(
    z.object({
      courseId: z.string(),
      partIndex: z.number(),
      chapterIndex: z.number(),
      questionsCount: z.number(),
      correctAnswersCount: z.number(),
    }),
  )
  .output(z.any())
  .mutation(({ ctx, input }) =>
    createSaveQuizAttempt(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      partIndex: input.partIndex,
      chapterIndex: input.chapterIndex,
      questionsCount: input.questionsCount,
      correctAnswersCount: input.correctAnswersCount,
    }),
  );

export const userCoursesRouter = createTRPCRouter({
  completeChapter: completeChapterProcedure,
  getProgress: getProgressProcedure,
  saveQuizAttempt: saveQuizAttemptProcedure,
});
