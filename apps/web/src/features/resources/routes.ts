import { Route } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { BET } from './pages/bet.tsx';
import { Book } from './pages/book-details.tsx';
import { Books } from './pages/books.tsx';
import { Builder } from './pages/builder-details.tsx';
import { Builders } from './pages/builders.tsx';
import { Resources } from './pages/explorer.tsx';
import { Podcast } from './pages/podcast-details.tsx';
import { Podcasts } from './pages/podcasts.tsx';

const resourcesRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'resources',
});

export const resourcesIndexRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/',
  component: Resources,
});

export const booksRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/books',
  component: Books,
});

export const bookDetailsRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/book/$bookId',
  component: Book,
});

export const betRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/bet',
  component: BET,
});

export const buildersRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/builders',
  component: Builders,
});

export const builderDetailsRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/builder/$builderId',
  component: Builder,
});

export const podcastsRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/podcasts',
  component: Podcasts,
});

export const podcastDetailsRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/podcast/$podcastId',
  component: Podcast,
});

export const articlesRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/articles',
});

export const newslettersRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/newsletters',
});

export const conferencesRoute = new Route({
  getParentRoute: () => resourcesRootRoute,
  path: '/conferences',
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
  // Later
  articlesRoute,
  newslettersRoute,
  conferencesRoute,
]);
