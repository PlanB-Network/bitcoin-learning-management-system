import { createRouter } from '@tanstack/react-router';

import { coursesRoutes } from '../features/courses/index.ts';
import { dashboardRoutes } from '../features/dashboard/index.ts';
import { eventsRoutes } from '../features/events/routes.ts';
import { miscRoutes } from '../features/misc/index.ts';
import { resourcesRoutes } from '../features/resources/index.ts';
import { tutorialsRoutes } from '../features/tutorials/index.ts';

import { rootRoute } from './root.tsx';

const routeTree = rootRoute.addChildren([
  coursesRoutes,
  eventsRoutes,
  dashboardRoutes,
  resourcesRoutes,
  tutorialsRoutes,
  ...miscRoutes,
]);

export const router = createRouter({
  routeTree,
  context: {
    i18n: undefined,
  },
  unmaskOnReload: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
