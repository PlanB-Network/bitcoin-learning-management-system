import { EducatorContentStatus, EducatorContentType } from '@blms/constants';
import { joinedEducatorContentSchema } from '@blms/schemas';
import {
  createApproveEducatorContent,
  createCreateEducatorContent,
  createGetEducatorContent,
  createIncrementEducatorContentDownloads,
  createRejectEducatorContent,
  createUnpublishEducatorContent,
  createUpdateEducatorContent,
  createUpdateEducatorContentAsAdmin,
} from '@blms/service-content';
import { createSendEducatorContentApprovedEmail } from '@blms/service-user';
import type { JoinedEducatorContent } from '@blms/types';
import { z } from 'zod';
import {
  adminProcedure,
  publicProcedure,
  studentProcedure,
} from '#src/procedures/index.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

export const educatorContentRouter = createTRPCRouter({
  getEducatorContents: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        language: z.string().optional(),
        status: z.enum(EducatorContentStatus).optional(),
        uid: z.string().optional(),
      }),
    )
    .output<Parser<JoinedEducatorContent[]>>(
      z.array(joinedEducatorContentSchema),
    )
    .query(async ({ ctx, input }) => {
      return createGetEducatorContent(ctx.dependencies)(
        input.language,
        input.status,
        input.id,
        input.uid,
      );
    }),

  createEducatorContent: studentProcedure
    .input(
      z.object({
        type: z.enum(EducatorContentType),
        cover: z.string().optional(),
        language: z.string(),
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(EducatorContentStatus).optional(),
        originalId: z.string().optional(),
        links: z
          .array(
            z.object({
              url: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
        files: z
          .array(
            z.object({
              path: z.string(),
              name: z.string(),
              mime_type: z.string(),
              size: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const createEducatorContent = createCreateEducatorContent(
        ctx.dependencies,
      );
      return createEducatorContent({
        ...input,
        uid: ctx.user.uid,
        cover: input.cover ?? null,
        description: input.description ?? null,
        status: input.status ?? EducatorContentStatus.Draft,
        originalId: input.originalId ?? null,
      } as any);
    }),

  updateEducatorContent: studentProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(EducatorContentType).optional(),
        cover: z.string().optional(),
        language: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(EducatorContentStatus).optional(),
        links: z
          .array(
            z.object({
              url: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
        files: z
          .array(
            z.object({
              path: z.string(),
              name: z.string(),
              mime_type: z.string(),
              size: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateEducatorContent = createUpdateEducatorContent(
        ctx.dependencies,
      );
      return updateEducatorContent({
        ...input,
        uid: ctx.user.uid,
        cover: input.cover ?? undefined,
        description: input.description ?? undefined,
      } as any);
    }),

  adminUpdateEducatorContent: adminProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(EducatorContentType).optional(),
        cover: z.string().optional(),
        language: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(EducatorContentStatus).optional(),
        links: z
          .array(
            z.object({
              url: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
        files: z
          .array(
            z.object({
              path: z.string(),
              name: z.string(),
              mime_type: z.string(),
              size: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateEducatorContent = createUpdateEducatorContentAsAdmin(
        ctx.dependencies,
      );
      return updateEducatorContent({
        ...input,
        cover: input.cover ?? undefined,
        description: input.description ?? undefined,
      } as any);
    }),

  approveEducatorContent: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const approveEducatorContent = createApproveEducatorContent(
        ctx.dependencies,
      );
      const getEducatorContent = createGetEducatorContent(ctx.dependencies);
      const sendEducatorContentApprovedEmail =
        createSendEducatorContentApprovedEmail(ctx.dependencies);

      const [content] = await getEducatorContent(
        undefined,
        undefined,
        input.id,
      );

      if (!content) {
        throw new Error('Content not found');
      }

      await approveEducatorContent(input.id, content.originalId ?? undefined);

      await sendEducatorContentApprovedEmail({
        title: content.title,
        userId: content.uid,
        language: content.language,
      });
    }),

  rejectEducatorContent: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rejectEducatorContent = createRejectEducatorContent(
        ctx.dependencies,
      );
      return rejectEducatorContent(input.id);
    }),

  incrementDownloads: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const incrementDownloads = createIncrementEducatorContentDownloads(
        ctx.dependencies,
      );
      return incrementDownloads(input.id);
    }),

  unpublishEducatorContent: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const unpublishEducatorContent = createUnpublishEducatorContent(
        ctx.dependencies,
      );
      return unpublishEducatorContent(input.id);
    }),
});
