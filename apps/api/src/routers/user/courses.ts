import { ExamType } from '@blms/constants';

import {
  checkoutDataSchema,
  courseExamInfoSchema,
  courseExamResultsExtendedSchema,
  courseExamResultsSchema,
  coursePaymentLightSchema,
  courseProgressExtendedSchema,
  courseProgressSchema,
  courseReviewSchema,
  courseSucceededExamSchema,
  courseUserChapterSchema,
  courseWithSingleTrialExamsGradesAndSummarySchema,
  minimalUserExamTimestampSchema,
  partialExamQuestionSchema,
  singleTrialExamQuestionStatisticsSchema,
} from '@blms/schemas';
import {
  createCalculateCourseChapterSeats,
  createRefreshCourseRating,
} from '@blms/service-content';
import {
  createCompleteAllChapters,
  createCompleteChapter,
  createCompleteExamAttempt,
  createGetAllSucceededUserExams,
  createGetAllUserCourseExamsResults,
  createGetCourseReview,
  createGetEnrolledStudentsCount,
  createGetExamInfo,
  createGetExamQuestions,
  createGetLatestExamResults,
  createGetPayment,
  createGetPayments,
  createGetProgress,
  createGetSingleTrialExamQuestionStatistics,
  createGetTeacherLedCourseDiplomaTimestamp,
  createGetTeacherLedCourseGrades,
  createGetUserChapter,
  createGetUserDetailsByCertificateId,
  createSaveCourseAssignmentGrade,
  createSaveCourseAssignmentSubmissionTime,
  createSaveCourseAssignmentsOrder,
  createSaveCoursePayment,
  createSaveCourseReview,
  createSaveQuizAttempt,
  createSaveUserChapter,
  createSetCourseAssignmentGradesAsPublished,
  createStartCourse,
  createStartExamAttempt,
  createTemporarySaveExamAttempt,
  createWithdrawUserFromCourseFinalLesson,
  generateChapterTicket,
} from '@blms/service-user';
import type {
  CheckoutData,
  CourseExamInfo,
  CourseExamResults,
  CourseExamResultsExtended,
  CoursePaymentLight,
  CourseProgress,
  CourseProgressExtended,
  CourseReview,
  CourseSucceededExam,
  CourseUserChapter,
  CourseWithSingleTrialExamsGradesAndSummary,
  MinimalUserExamTimestamp,
  PartialExamQuestion,
  SingleTrialExamQuestionStatistics,
} from '@blms/types';
import { z } from 'zod';
import {
  professorProcedure,
  studentProcedure,
} from '#src/procedures/protected.js';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const completeChapterProcedure = studentProcedure
  .input(
    z.object({
      chapterId: z.string(),
      courseId: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<CourseProgress[]>>(courseProgressSchema.array())
  .mutation(({ ctx, input }) =>
    createCompleteChapter(ctx.dependencies)({
      chapterId: input.chapterId,
      courseId: input.courseId,
      language: input?.language,
      uid: ctx.user.uid,
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
      courseId: input.courseId,
      language: input?.language,
      uid: ctx.user.uid,
    }),
  );

const getProgressProcedure = studentProcedure
  .input(z.object({ courseId: z.string() }).optional())
  .output<Parser<CourseProgressExtended[]>>(
    courseProgressExtendedSchema.array(),
  )
  .query(({ ctx, input }) =>
    createGetProgress(ctx.dependencies)({
      courseId: input?.courseId || '',
      uid: ctx.user.uid,
    }),
  );

const startExamAttemptProcedure = studentProcedure
  .input(
    z.object({
      chapterId: z.string(),
      courseId: z.string(),
      examType: z.nativeEnum(ExamType),
      language: z.string(),
    }),
  )
  .output<Parser<PartialExamQuestion[]>>(partialExamQuestionSchema.array())
  .mutation(({ ctx, input }) =>
    createStartExamAttempt(ctx.dependencies)({
      chapterId: input.chapterId,
      courseId: input.courseId,
      examType: input.examType,
      language: input.language,
      uid: ctx.user.uid,
    }),
  );

const completeExamAttemptProcedure = studentProcedure
  .input(
    z.object({
      answers: z.array(z.object({ order: z.number(), questionId: z.string() })),
      chapterId: z.string(),
      courseId: z.string(),
      examId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createCompleteExamAttempt(ctx.dependencies)({
      answers: input.answers,
      chapterId: input.chapterId,
      courseId: input.courseId,
      examId: input.examId,
      uid: ctx.user.uid,
    }),
  );

const getLatestExamResultsProcedure = studentProcedure
  .input(z.object({ chapterId: z.string().optional(), courseId: z.string() }))
  .output<Parser<CourseExamResultsExtended | null>>(
    courseExamResultsExtendedSchema.nullable(),
  )
  .query(({ ctx, input }) =>
    createGetLatestExamResults(ctx.dependencies)({
      chapterId: input.chapterId,
      courseId: input.courseId,
      uid: ctx.user.uid,
    }),
  );

const getTeacherLedCourseDiplomaTimestampProcedure = studentProcedure
  .input(z.object({ courseId: z.string() }))
  .output<Parser<MinimalUserExamTimestamp | null>>(
    minimalUserExamTimestampSchema.nullable(),
  )
  .query(({ ctx, input }) =>
    createGetTeacherLedCourseDiplomaTimestamp(ctx.dependencies)({
      courseId: input.courseId,
      uid: ctx.user.uid,
    }),
  );

const getAllUserCourseExamResultsProcedure = studentProcedure
  .input(z.object({ courseId: z.string() }))
  .output<Parser<CourseExamResults[]>>(courseExamResultsSchema.array())
  .query(({ ctx, input }) =>
    createGetAllUserCourseExamsResults(ctx.dependencies)({
      chapterId: undefined,
      courseId: input.courseId,
      uid: ctx.user.uid,
    }),
  );

const getAllSucceededUserExamsProcedure = studentProcedure
  .input(
    z.object({
      language: z.string(),
    }),
  )
  .output<Parser<CourseSucceededExam[]>>(courseSucceededExamSchema.array())
  .query(({ ctx, input }) =>
    createGetAllSucceededUserExams(ctx.dependencies)({
      language: input.language,
      uid: ctx.user.uid,
    }),
  );

const getGetTeacherLedCourseGradesProcedure = professorProcedure
  .input(
    z.object({
      courseId: z.string(),
      passingThreshold: z.number(),
    }),
  )
  .output<Parser<CourseWithSingleTrialExamsGradesAndSummary>>(
    courseWithSingleTrialExamsGradesAndSummarySchema,
  )
  .query(({ ctx, input }) =>
    createGetTeacherLedCourseGrades(ctx.dependencies)({
      courseId: input.courseId,
      passingThreshold: input.passingThreshold,
    }),
  );

const saveQuizAttemptProcedure = studentProcedure
  .input(
    z.object({
      chapterId: z.string(),
      correctAnswersCount: z.number(),
      questionsCount: z.number(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createSaveQuizAttempt(ctx.dependencies)({
      chapterId: input.chapterId,
      correctAnswersCount: input.correctAnswersCount,
      questionsCount: input.questionsCount,
      uid: ctx.user.uid,
    }),
  );

const saveCourseReviewProcedure = studentProcedure
  .input(
    z.object({
      adminComment: z.string(),
      chapterId: z.string(),
      courseId: z.string(),
      difficulty: z.number(),
      faithful: z.number(),
      general: z.number(),
      length: z.number(),
      publicComment: z.string(),
      quality: z.number(),
      recommend: z.number(),
      teacherComment: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    const { chapterId, ...rest } = input;

    await createSaveCourseReview(ctx.dependencies)({
      chapterId: chapterId,
      newReview: {
        ...rest,
        createdAt: new Date(),
        uid: ctx.user.uid,
      },
    });

    await createRefreshCourseRating(ctx.dependencies)(input.courseId);
  });

const saveCoursePaymentProcedure = studentProcedure
  .input(
    z.object({
      couponCode: z.string().optional(),
      courseId: z.string(),
      courseIndex: z.string(),
      dollarPrice: z.number(),
      format: z.string(),
      method: z.string(),
      satsPrice: z.number(),
    }),
  )
  .output<Parser<CheckoutData>>(checkoutDataSchema)
  .mutation(({ ctx, input }) =>
    createSaveCoursePayment(ctx.dependencies)({
      couponCode: input.couponCode,
      courseId: input.courseId,
      courseIndex: input.courseIndex,
      dollarPrice: input.dollarPrice,
      format: input.format,
      method: input.method,
      satsPrice: input.satsPrice,
      uid: ctx.user.uid,
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
        booked: true,
        chapterId: true,
        completedAt: true,
        courseId: true,
      })
      .array(),
  )
  .query(({ ctx, input }) =>
    createGetUserChapter(ctx.dependencies)({
      courseId: input.courseId,
      uid: ctx.user.uid,
    }),
  );

const getCourseReviewProcedure = studentProcedure
  .input(z.object({ courseId: z.string() }))
  .output<Parser<CourseReview | null>>(courseReviewSchema.nullable())
  .query(({ ctx, input }) =>
    createGetCourseReview(ctx.dependencies)({
      courseId: input.courseId,
      uid: ctx.user.uid,
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

const getSingleTrialExamQuestionStatisticsProcedure = professorProcedure
  .input(z.object({ chapterId: z.string() }))
  .output<Parser<SingleTrialExamQuestionStatistics[]>>(
    singleTrialExamQuestionStatisticsSchema.array(),
  )
  .query(({ ctx, input }) =>
    createGetSingleTrialExamQuestionStatistics(ctx.dependencies)(
      input.chapterId,
    ),
  );

const saveUserChapterProcedure = studentProcedure
  .input(
    z.object({
      booked: z.boolean(),
      chapterId: z.string(),
      courseId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createSaveUserChapter(ctx.dependencies)({
      booked: input.booked,
      chapterId: input.chapterId,
      courseId: input.courseId,
      uid: ctx.user.uid,
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
      courseId: input.courseId,
      uid: ctx.user.uid,
    });
  });

const downloadChapterTicketProcedure = studentProcedure
  .input(
    z.object({
      addressLine1: z.string().nullable(),
      addressLine2: z.string().nullable(),
      addressLine3: z.string().nullable(),
      availableSeats: z.number().nullable(),
      formattedStartDate: z.string().optional(),
      formattedTime: z.string().optional(),
      liveLanguage: z.string().nullable(),
      organizer: z.string().optional(),
      title: z.string().optional(),
      userName: z.string(),
    }),
  )
  .output<Parser<string>>(z.string())
  .mutation(({ input }) => {
    return generateChapterTicket({
      ...input,
      addressLine1: input.addressLine1 || '',
      title: input.title || '',
    }).then((buffer) => buffer.toString('base64'));
  });

const getUserDetailsByCertificateIdProcedure = publicProcedure
  .input(
    z.object({
      certificateId: z.string(),
      isCourseWithSingleTrialExam: z.boolean().optional().default(false),
    }),
  )
  .output(
    z.object({
      courseId: z.string(),
      displayName: z.string(),
      uid: z.string(),
    }),
  )
  .query(({ ctx, input }) => {
    const { certificateId, isCourseWithSingleTrialExam } = input;

    return createGetUserDetailsByCertificateId(ctx.dependencies)({
      certificateId,
      isCourseWithSingleTrialExam,
    });
  });

const temporarySaveExamAttemptProcedure = studentProcedure
  .input(
    z.object({
      answers: z.array(z.object({ order: z.number(), questionId: z.string() })),
      chapterId: z.string(),
      courseId: z.string(),
      examId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createTemporarySaveExamAttempt(ctx.dependencies)({
      answers: input.answers,
      chapterId: input.chapterId,
      courseId: input.courseId,
      examId: input.examId,
      uid: ctx.user.uid,
    }),
  );

const saveCourseAssignmentsOrderProcedure = studentProcedure
  .input(
    z.object({
      assignmentsIds: z.string().array(),
      courseId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createSaveCourseAssignmentsOrder(ctx.dependencies)({
      assignmentsIds: input.assignmentsIds,
      courseId: input.courseId,
      uid: ctx.user.uid,
    });
  });

const saveAssignmentSubmissionTimeProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createSaveCourseAssignmentSubmissionTime(ctx.dependencies)({
      courseId: input.courseId,
      uid: ctx.user.uid,
    });
  });

const saveCourseAssignmentGradeProcedure = professorProcedure
  .input(
    z.object({
      courseId: z.string(),
      grade: z.number().nullable(),
      uid: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createSaveCourseAssignmentGrade(ctx.dependencies)({
      courseId: input.courseId,
      grade: input.grade,
      teacherUid: ctx.user.uid,
      uid: input.uid,
    });
  });

const setCourseAssignmentGradesAsPublishedProcedure = professorProcedure
  .input(
    z.object({
      courseId: z.string(),
      isPlanBSchool: z.boolean().optional().default(false),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) => {
    return createSetCourseAssignmentGradesAsPublished(ctx.dependencies)({
      courseId: input.courseId,
      isPlanBSchool: input.isPlanBSchool,
      teacherUid: ctx.user.uid,
    });
  });

const getEnrolledStudentsCountProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<number>>(z.number())
  .query(({ ctx, input }) => {
    return createGetEnrolledStudentsCount(ctx.dependencies)({
      courseId: input.courseId,
    });
  });

const withdrawUserFromCourseFinalLessonProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createWithdrawUserFromCourseFinalLesson(ctx.dependencies)({
      courseId: input.courseId,
      uid: ctx.user.uid,
    });
  });

export const userCoursesRouter = createTRPCRouter({
  completeAllChapters: completeAllChaptersProcedure,
  completeChapter: completeChapterProcedure,
  completeExamAttempt: completeExamAttemptProcedure,
  downloadChapterTicket: downloadChapterTicketProcedure,
  getAllSucceededUserExams: getAllSucceededUserExamsProcedure,
  getAllUserCourseExamResults: getAllUserCourseExamResultsProcedure,
  getCourseReview: getCourseReviewProcedure,
  getEnrolledStudentsCount: getEnrolledStudentsCountProcedure,
  getExamInfo: getExamInfoProcedure,
  getExamQuestions: getExamQuestionsProcedure,
  getLatestExamResults: getLatestExamResultsProcedure,
  getPayment: getPaymentProcedure,
  getPayments: getPaymentsProcedure,
  getProgress: getProgressProcedure,
  getSingleTrialExamQuestionStatistics:
    getSingleTrialExamQuestionStatisticsProcedure,
  getTeacherLedCourseDiplomaTimestamp:
    getTeacherLedCourseDiplomaTimestampProcedure,
  getTeacherLedCourseGrades: getGetTeacherLedCourseGradesProcedure,
  getUserChapter: getUserChapterProcedure,
  getUserDetailsByCertificateId: getUserDetailsByCertificateIdProcedure,
  saveCourseAssignmentGrade: saveCourseAssignmentGradeProcedure,
  saveCourseAssignmentSubmissionTime: saveAssignmentSubmissionTimeProcedure,
  saveCourseAssignmentsOrder: saveCourseAssignmentsOrderProcedure,
  saveCoursePayment: saveCoursePaymentProcedure,
  saveCourseReview: saveCourseReviewProcedure,
  saveQuizAttempt: saveQuizAttemptProcedure,
  saveUserChapter: saveUserChapterProcedure,
  setCourseAssignmentGradesAsPublished:
    setCourseAssignmentGradesAsPublishedProcedure,
  startCourse: startCourseProcedure,
  startExamAttempt: startExamAttemptProcedure,
  temporarySaveExamAttempt: temporarySaveExamAttemptProcedure,
  withdrawUserFromCourseFinalLesson: withdrawUserFromCourseFinalLessonProcedure,
});
