import { z } from 'zod';

import {
  courseChapterResponseSchema,
  courseReviewsExtendedSchema,
  joinedCourseChapterSchema,
  joinedCourseWithAllSchema,
  joinedCourseWithProfessorsSchema,
  joinedQuizQuestionSchema,
} from '@blms/schemas';
import {
  createCalculateCourseChapterSeats,
  createGetCourse,
  createGetCourseChapter,
  createGetCourseChapterQuizQuestions,
  createGetCourseChapters,
  createGetCourses,
  createGetProfessorCourses,
  createGetPublicCourseReviews,
  createGetTeacherCourseReviews,
} from '@blms/service-content';
import type {
  CourseChapterResponse,
  CourseReviewsExtended,
  JoinedCourseChapter,
  JoinedCourseWithAll,
  JoinedCourseWithProfessors,
  JoinedQuizQuestion,
} from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { professorProcedure, publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getCoursesProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output<Parser<JoinedCourseWithProfessors[]>>(
    joinedCourseWithProfessorsSchema.array(),
  )
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
  .output<Parser<JoinedCourseWithProfessors[]>>(
    joinedCourseWithProfessorsSchema.array(),
  )
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
  .output<Parser<JoinedCourseWithAll>>(joinedCourseWithAllSchema)
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
      language: z.string(),
      chapterId: z.string(),
    }),
  )
  .output<Parser<CourseChapterResponse>>(courseChapterResponseSchema)
  .query(({ ctx, input }) => {
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

const calculateCourseChapterSeatsProcedure = publicProcedure
  .input(
    z.object({
      oldPassword: z.string(),
      newPassword: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx }) => {
    return createCalculateCourseChapterSeats(ctx.dependencies)();
  });

export const coursesRouter = createTRPCRouter({
  getCourses: getCoursesProcedure,
  getProfessorCourses: getProfessorCoursesProcedure,
  getCourse: getCourseProcedure,
  getCourseChapters: getCourseChaptersProcedure,
  getCourseChapter: getCourseChapterProcedure,
  getCourseChapterQuizQuestions: getCourseChapterQuizQuestionsProcedure,
  calculateCourseChapterSeats: calculateCourseChapterSeatsProcedure,
  getPublicCourseReviews: getPublicCourseReviewsProcedure,
  getTeacherCourseReviews: getTeacherCourseReviewsProcedure,
});
