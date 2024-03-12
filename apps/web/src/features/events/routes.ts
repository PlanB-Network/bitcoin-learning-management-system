import { Route } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { Events } from './pages/events.tsx';

const eventsRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'events',
});

export const eventsIndexRoute = new Route({
  getParentRoute: () => eventsRootRoute,
  path: '/',
  component: Events,
});

export const eventsRoutes = eventsRootRoute.addChildren([eventsIndexRoute]);
