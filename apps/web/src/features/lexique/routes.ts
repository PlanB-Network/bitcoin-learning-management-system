import { Route } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root';

import { Lexique } from './pages/explorer';

const lexiqueRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'lexique',
});

export const lexiqueIndexRoute = new Route({
  getParentRoute: () => lexiqueRootRoute,
  path: '/',
  component: Lexique,
});

export const lexiqueRoutes = lexiqueRootRoute.addChildren([lexiqueIndexRoute]);
