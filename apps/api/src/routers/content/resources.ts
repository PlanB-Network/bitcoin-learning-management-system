import { z } from 'zod';

import {
  getBetResponseSchema,
  getBookResponseSchema,
  getBuilderResponseSchema,
  getConferenceResponseSchema,
  getPodcastResponseSchema,
  joinedGlossaryWordSchema,
} from '@blms/schemas';
import {
  createGetBets,
  createGetBook,
  createGetBooks,
  createGetBuilder,
  createGetBuilders,
  createGetConference,
  createGetConferences,
  createGetGlossaryWord,
  createGetGlossaryWords,
  createGetPodcast,
  createGetPodcasts,
} from '@blms/service-content';
import type {
  GetBetResponse,
  GetBookResponse,
  GetBuilderResponse,
  GetConferenceResponse,
  GetPodcastResponse,
  JoinedGlossaryWord,
} from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const createGetResourcesProcedure = () => {
  return publicProcedure.input(
    z.object({ language: z.string().optional() }).optional(),
  );
};

const createGetResourceProcedure = () => {
  return publicProcedure.input(
    z.object({ id: z.number(), language: z.string() }),
  );
};

const createGetResourceProcedureWithStrId = () => {
  return publicProcedure.input(
    z.object({ strId: z.string(), language: z.string() }),
  );
};

export const resourcesRouter = createTRPCRouter({
  // Bets
  getBets: createGetResourcesProcedure()
    .output<Parser<GetBetResponse[]>>(getBetResponseSchema.array())
    .query(({ ctx, input }) => {
      return createGetBets(ctx.dependencies)(input?.language);
    }),
  // Books
  getBooks: createGetResourcesProcedure()
    .output<Parser<GetBookResponse[]>>(getBookResponseSchema.array())
    .query(({ ctx, input }) => {
      return createGetBooks(ctx.dependencies)(input?.language);
    }),
  getBook: createGetResourceProcedure()
    .output<Parser<GetBookResponse>>(getBookResponseSchema)
    .query(({ ctx, input }) => {
      return createGetBook(ctx.dependencies)(input.id, input.language);
    }),
  // Builders
  getBuilders: createGetResourcesProcedure()
    .output<Parser<GetBuilderResponse[]>>(getBuilderResponseSchema.array())
    .query(({ ctx, input }) => {
      return createGetBuilders(ctx.dependencies)(input?.language);
    }),
  getBuilder: createGetResourceProcedure()
    .output<Parser<GetBuilderResponse>>(getBuilderResponseSchema)
    .query(({ ctx, input }) => {
      return createGetBuilder(ctx.dependencies)(input.id, input.language);
    }),
  // Conferences
  getConferences: createGetResourcesProcedure()
    .output<Parser<GetConferenceResponse[]>>(
      getConferenceResponseSchema.array(),
    )
    .query(({ ctx }) => createGetConferences(ctx.dependencies)()),
  getConference: createGetResourceProcedure()
    .output<Parser<GetConferenceResponse>>(getConferenceResponseSchema)
    .query(({ ctx, input }) => createGetConference(ctx.dependencies)(input.id)),
  // Glossary Words
  getGlossaryWords: createGetResourcesProcedure()
    .output<Parser<JoinedGlossaryWord[]>>(joinedGlossaryWordSchema.array())
    .query(({ ctx, input }) => {
      return createGetGlossaryWords(ctx.dependencies)(input?.language);
    }),
  getGlossaryWord: createGetResourceProcedureWithStrId()
    .output<Parser<JoinedGlossaryWord>>(joinedGlossaryWordSchema)
    .query(({ ctx, input }) => {
      return createGetGlossaryWord(ctx.dependencies)(
        input.strId,
        input.language,
      );
    }),
  // Podcasts
  getPodcasts: createGetResourcesProcedure()
    .output<Parser<GetPodcastResponse[]>>(getPodcastResponseSchema.array())
    .query(({ ctx, input }) => {
      return createGetPodcasts(ctx.dependencies)(input?.language);
    }),
  getPodcast: createGetResourceProcedure()
    .output<Parser<GetPodcastResponse>>(getPodcastResponseSchema)
    .query(({ ctx, input }) => {
      return createGetPodcast(ctx.dependencies)(input.id, input.language);
    }),
});
