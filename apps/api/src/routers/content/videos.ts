import { joinedVideoSchema } from '@blms/schemas';
import { createGetVideo } from '@blms/service-content';
import type { JoinedVideo } from '@blms/types';
import { z } from 'zod';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getVideoProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<JoinedVideo>>(joinedVideoSchema)
  .query(({ ctx, input }) =>
    createGetVideo(ctx.dependencies)(input.id, input.language),
  );

export const videosRouter = createTRPCRouter({
  getVideo: getVideoProcedure,
});
