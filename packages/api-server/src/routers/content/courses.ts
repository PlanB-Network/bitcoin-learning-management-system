import { z } from 'zod';

import {
  createGetCourses,
  createGetCoursesChapters,
} from '../../services/content';
import { createTRPCRouter, publicProcedure } from '../../trpc';

const getCoursesProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/courses' } })
  .input(
    z.object({
      language: z.string().optional(),
    })
  )
  .output(z.array(z.any()))
  .query(async ({ ctx, input }) => {
    const { language } = input;

    const getCourses = createGetCourses(ctx.dependencies);
    return getCourses(language);
  });

const getCoursesChaptersProcedure = publicProcedure
  .meta({
    openapi: { method: 'GET', path: '/content/courses/{id}/{language}' },
  })
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    })
  )
  .output(z.array(z.any()))
  .query(async ({ ctx, input }) => {
    const { id, language } = input;

    const getChaptersCourses = createGetCoursesChapters(ctx.dependencies);
    return getChaptersCourses(id, language);
  });

export const coursesRouter = createTRPCRouter({
  getCourses: getCoursesProcedure,
  getCoursesChapters: getCoursesChaptersProcedure,
});
