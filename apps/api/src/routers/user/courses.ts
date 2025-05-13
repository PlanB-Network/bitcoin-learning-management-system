import { z } from 'zod';

import {
  checkoutDataSchema,
  courseExamInfoSchema,
  courseExamResultsSchema,
  coursePaymentLightSchema,
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
import {
  createCompleteAllChapters,
  createCompleteChapter,
  createCompleteExamAttempt,
  createGetAllSuccededUserExams,
  createGetAllUserCourseExamsResults,
  createGetCourseReview,
  createGetExamInfo,
  createGetExamQuestions,
  createGetLatestExamResults,
  createGetPayment,
  createGetPayments,
  createGetProgress,
  createGetUserChapter,
  createGetUserDetailsByCertificateId,
  createSaveCoursePayment,
  createSaveCourseReview,
  createSaveQuizAttempt,
  createSaveUserChapter,
  createStartCourse,
  createStartExamAttempt,
  createTemporarySaveExamAttempt,
  generateChapterTicket,
} from '@blms/service-user';
import type {
  CheckoutData,
  CourseExamInfo,
  CourseExamResults,
  CoursePaymentLight,
  CourseProgress,
  CourseProgressExtended,
  CourseReview,
  CourseSuccededExam,
  CourseUserChapter,
  PartialExamQuestion,
} from '@blms/types';

import { ExamType } from '@blms/constants';
import { studentProcedure } from '#src/procedures/protected.js';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const completeChapterProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
      chapterId: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<CourseProgress[]>>(courseProgressSchema.array())
  .mutation(({ ctx, input }) =>
    createCompleteChapter(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      chapterId: input.chapterId,
      language: input?.language,
    }),
  );

const completeAllChaptersProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<CourseProgress[]>>(courseProgressSchema.array())
  .mutation(({ ctx, input }) =>
    createCompleteAllChapters(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      language: input?.language,
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
  .input(
    z.object({
      courseId: z.string(),
      chapterId: z.string(),
      language: z.string(),
      examType: z.nativeEnum(ExamType),
    }),
  )
  .output<Parser<PartialExamQuestion[]>>(partialExamQuestionSchema.array())
  .mutation(({ ctx, input }) =>
    createStartExamAttempt(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      chapterId: input.chapterId,
      language: input.language,
      examType: input.examType,
    }),
  );

const completeExamAttemptProcedure = studentProcedure
  .input(
    z.object({
      answers: z.array(z.object({ questionId: z.string(), order: z.number() })),
      chapterId: z.string(),
      courseId: z.string(),
      examId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createCompleteExamAttempt(ctx.dependencies)({
      answers: input.answers,
      uid: ctx.user.uid,
      chapterId: input.chapterId,
      courseId: input.courseId,
      examId: input.examId,
    }),
  );

const getLatestExamResultsProcedure = studentProcedure
  .input(z.object({ courseId: z.string(), chapterId: z.string().optional() }))
  .output<Parser<CourseExamResults | null>>(courseExamResultsSchema.nullable())
  .query(({ ctx, input }) =>
    createGetLatestExamResults(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      chapterId: input.chapterId,
    }),
  );

const getAllUserCourseExamResultsProcedure = studentProcedure
  .input(z.object({ courseId: z.string() }))
  .output<Parser<CourseExamResults[]>>(courseExamResultsSchema.array())
  .query(({ ctx, input }) =>
    createGetAllUserCourseExamsResults(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      chapterId: undefined,
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
      recommend: z.number(),
      publicComment: z.string(),
      teacherComment: z.string(),
      adminComment: z.string(),
      courseId: z.string(),
      chapterId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    const { chapterId, ...rest } = input;

    await createSaveCourseReview(ctx.dependencies)({
      newReview: {
        ...rest,
        createdAt: new Date(),
        uid: ctx.user.uid,
      },
      chapterId: chapterId,
    });

    await createRefreshCourseRating(ctx.dependencies)(input.courseId);
  });

const saveCoursePaymentProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
      courseIndex: z.string(),
      satsPrice: z.number(),
      dollarPrice: z.number(),
      couponCode: z.string().optional(),
      format: z.string(),
      method: z.string(),
    }),
  )
  .output<Parser<CheckoutData>>(checkoutDataSchema)
  .mutation(({ ctx, input }) =>
    createSaveCoursePayment(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
      courseIndex: input.courseIndex,
      satsPrice: input.satsPrice,
      dollarPrice: input.dollarPrice,
      method: input.method,
      couponCode: input.couponCode,
      format: input.format,
    }),
  );

