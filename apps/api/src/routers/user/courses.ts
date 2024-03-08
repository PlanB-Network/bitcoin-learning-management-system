import { z } from 'zod';

import {
  coursePaymentSchema,
  courseProgressExtendedSchema,
  courseProgressSchema,
} from '@sovereign-university/schemas';
import {
  createCompleteChapter,
  createGetPayment,
  createGetProgress,
  createSavePayment,
  createSaveQuizAttempt,
} from '@sovereign-university/user';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const completeChapterProcedure = protectedProcedure
  .input(
    z.object({
      courseId: z.string(),
      part: z.number(),
      chapter: z.number(),
    }),
  )
  .output(courseProgressSchema.array())
  .mutation(({ ctx, input }) =>
    createCompleteChapter(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      part: input.part,
      chapter: input.chapter,
    }),
  );

const getProgressProcedure = protectedProcedure
  .input(z.void())
  .output(
    courseProgressExtendedSchema
      .merge(
        z.object({
          totalChapters: z.number(),
        }),
      )
      .array(),
  )
  .query(({ ctx }) =>
    createGetProgress(ctx.dependencies)({ uid: ctx.user.uid }),
  );

const saveQuizAttemptProcedure = protectedProcedure
  .input(
    z.object({
      courseId: z.string(),
      partIndex: z.number(),
      chapterIndex: z.number(),
      questionsCount: z.number(),
      correctAnswersCount: z.number(),
    }),
  )
  .output(z.void())
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
  .input(
    z.object({
      courseId: z.string(),
      amount: z.number(),
      withPhysical: z.boolean(),
      part: z.number().optional(),
      chapter: z.number().optional(),
    }),
  )
  .output(
    z.object({
      id: z.string(),
      pr: z.string(),
      onChainAddr: z.string(),
      amount: z.number(),
      checkoutUrl: z.string(),
    }),
  )
  .mutation(({ ctx, input }) =>
    createSavePayment(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      amount: input.amount,
    }),
  );

const getPaymentProcedure = protectedProcedure
  .input(z.void())
  .output(
    coursePaymentSchema
      .pick({
        courseId: true,
        paymentStatus: true,
        amount: true,
        paymentId: true,
        invoiceUrl: true,
      })
      .array(),
  )
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
