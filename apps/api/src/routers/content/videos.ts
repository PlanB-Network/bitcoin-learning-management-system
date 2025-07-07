import { joinedVideoSchema } from '@blms/schemas';
import { createGetVideos } from '@blms/service-content';
import type { JoinedVideo } from '@blms/types';
import { z } from 'zod';
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

export const videosRouter = createTRPCRouter({
  getVideos: getVideosProcedure,
});
