import { z } from 'zod';

import {
  joinedBetSchema,
  joinedBookSchema,
  joinedBuilderSchema,
  joinedConferenceSchema,
  joinedGlossaryWordSchema,
  joinedNewsletterSchema,
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
  JoinedBet,
  JoinedBook,
  JoinedBuilder,
  JoinedConference,
  JoinedGlossaryWord,
  JoinedNewsletter,
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
    .output<Parser<JoinedNewsletter[]>>(joinedNewsletterSchema.array())
    .query(({ ctx }) => {
      return createGetNewsletters(ctx.dependencies)();
    }),
  getNewsletter: createGetResourceProcedure()
    .output<Parser<JoinedNewsletter>>(joinedNewsletterSchema)
    .query(({ ctx, input }) => {
      return createGetNewsletter(ctx.dependencies)(input.id, input.language);
    }),
  // Podcasts
  getPodcasts: createGetResourcesProcedure()
    .output<Parser<JoinedPodcast[]>>(joinedPodcastSchema.array())
    .query(({ ctx }) => {
      return createGetPodcasts(ctx.dependencies)();
    }),
  getPodcast: createGetResourceProcedure()
    .output<Parser<JoinedPodcast>>(joinedPodcastSchema)
    .query(({ ctx, input }) => {
      return createGetPodcast(ctx.dependencies)(input.id);
    }),
});
