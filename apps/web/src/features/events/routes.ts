import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { EventDetails } from './pages/details.tsx';
import { Events } from './pages/events.tsx';

const eventsRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'events',
});

export const eventsIndexRoute = createRoute({
  getParentRoute: () => eventsRootRoute,
  path: '/',
  component: Events,
});

export const eventDetailsRoute = createRoute({
  getParentRoute: () => eventsRootRoute,
  path: '/$eventId',
  component: EventDetails,
});

export const eventsRoutes = eventsRootRoute.addChildren([
  eventsIndexRoute,
  eventDetailsRoute,
]);
