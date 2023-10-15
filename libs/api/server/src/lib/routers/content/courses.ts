import { z } from 'zod';

import {
  createGetCourse,
  createGetCourseChapter,
  createGetCourseChapterQuizzes,
  createGetCourseChapters,
  createGetCourses,
} from '@sovereign-university/api/content';

import { publicProcedure } from '../../procedures';
import { createTRPCRouter } from '../../trpc';

const getCoursesProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/courses' } })
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetCourses(ctx.dependencies)(input?.language),
  );

const getCourseProcedure = publicProcedure
  .meta({
    openapi: { method: 'GET', path: '/content/courses/{id}/{language}' },
  })
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetCourse(ctx.dependencies)(input.id, input.language),
  );

const getCourseChaptersProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/content/courses/{id}/{language}/chapters',
    },
  })
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetCourseChapters(ctx.dependencies)(input.id, input.language),
  );

const getCourseChapterProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/content/courses/{courseId}/{language}/{partIndex}/{chapterIndex}',
    },
  })
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
      partIndex: z.string(),
      chapterIndex: z.string(),
    }),
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetCourseChapter(ctx.dependencies)(
      input.courseId,
      Number(input.partIndex),
      Number(input.chapterIndex),
      input.language,
    ),
  );

const getCourseChapterQuizzesProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/content/courses/{courseId}/{language}/{partIndex}/{chapterIndex}/quizzes',
    },
  })
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
      partIndex: z.string(),
      chapterIndex: z.string(),
    }),
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetCourseChapterQuizzes(ctx.dependencies)({
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
  getCourseChapterQuizzes: getCourseChapterQuizzesProcedure,
});
