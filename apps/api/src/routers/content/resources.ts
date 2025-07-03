import {
  joinedBetSchema,
  joinedBookSchema,
  joinedConferenceSchema,
  joinedEventSchema,
  joinedGlossaryWordSchema,
  joinedMovieSchema,
  joinedNewsletterSchema,
  joinedPodcastSchema,
  joinedProjectSchema,
  joinedYoutubeChannelSchema,
} from '@blms/schemas';
import {
  createGetBets,
  createGetBook,
  createGetBooks,
  createGetConference,
  createGetConferences,
  createGetGlossaryWord,
  createGetGlossaryWords,
  createGetLecture,
  createGetLectures,
  createGetMovie,
  createGetMovies,
  createGetNewsletter,
  createGetNewsletters,
  createGetPodcast,
  createGetPodcasts,
  createGetProject,
  createGetProjects,
  createGetYoutubeChannel,
  createGetYoutubeChannels,
  createSearch,
} from '@blms/service-content';
import type {
  JoinedBet,
  JoinedBook,
  JoinedConference,
  JoinedEvent,
  JoinedGlossaryWord,
  JoinedMovie,
  JoinedNewsletter,
  JoinedPodcast,
  JoinedProject,
  JoinedYoutubeChannel,
} from '@blms/types';
import { z } from 'zod';

import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const createGetResourcesProcedure = () => {
  return publicProcedure.input(
    z.object({ language: z.string().optional() }).optional(),
  );
};

const createGetResourceProcedure = () => {
  return publicProcedure.input(
    z.object({ id: z.string(), language: z.string() }),
  );
};

const createGetResourceProcedureWithStrId = () => {
  return publicProcedure.input(
    z.object({ language: z.string(), strId: z.string() }),
  );
};

export const resourcesRouter = createTRPCRouter({
  // Bets
  getBets: createGetResourcesProcedure()
    .output<Parser<JoinedBet[]>>(joinedBetSchema.array())
    .query(({ ctx, input }) => {
      return createGetBets(ctx.dependencies)(input?.language);
    }),
  getBook: createGetResourceProcedure()
    .output<Parser<JoinedBook>>(joinedBookSchema)
    .query(({ ctx, input }) => {
      return createGetBook(ctx.dependencies)(input.id, input.language);
    }),
  // Books
  getBooks: createGetResourcesProcedure()
    .output<Parser<JoinedBook[]>>(joinedBookSchema.array())
    .query(({ ctx, input }) => {
      return createGetBooks(ctx.dependencies)(input?.language);
    }),
  getConference: createGetResourceProcedure()
    .output<Parser<JoinedConference>>(joinedConferenceSchema)
    .query(({ ctx, input }) => createGetConference(ctx.dependencies)(input.id)),
  // Conferences
  getConferences: createGetResourcesProcedure()
    .input(z.object({ projectId: z.string().optional() }).optional())
    .output<Parser<JoinedConference[]>>(joinedConferenceSchema.array())
    .query(({ ctx, input }) =>
      createGetConferences(ctx.dependencies)(input?.projectId),
    ),
  getGlossaryWord: createGetResourceProcedureWithStrId()
    .output<Parser<JoinedGlossaryWord>>(joinedGlossaryWordSchema)
    .query(({ ctx, input }) => {
      return createGetGlossaryWord(ctx.dependencies)(
        input.strId,
        input.language,
      );
    }),
  // Glossary Words
  getGlossaryWords: createGetResourcesProcedure()
    .output<Parser<JoinedGlossaryWord[]>>(joinedGlossaryWordSchema.array())
    .query(({ ctx, input }) => {
      return createGetGlossaryWords(ctx.dependencies)(input?.language);
    }),
  getLecture: createGetResourceProcedureWithStrId()
    .output<Parser<JoinedEvent>>(joinedEventSchema)
    .query(({ ctx, input }) => {
      return createGetLecture(ctx.dependencies)(
        input.strId,
        ctx.user.uid || '',
      );
    }),
  // Lectures
  getLectures: createGetResourcesProcedure()
    .input(z.object({ professorId: z.string().optional() }).optional())
    .output<Parser<JoinedEvent[]>>(joinedEventSchema.array())
    .query(({ ctx, input }) => {
      return createGetLectures(ctx.dependencies)(input?.professorId);
    }),
  getMovie: createGetResourceProcedure()
    .output<Parser<JoinedMovie>>(joinedMovieSchema)
    .query(({ ctx, input }) => {
      return createGetMovie(ctx.dependencies)(input.id);
    }),

  // Movies
  getMovies: createGetResourcesProcedure()
    .output<Parser<JoinedMovie[]>>(joinedMovieSchema.array())
    .query(({ ctx }) => {
      return createGetMovies(ctx.dependencies)();
    }),
  getNewsletter: createGetResourceProcedure()
    .output<Parser<JoinedNewsletter>>(joinedNewsletterSchema)
    .query(({ ctx, input }) => {
      return createGetNewsletter(ctx.dependencies)(input.id);
    }),

  //Newsletters
  getNewsletters: createGetResourcesProcedure()
    .input(z.object({ projectId: z.string().optional() }).optional())
    .output<Parser<JoinedNewsletter[]>>(joinedNewsletterSchema.array())
    .query(({ ctx, input }) => {
      return createGetNewsletters(ctx.dependencies)(input?.projectId);
    }),
  getPodcast: createGetResourceProcedure()
    .output<Parser<JoinedPodcast>>(joinedPodcastSchema)
    .query(({ ctx, input }) => {
      return createGetPodcast(ctx.dependencies)(input.id);
    }),
  // Podcasts
  getPodcasts: createGetResourcesProcedure()
    .output<Parser<JoinedPodcast[]>>(joinedPodcastSchema.array())
    .query(({ ctx }) => {
      return createGetPodcasts(ctx.dependencies)();
    }),
  getProject: createGetResourceProcedure()
    .output<Parser<JoinedProject>>(joinedProjectSchema)
    .query(({ ctx, input }) => {
      return createGetProject(ctx.dependencies)(input.id, input.language);
    }),
  // Projects
  getProjects: createGetResourcesProcedure()
    .output<Parser<JoinedProject[]>>(joinedProjectSchema.array())
    .query(({ ctx, input }) => {
      return createGetProjects(ctx.dependencies)(input?.language);
    }),
  getYoutubeChannel: createGetResourceProcedure()
    .output<Parser<JoinedYoutubeChannel>>(joinedYoutubeChannelSchema)
    .query(({ ctx, input }) => {
      return createGetYoutubeChannel(ctx.dependencies)(input.id);
    }),

  // Youtube Channels
  getYoutubeChannels: createGetResourcesProcedure()
    .input(z.object({ projectId: z.string().optional() }).optional())
    .output<Parser<JoinedYoutubeChannel[]>>(joinedYoutubeChannelSchema.array())
    .query(({ ctx, input }) => {
      return createGetYoutubeChannels(ctx.dependencies)(input?.projectId);
    }),
  // Search
  search: publicProcedure
    .input(
      z.object({
        categories: z.string().array().optional(),
        cursor: z.number().optional().default(1),
        language: z.string(),
        limit: z.number().optional().default(10),
        query: z.string(),
        surroundingWords: z.number().optional().default(20),
      }),
    )
    .query(({ ctx, input }) => {
      return createSearch(ctx.dependencies)(input);
    }),
});
