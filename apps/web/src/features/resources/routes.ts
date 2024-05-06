import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { BET } from './pages/bet.tsx';
import { Book } from './pages/book-details.tsx';
import { Books } from './pages/books.tsx';
import { Builder } from './pages/builder-details.tsx';
import { Builders } from './pages/builders.tsx';
import { Conference } from './pages/conference-details.tsx';
import { Conferences } from './pages/conferences.tsx';
import { Resources } from './pages/explorer.tsx';
import { Podcast } from './pages/podcast-details.tsx';
import { Podcasts } from './pages/podcasts.tsx';

const resourcesRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'resources',
});

export const resourcesIndexRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/',
  component: Resources,
});

export const booksRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/books',
  component: Books,
});

export const bookDetailsRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/book/$bookId',
  component: Book,
});

export const betRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/bet',
  component: BET,
});

export const buildersRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/builders',
  component: Builders,
});

export const builderDetailsRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/builder/$builderId',
  component: Builder,
});

export const podcastsRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/podcasts',
  component: Podcasts,
});

export const podcastDetailsRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/podcast/$podcastId',
  component: Podcast,
});

export const articlesRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/articles',
});

export const newslettersRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/newsletters',
});

export const conferencesRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/conferences',
  component: Conferences,
});

export const conferenceDetailsRoute = createRoute({
  getParentRoute: () => resourcesRootRoute,
  path: '/conference/$conferenceId',
  component: Conference,
});

export const resourcesRoutes = resourcesRootRoute.addChildren([
  resourcesIndexRoute,
  booksRoute,
  bookDetailsRoute,
  buildersRoute,
  builderDetailsRoute,
  podcastsRoute,
  betRoute,
  podcastDetailsRoute,
  conferencesRoute,
  conferenceDetailsRoute,
  // Later
  articlesRoute,
  newslettersRoute,
]);
