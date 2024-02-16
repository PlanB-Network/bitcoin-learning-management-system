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
  .meta({ openapi: { method: 'GET', path: '/content/courses' } })
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
  .meta({
    openapi: { method: 'GET', path: '/content/courses/{id}/{language}' },
  })
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

  .query(async ({ ctx, input }) =>
    createGetCourseChapter(ctx.dependencies)(
      input.courseId,
      Number(input.partIndex),
      Number(input.chapterIndex),
      input.language,
    ),
  );

const getCourseChapterQuizQuestionsProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/content/courses/{courseId}/{language}/{partIndex}/{chapterIndex}/questions',
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
