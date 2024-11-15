import { z } from 'zod';

import {
  getNewsletterResponseSchema,
  joinedBetSchema,
  joinedBookSchema,
  joinedBuilderSchema,
  joinedConferenceSchema,
  joinedGlossaryWordSchema,
  joinedPodcastSchema,
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
  createGetNewsletter,
  createGetNewsletters,
  createGetPodcast,
  createGetPodcasts,
} from '@blms/service-content';
import type {
  GetNewsletterResponse,
  JoinedBet,
  JoinedBook,
  JoinedBuilder,
  JoinedConference,
  JoinedGlossaryWord,
  JoinedPodcast,
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
    .output<Parser<JoinedBet[]>>(joinedBetSchema.array())
    .query(({ ctx, input }) => {
      return createGetBets(ctx.dependencies)(input?.language);
    }),
  // Books
  getBooks: createGetResourcesProcedure()
    .output<Parser<JoinedBook[]>>(joinedBookSchema.array())
    .query(({ ctx, input }) => {
      return createGetBooks(ctx.dependencies)(input?.language);
    }),
  getBook: createGetResourceProcedure()
    .output<Parser<JoinedBook>>(joinedBookSchema)
    .query(({ ctx, input }) => {
      return createGetBook(ctx.dependencies)(input.id, input.language);
    }),
  // Builders
  getBuilders: createGetResourcesProcedure()
    .output<Parser<JoinedBuilder[]>>(joinedBuilderSchema.array())
    .query(({ ctx, input }) => {
      return createGetBuilders(ctx.dependencies)(input?.language);
    }),
  getBuilder: createGetResourceProcedure()
    .output<Parser<JoinedBuilder>>(joinedBuilderSchema)
    .query(({ ctx, input }) => {
      return createGetBuilder(ctx.dependencies)(input.id, input.language);
    }),
  // Conferences
  getConferences: createGetResourcesProcedure()
    .output<Parser<JoinedConference[]>>(joinedConferenceSchema.array())
    .query(({ ctx }) => createGetConferences(ctx.dependencies)()),
  getConference: createGetResourceProcedure()
    .output<Parser<JoinedConference>>(joinedConferenceSchema)
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
  //Newsletters
  getNewsletters: createGetResourcesProcedure()
    .output<Parser<GetNewsletterResponse[]>>(
      getNewsletterResponseSchema.array(),
    )
    .query(({ ctx, input }) => {
      return createGetNewsletters(ctx.dependencies)(input?.language);
    }),
  getNewsletter: createGetResourceProcedure()
    .output<Parser<GetNewsletterResponse>>(getNewsletterResponseSchema)
    .query(({ ctx, input }) => {
      return createGetNewsletter(ctx.dependencies)(input.id, input.language);
    }),
  // Podcasts
  getPodcasts: createGetResourcesProcedure()
    .output<Parser<JoinedPodcast[]>>(joinedPodcastSchema.array())
    .query(({ ctx, input }) => {
      return createGetPodcasts(ctx.dependencies)(input?.language);
    }),
  getPodcast: createGetResourceProcedure()
    .output<Parser<JoinedPodcast>>(joinedPodcastSchema)
    .query(({ ctx, input }) => {
      return createGetPodcast(ctx.dependencies)(input.id, input.language);
    }),
});
