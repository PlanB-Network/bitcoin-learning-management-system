import { z } from 'zod';

import {
  checkoutDataSchema,
  courseExamResultsSchema,
  coursePaymentSchema,
  courseProgressExtendedSchema,
  courseProgressSchema,
  courseReviewSchema,
  courseSuccededExamSchema,
  courseUserChapterSchema,
  partialExamQuestionSchema,
} from '@blms/schemas';
import {
  createCalculateCourseChapterSeats,
  createRefreshCourseRating,
} from '@blms/service-content';
import type { GetPaymentOutput } from '@blms/service-user';
import {
  createCompleteChapter,
  createCompleteExamAttempt,
  createGetAllSuccededUserExams,
  createGetAllUserCourseExamsResults,
  createGetCourseReview,
  createGetLatestExamResults,
  createGetPayment,
  createGetProgress,
  createGetUserChapter,
  createSaveCourseReview,
  createSaveFreePayment,
  createSavePayment,
  createSaveQuizAttempt,
  createSaveUserChapter,
  createStartExamAttempt,
  generateChapterTicket,
} from '@blms/service-user';
import type {
  CheckoutData,
  CourseExamResults,
  CourseProgress,
  CourseProgressExtended,
  CourseReview,
  CourseSuccededExam,
  CourseUserChapter,
  PartialExamQuestion,
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
  .input(z.object({ courseId: z.string() }).optional())
  .output<Parser<CourseProgressExtended[]>>(
    courseProgressExtendedSchema.array(),
  )
  .query(({ ctx, input }) =>
    createGetProgress(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input?.courseId || '',
    }),
  );

const startExamAttemptProcedure = studentProcedure
  .input(z.object({ courseId: z.string(), language: z.string() }))
  .output<Parser<PartialExamQuestion[]>>(partialExamQuestionSchema.array())
  .mutation(({ ctx, input }) =>
    createStartExamAttempt(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      language: input.language,
    }),
  );

const completeExamAttemptProcedure = studentProcedure
  .input(
    z.object({
      answers: z.array(z.object({ questionId: z.string(), order: z.number() })),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createCompleteExamAttempt(ctx.dependencies)({ answers: input.answers }),
  );

const getLatestExamResultsProcedure = studentProcedure
  .input(z.object({ courseId: z.string() }))
  .output<Parser<CourseExamResults>>(courseExamResultsSchema)
  .query(({ ctx, input }) =>
    createGetLatestExamResults(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
    }),
  );

const getAllUserCourseExamResultsProcedure = studentProcedure
  .input(z.object({ courseId: z.string() }))
  .output<Parser<CourseExamResults[]>>(courseExamResultsSchema.array())
  .query(({ ctx, input }) =>
    createGetAllUserCourseExamsResults(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
    }),
  );

const getAllSuccededUserExamsProcedure = studentProcedure
  .input(
    z.object({
      language: z.string(),
    }),
  )
  .output<Parser<CourseSuccededExam[]>>(courseSuccededExamSchema.array())
  .query(({ ctx, input }) =>
    createGetAllSuccededUserExams(ctx.dependencies)({
      uid: ctx.user.uid,
      language: input.language,
    }),
  );

const saveQuizAttemptProcedure = studentProcedure
  .input(
    z.object({
      chapterId: z.string(),
      questionsCount: z.number(),
      correctAnswersCount: z.number(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createSaveQuizAttempt(ctx.dependencies)({
      uid: ctx.user.uid,
      chapterId: input.chapterId,
      questionsCount: input.questionsCount,
      correctAnswersCount: input.correctAnswersCount,
    }),
  );

const saveCourseReviewProcedure = studentProcedure
  .input(
    z.object({
      general: z.number(),
      length: z.number(),
      difficulty: z.number(),
      quality: z.number(),
      faithful: z.number(),
      recommand: z.number(),
      publicComment: z.string(),
      teacherComment: z.string(),
      adminComment: z.string(),
      courseId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createSaveCourseReview(ctx.dependencies)({
      newReview: {
        ...input,
        createdAt: new Date(),
        uid: ctx.user.uid,
      },
    });

    await createRefreshCourseRating(ctx.dependencies)(input.courseId);
  });

const savePaymentProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
      amount: z.number(),
      couponCode: z.string().optional(),
      format: z.string(),
    }),
  )
  .output<Parser<CheckoutData>>(checkoutDataSchema)
  .mutation(({ ctx, input }) =>
    createSavePayment(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      amount: input.amount,
      couponCode: input.couponCode,
      format: input.format,
    }),
  );

const saveFreePaymentProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
      couponCode: z.string().optional(),
      format: z.string(),
    }),
  )
  .output<Parser<CheckoutData>>(checkoutDataSchema)
  .mutation(({ ctx, input }) =>
    createSaveFreePayment(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      couponCode: input.couponCode,
      format: input.format,
    }),
  );

const getPaymentProcedure = studentProcedure
  .input(z.void())
  .output<Parser<GetPaymentOutput>>(
    coursePaymentSchema
      .pick({
        courseId: true,
        paymentStatus: true,
        format: true,
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

const getCourseReviewProcedure = studentProcedure
  .input(z.object({ courseId: z.string() }))
  .output<Parser<CourseReview | null>>(courseReviewSchema.nullable())
  .query(({ ctx, input }) =>
    createGetCourseReview(ctx.dependencies)({
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
  .output<Parser<void>>(z.void())
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
      userName: z.string(),
    }),
  )
  .output<Parser<string>>(z.string())
  .mutation(({ input }) => generateChapterTicket(input));

export const userCoursesRouter = createTRPCRouter({
  completeChapter: completeChapterProcedure,
  completeExamAttempt: completeExamAttemptProcedure,
  downloadChapterTicket: downloadChapterTicketProcedure,
  getAllUserCourseExamResults: getAllUserCourseExamResultsProcedure,
  getAllSuccededUserExams: getAllSuccededUserExamsProcedure,
  getCourseReview: getCourseReviewProcedure,
  getLatestExamResults: getLatestExamResultsProcedure,
  getProgress: getProgressProcedure,
  getUserChapter: getUserChapterProcedure,
  getPayment: getPaymentProcedure,
  saveCourseReview: saveCourseReviewProcedure,
  saveQuizAttempt: saveQuizAttemptProcedure,
  saveUserChapter: saveUserChapterProcedure,
  savePayment: savePaymentProcedure,
  saveFreePayment: saveFreePaymentProcedure,
  startExamAttempt: startExamAttemptProcedure,
});