const getPaymentProcedure = studentProcedure
  .input(
    z.object({
      paymentId: z.string(),
    }),
  )
  .output<Parser<CoursePaymentLight>>(coursePaymentLightSchema)
  .query(({ ctx, input }) =>
    createGetPayment(ctx.dependencies)({
      paymentId: input.paymentId,
    }),
  );

const getPaymentsProcedure = studentProcedure
  .input(z.void())
  .output<Parser<CoursePaymentLight[]>>(coursePaymentLightSchema.array())
  .query(({ ctx }) =>
    createGetPayments(ctx.dependencies)({ uid: ctx.user.uid }),
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

const getExamInfoProcedure = studentProcedure
  .input(z.object({ chapterId: z.string(), language: z.string() }))
  .output<Parser<CourseExamInfo>>(courseExamInfoSchema)

  .query(({ ctx, input }) =>
    createGetExamInfo(ctx.dependencies)({
      chapterId: input.chapterId,
      language: input.language,
    }),
  );

const getExamQuestionsProcedure = studentProcedure
  .input(z.object({ examId: z.string(), language: z.string() }))
  .output<Parser<PartialExamQuestion[]>>(partialExamQuestionSchema.array())

  .query(({ ctx, input }) =>
    createGetExamQuestions(ctx.dependencies)({
      examId: input.examId,
      language: input.language,
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

const startCourseProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createStartCourse(ctx.dependencies)({
      uid: ctx.user.uid,
      courseId: input.courseId,
    });
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
      availableSeats: z.number().nullable(),
      userName: z.string(),
      organizer: z.string().optional(),
    }),
  )
  .output<Parser<string>>(z.string())
  .mutation(({ input }) => {
    return generateChapterTicket({
      ...input,
      title: input.title || '',
      addressLine1: input.addressLine1 || '',
    }).then((buffer) => buffer.toString('base64'));
  });

const getUserDetailsByCertificateIdProcedure = publicProcedure
  .input(
    z.object({
      certificateId: z.string(),
    }),
  )
  .output(
    z.object({
      uid: z.string(),
      courseId: z.string(),
      displayName: z.string(),
    }),
  )
  .query(({ ctx, input }) => {
    const { certificateId } = input;

    return createGetUserDetailsByCertificateId(ctx.dependencies)({
      certificateId,
    });
  });

const temporarySaveExamAttemptProcedure = studentProcedure
  .input(
    z.object({
      answers: z.array(z.object({ questionId: z.string(), order: z.number() })),
      chapterId: z.string(),
      courseId: z.string(),
      examId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createTemporarySaveExamAttempt(ctx.dependencies)({
      answers: input.answers,
      uid: ctx.user.uid,
      chapterId: input.chapterId,
      courseId: input.courseId,
      examId: input.examId,
    }),
  );

export const userCoursesRouter = createTRPCRouter({
  completeAllChapters: completeAllChaptersProcedure,
  completeChapter: completeChapterProcedure,
  completeExamAttempt: completeExamAttemptProcedure,
  downloadChapterTicket: downloadChapterTicketProcedure,
  getAllUserCourseExamResults: getAllUserCourseExamResultsProcedure,
  getAllSuccededUserExams: getAllSuccededUserExamsProcedure,
  getCourseReview: getCourseReviewProcedure,
  getExamInfo: getExamInfoProcedure,
  getExamQuestions: getExamQuestionsProcedure,
  getLatestExamResults: getLatestExamResultsProcedure,
  getProgress: getProgressProcedure,
  getUserChapter: getUserChapterProcedure,
  getPayment: getPaymentProcedure,
  getPayments: getPaymentsProcedure,
  getUserDetailsByCertificateId: getUserDetailsByCertificateIdProcedure,
  saveCourseReview: saveCourseReviewProcedure,
  saveQuizAttempt: saveQuizAttemptProcedure,
  saveUserChapter: saveUserChapterProcedure,
  saveCoursePayment: saveCoursePaymentProcedure,
  startCourse: startCourseProcedure,
  startExamAttempt: startExamAttemptProcedure,
  temporarySaveExamAttempt: temporarySaveExamAttemptProcedure,
});
