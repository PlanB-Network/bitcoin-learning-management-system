import {
  createAddHighlight,
  createDeleteHighlight,
  createGetHighlights,
} from '@blms/service-user';
import { z } from 'zod';

import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';

const getHighlightsProcedure = studentProcedure
  .input(z.object({ chapterId: z.string().uuid() }))
  .query(({ ctx, input }) =>
    createGetHighlights(ctx.dependencies)({
      chapterId: input.chapterId,
      uid: ctx.user.uid,
    }),
  );

const addHighlightProcedure = studentProcedure
  .input(
    z.object({
      chapterId: z.string().uuid(),
      text: z.string().min(1).max(5000),
      startOffset: z.number().int().min(0),
      endOffset: z.number().int().min(0),
      startContainerPath: z.string().max(500),
      endContainerPath: z.string().max(500),
    }),
  )
  .mutation(({ ctx, input }) =>
    createAddHighlight(ctx.dependencies)({
      chapterId: input.chapterId,
      endContainerPath: input.endContainerPath,
      endOffset: input.endOffset,
      startContainerPath: input.startContainerPath,
      startOffset: input.startOffset,
      text: input.text,
      uid: ctx.user.uid,
    }),
  );

const deleteHighlightProcedure = studentProcedure
  .input(z.object({ highlightId: z.string().uuid() }))
  .mutation(({ ctx, input }) =>
    createDeleteHighlight(ctx.dependencies)({
      highlightId: input.highlightId,
      uid: ctx.user.uid,
    }),
  );

export const userHighlightsRouter = createTRPCRouter({
  addHighlight: addHighlightProcedure,
  deleteHighlight: deleteHighlightProcedure,
  getHighlights: getHighlightsProcedure,
});
