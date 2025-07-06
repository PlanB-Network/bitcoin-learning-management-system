import { joinedVideoSchema } from '@blms/schemas';
import { createGetVideos } from '@blms/service-content';
import { createGenerateCourseVideo } from '@blms/service-content';
import type { JoinedVideo } from '@blms/types';
import { z } from 'zod';
import { contributorProcedure } from '#src/procedures/protected.js';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getVideosProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<JoinedVideo[]>>(joinedVideoSchema.array())
  .query(({ ctx, input }) =>
    createGetVideos(ctx.dependencies)(input.id, input.language),
  );

const generateCourseVideoProcedure = contributorProcedure
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
    }),
  )
  .output(
    z.object({
      outputKey: z.string(),
      toolkitTask: z.any(),
      accessToken: z.string().optional(),
    }),
  )
  .mutation(({ ctx, input }) => {
    return createGenerateCourseVideo(ctx.dependencies)(
      input.courseId,
      input.language,
    );
  });

export const videosRouter = createTRPCRouter({
  getVideos: getVideosProcedure,
  generateCourseVideo: generateCourseVideoProcedure,
});
