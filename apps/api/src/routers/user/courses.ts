import { z } from 'zod';

import { createCalculateCourseChapterSeats } from '@sovereign-university/content';
import {
  coursePaymentSchema,
  courseProgressExtendedSchema,
  courseProgressSchema,
  courseUserChapterSchema,
} from '@sovereign-university/schemas';
import {
  createCompleteChapter,
  createGetPayment,
  createGetProgress,
  createGetUserChapter,
  createSaveFreePayment,
  createSavePayment,
  createSaveQuizAttempt,
  createSaveUserChapter,
  generateChapterTicket,
} from '@sovereign-university/user';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const completeChapterProcedure = protectedProcedure
  .input(
    z.object({
      courseId: z.string(),
      chapterId: z.string(),
    }),
  )
  .output(courseProgressSchema.array())
  .mutation(({ ctx, input }) =>
    createCompleteChapter(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      chapterId: input.chapterId,
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
      chapterId: z.string(),
      questionsCount: z.number(),
      correctAnswersCount: z.number(),
    }),
  )
  .output(z.void())
  .mutation(({ ctx, input }) =>
    createSaveQuizAttempt(ctx.dependencies)({
      uid: ctx.user.uid,
      chapterId: input.chapterId,
      questionsCount: input.questionsCount,
      correctAnswersCount: input.correctAnswersCount,
    }),
  );

const savePaymentProcedure = protectedProcedure
  .input(
    z.object({
      courseId: z.string(),
      amount: z.number(),
      part: z.number().optional(),
      chapter: z.number().optional(),
      couponCode: z.string().optional(),
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
      couponCode: input.couponCode,
    }),
  );

const saveFreePaymentProcedure = protectedProcedure
  .input(
    z.object({
      courseId: z.string(),
      part: z.number().optional(),
      chapter: z.number().optional(),
      couponCode: z.string().optional(),
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
    createSaveFreePayment(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      couponCode: input.couponCode,
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

const getUserChapterProcedure = protectedProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output(
    courseUserChapterSchema
      .pick({
        courseId: true,
        booked: true,
        chapterId: true,
        chapter: true,
        completedAt: true,
        part: true,
      })
      .array(),
  )
  .query(({ ctx, input }) =>
    createGetUserChapter(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
    }),
  );

const saveUserChapterProcedure = protectedProcedure
  .input(
    z.object({
      courseId: z.string(),
      chapterId: z.string(),
      booked: z.boolean(),
    }),
  )
  .output(z.void())
  .mutation(async ({ ctx, input }) => {
    await createSaveUserChapter(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      chapterId: input.chapterId,
      booked: input.booked,
    });

    await createCalculateCourseChapterSeats(ctx.dependencies)();
    const { redis } = ctx.dependencies;
    await redis.del('trpc:content.getCourseChapter*');
  });

const downloadChapterTicketProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string().optional(),
      addressLine1: z.string().nullable(),
      addressLine2: z.string().nullable(),
      addressLine3: z.string().nullable(),
      formattedStartDate: z.string().optional(),
      formattedTime: z.string().optional(),
      liveLanguage: z.string().nullable(),
      formattedCapacity: z.string().optional(),
      contact: z.string().nullable(),
      userDisplayName: z.string(),
    }),
  )
  .output(z.string())
  .mutation(async ({ input }) => {
    return generateChapterTicket(input);
  });

export const userCoursesRouter = createTRPCRouter({
  completeChapter: completeChapterProcedure,
  downloadChapterTicket: downloadChapterTicketProcedure,
  getProgress: getProgressProcedure,
  getUserChapter: getUserChapterProcedure,
  getPayment: getPaymentProcedure,
  saveQuizAttempt: saveQuizAttemptProcedure,
  saveUserChapter: saveUserChapterProcedure,
  savePayment: savePaymentProcedure,
  saveFreePayment: saveFreePaymentProcedure,
});
