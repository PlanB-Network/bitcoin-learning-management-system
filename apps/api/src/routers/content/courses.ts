import {
  basicCourseSchema,
  courseAssignmentSchema,
  courseChapterResponseSchema,
  courseResponseSchema,
  courseReviewsExtendedSchema,
  joinedCourseChapterSchema,
  joinedCourseSchema,
  joinedQuizQuestionSchema,
  minimalCourseAssignmentWithStudentsSchema,
  quizQuestionsCountSchema,
} from '@blms/schemas';
import {
  createCalculateCourseChapterSeats,
  createCheckChapterAccess,
  createGetCourse,
  createGetCourseAssignments,
  createGetCourseAssignmentsWithStudentsGrades,
  createGetCourseChapter,
  createGetCourseChapterQuizQuestions,
  createGetCourseChapterQuizQuestionsCount,
  createGetCourseChapters,
  createGetCourses,
  createGetCoursesBasic,
  createGetProfessorCourses,
  createGetPublicCourseReviews,
  createGetTeacherCourseReviews,
} from '@blms/service-content';
import type {
  BasicCourse,
  CourseAssignment,
  CourseChapterResponse,
  CourseResponse,
  CourseReviewsExtended,
  JoinedCourse,
  JoinedCourseChapter,
  JoinedQuizQuestion,
  MinimalCourseAssignmentWithStudents,
  QuizQuestionsCount,
} from '@blms/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  professorProcedure,
  studentProcedure,
} from '#src/procedures/protected.js';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getCoursesProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output<Parser<JoinedCourse[]>>(joinedCourseSchema.array())
  .query(({ ctx, input }) => {
    return createGetCourses(ctx.dependencies)(input?.language);
  });

const getProfessorCoursesProcedure = publicProcedure
  .input(
    z
      .object({
        coursesId: z.string().array(),
        language: z.string().optional(),
      })
      .optional(),
  )
  .output<Parser<JoinedCourse[]>>(joinedCourseSchema.array())
  .query(({ ctx, input }) => {
    return createGetProfessorCourses(ctx.dependencies)(
      input?.coursesId || [],
      input?.language,
    );
  });

const getPublicCourseReviewsProcedure = publicProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<CourseReviewsExtended | undefined>>(
    courseReviewsExtendedSchema.optional(),
  )
  .query(({ ctx, input }) => {
    return createGetPublicCourseReviews(ctx.dependencies)(input.courseId);
  });

const getTeacherCourseReviewsProcedure = professorProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<CourseReviewsExtended>>(courseReviewsExtendedSchema)
  .query(({ ctx, input }) => {
    return createGetTeacherCourseReviews(ctx.dependencies)(input.courseId);
  });

const getCourseProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<CourseResponse>>(courseResponseSchema)
  .query(({ ctx, input }) => {
    return createGetCourse(ctx.dependencies)(input.id, input.language);
  });

const getCourseChaptersProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<JoinedCourseChapter[]>>(joinedCourseChapterSchema.array())
  .query(({ ctx, input }) => {
    return createGetCourseChapters(ctx.dependencies)(input.id, input.language);
  });

const getCourseChapterProcedure = publicProcedure
  .input(
    z.object({
      chapterId: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<CourseChapterResponse>>(courseChapterResponseSchema)
  .query(async ({ ctx, input }) => {
    const uid = ctx.user?.uid || null;

    const status = await createCheckChapterAccess(ctx.dependencies)(
      input.chapterId,
      uid,
    );

    if (!status.allowed) {
      throw new TRPCError({
        cause: 'Payment required to access this chapter',
        code: uid ? 'FORBIDDEN' : 'UNAUTHORIZED',
      });
    }

    return createGetCourseChapter(ctx.dependencies)(
      input.chapterId,
      input.language,
    );
  });

const getCourseChapterQuizQuestionsProcedure = publicProcedure
  .input(
    z.object({
      chapterId: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<JoinedQuizQuestion[]>>(joinedQuizQuestionSchema.array())
  .query(({ ctx, input }) => {
    return createGetCourseChapterQuizQuestions(ctx.dependencies)({
      chapterId: input.chapterId,
      language: input.language,
    });
  });

const getCourseChapterQuizQuestionsCountProcedure = publicProcedure
  .input(
    z.object({
      chapterId: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<QuizQuestionsCount[]>>(quizQuestionsCountSchema.array())
  .query(({ ctx, input }) => {
    return createGetCourseChapterQuizQuestionsCount(ctx.dependencies)({
      chapterId: input.chapterId,
      language: input.language,
    });
  });

const getCourseAssignmentsProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<CourseAssignment[]>>(courseAssignmentSchema.array())
  .query(({ ctx, input }) => {
    return createGetCourseAssignments(ctx.dependencies)(input.courseId);
  });

const getCourseAssignmentsWithStudentsGradesProcedure = professorProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<MinimalCourseAssignmentWithStudents[]>>(
    minimalCourseAssignmentWithStudentsSchema.array(),
  )
  .query(({ ctx, input }) => {
    return createGetCourseAssignmentsWithStudentsGrades(ctx.dependencies)(
      input.courseId,
    );
  });

const calculateCourseChapterSeatsProcedure = publicProcedure
  .input(
    z.object({
      newPassword: z.string(),
      oldPassword: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx }) => {
    return createCalculateCourseChapterSeats(ctx.dependencies)();
  });

const getCoursesBasicProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output<Parser<BasicCourse[]>>(basicCourseSchema.array())
  .query(({ ctx, input }) => {
    return createGetCoursesBasic(ctx.dependencies)(input?.language);
  });

export const coursesRouter = createTRPCRouter({
  calculateCourseChapterSeats: calculateCourseChapterSeatsProcedure,
  getCourse: getCourseProcedure,
  getCourseAssignments: getCourseAssignmentsProcedure,
  getCourseAssignmentsWithStudentsGrades:
    getCourseAssignmentsWithStudentsGradesProcedure,
  getCourseChapter: getCourseChapterProcedure,
  getCourseChapterQuizQuestions: getCourseChapterQuizQuestionsProcedure,
  getCourseChapterQuizQuestionsCount:
    getCourseChapterQuizQuestionsCountProcedure,
  getCourseChapters: getCourseChaptersProcedure,
  getCourses: getCoursesProcedure,
  getProfessorCourses: getProfessorCoursesProcedure,
  getPublicCourseReviews: getPublicCourseReviewsProcedure,
  getTeacherCourseReviews: getTeacherCourseReviewsProcedure,
  getCoursesBasic: getCoursesBasicProcedure,
});
