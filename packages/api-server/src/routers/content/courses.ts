import { z } from 'zod';

import {
  firstRow,
  getCourseChapterQuery,
  getCourseChaptersQuery,
  getCourseQuery,
  getCoursesQuery,
} from '@sovereign-academy/database';

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
    })
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    ctx.dependencies.postgres
      .exec(getCourseQuery(input.id, input.language))
      .then(firstRow)
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
    ctx.dependencies.postgres
      .exec(
        getCourseChapterQuery(
          input.courseId,
          Number(input.chapterIndex),
          input.language
        )
      )
      .then(firstRow)
  );

export const coursesRouter = createTRPCRouter({
  getCourses: getCoursesProcedure,
  getCourse: getCourseProcedure,
  getCourseChapters: getCourseChaptersProcedure,
  getCourseChapter: getCourseChapterProcedure,
});
