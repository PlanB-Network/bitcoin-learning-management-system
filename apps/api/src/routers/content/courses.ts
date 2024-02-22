import { z } from 'zod';

import {
  createGetCourse,
  createGetCourseChapter,
  createGetCourseChapterQuizQuestions,
  createGetCourseChapters,
  createGetCourses,
} from '@sovereign-university/content';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getCoursesProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) =>
    createGetCourses(ctx.dependencies)(input?.language),
  );

const getCourseProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )

  .query(async ({ ctx, input }) =>
    createGetCourse(ctx.dependencies)(input.id, input.language),
  );

const getCourseChaptersProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )

  .query(async ({ ctx, input }) =>
    createGetCourseChapters(ctx.dependencies)(input.id, input.language),
  );

const getCourseChapterProcedure = publicProcedure
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
      partIndex: z.string(),
      chapterIndex: z.string(),
    }),
  )

  .query(async ({ ctx, input }) =>
    createGetCourseChapter(ctx.dependencies)(
      input.courseId,
      Number(input.partIndex),
      Number(input.chapterIndex),
      input.language,
    ),
  );

const getCourseChapterQuizQuestionsProcedure = publicProcedure
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
      partIndex: z.string(),
      chapterIndex: z.string(),
    }),
  )

  .query(async ({ ctx, input }) =>
    createGetCourseChapterQuizQuestions(ctx.dependencies)({
      courseId: input.courseId,
      partIndex: Number(input.partIndex),
      chapterIndex: Number(input.chapterIndex),
      language: input.language,
    }),
  );

export const coursesRouter = createTRPCRouter({
  getCourses: getCoursesProcedure,
  getCourse: getCourseProcedure,
  getCourseChapters: getCourseChaptersProcedure,
  getCourseChapter: getCourseChapterProcedure,
  getCourseChapterQuizQuestions: getCourseChapterQuizQuestionsProcedure,
});
