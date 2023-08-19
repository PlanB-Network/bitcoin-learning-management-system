import { z } from 'zod';

import { protectedProcedure } from '../../procedures';
import {
  createCompleteChapter,
  createGetCoursesProgress,
} from '../../services/users/courses';
import { createTRPCRouter } from '../../trpc';

export const userCoursesRouter = createTRPCRouter({
  completeChapter: protectedProcedure
    .meta({
      openapi: { method: 'POST', path: '/users/courses/chapters/complete' },
    })
    .input(
      z.object({
        courseId: z.string(),
        language: z.string(),
        chapter: z.number(),
      })
    )
    .output(z.any())
    .mutation(({ ctx, input }) =>
      createCompleteChapter(ctx.dependencies)(
        ctx.user.uid,
        input.courseId,
        input.language,
        input.chapter
      )
    ),
  getProgress: protectedProcedure
    .meta({
      openapi: { method: 'GET', path: '/users/courses/progress' },
    })
    .input(z.void())
    .output(z.any())
    .query(({ ctx }) =>
      createGetCoursesProgress(ctx.dependencies)(ctx.user.uid)
    ),
});
