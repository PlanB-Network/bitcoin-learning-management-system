import { z } from 'zod';

import {
  createCompleteChapter,
  createGetPayment,
  createGetProgress,
  createSavePayment,
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

const savePaymentProcedure = protectedProcedure
  .meta({
    openapi: { method: 'POST', path: '/users/courses/payment' },
  })
  .input(
    z.object({
      courseId: z.string(),
      paymentStatus: z.string(),
      amount: z.number(),
      paymentId: z.string(),
      invoiceUrl: z.string(),
    }),
  )
  .output(z.any())
  .mutation(({ ctx, input }) =>
    createSavePayment(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      paymentStatus: input.paymentStatus,
      amount: input.amount,
      paymentId: input.paymentId,
      invoiceUrl: input.invoiceUrl,
    }),
  );

const getPaymentProcedure = protectedProcedure
  .meta({
    openapi: { method: 'GET', path: '/users/courses/payment' },
  })
  .input(z.void())
  .output(z.any())
  .query(({ ctx }) =>
    createGetPayment(ctx.dependencies)({ uid: ctx.user.uid }),
  );

export const userCoursesRouter = createTRPCRouter({
  completeChapter: completeChapterProcedure,
  getProgress: getProgressProcedure,
  getPayment: getPaymentProcedure,
  saveQuizAttempt: saveQuizAttemptProcedure,
  savePayment: savePaymentProcedure,
});
