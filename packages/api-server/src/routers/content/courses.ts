import { z } from 'zod';

import {
  getCourseChaptersQuery,
  getCoursesQuery,
} from '@sovereign-academy/database';

import {
  createGetCourse,
  createGetCourseChapter,
} from '../../services/content';
import { createTRPCRouter, publicProcedure } from '../../trpc';

const getCoursesProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/courses' } })
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional()
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    ctx.dependencies.postgres.exec(getCoursesQuery(input?.language))
  );

const getCourseProcedure = publicProcedure
  .meta({
    openapi: { method: 'GET', path: '/content/courses/{id}/{language}' },
  })
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
      includeChapters: z.boolean().optional(),
    })
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetCourse(ctx.dependencies)(
      input.id,
      input.language,
      input.includeChapters
    )
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
    })
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    ctx.dependencies.postgres.exec(
      getCourseChaptersQuery(input.id, input.language)
    )
  );

const getCourseChapterProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/content/courses/{courseId}/{language}/chapters/{chapterIndex}',
    },
  })
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
      chapterIndex: z.string(),
    })
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetCourseChapter(ctx.dependencies)(
      input.courseId,
      Number(input.chapterIndex),
      input.language
    )
  );

export const coursesRouter = createTRPCRouter({
  getCourses: getCoursesProcedure,
  getCourse: getCourseProcedure,
  getCourseChapters: getCourseChaptersProcedure,
  getCourseChapter: getCourseChapterProcedure,
});
