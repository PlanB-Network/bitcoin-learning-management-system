import { z } from 'zod';

import {
  coursePaymentSchema,
  courseProgressExtendedSchema,
  courseProgressSchema,
  courseUserChapterSchema,
} from '@blms/schemas';
import { createCalculateCourseChapterSeats } from '@blms/service-content';
import type { GetPaymentOutput } from '@blms/service-user';
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
} from '@blms/service-user';
import type {
  CourseProgress,
  CourseProgressExtended,
  CourseUserChapter,
} from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { studentProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const completeChapterProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
      chapterId: z.string(),
    }),
  )
  .output<Parser<CourseProgress[]>>(courseProgressSchema.array())
  .mutation(({ ctx, input }) =>
    createCompleteChapter(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      chapterId: input.chapterId,
    }),
  );

const getProgressProcedure = studentProcedure
  .input(z.void())
  .output<Parser<CourseProgressExtended[]>>(
    courseProgressExtendedSchema.array(),
  )
  .query(({ ctx }) =>
    createGetProgress(ctx.dependencies)({ uid: ctx.user.uid }),
  );

const saveQuizAttemptProcedure = studentProcedure
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

const savePaymentProcedure = studentProcedure
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

const saveFreePaymentProcedure = studentProcedure
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

const getPaymentProcedure = studentProcedure
  .input(z.void())
  .output<Parser<GetPaymentOutput>>(
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

type GetUserChapterOutput = Array<
  Pick<CourseUserChapter, 'courseId' | 'booked' | 'chapterId' | 'completedAt'>
>;

const getUserChapterProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<GetUserChapterOutput>>(
    courseUserChapterSchema
      .pick({
        courseId: true,
        booked: true,
        chapterId: true,
        completedAt: true,
      })
      .array(),
  )
  .query(({ ctx, input }) =>
    createGetUserChapter(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
    }),
  );

const saveUserChapterProcedure = studentProcedure
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
  });

const downloadChapterTicketProcedure = studentProcedure
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
  .mutation(({ input }) => generateChapterTicket(input));

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
