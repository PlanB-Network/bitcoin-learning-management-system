import { Router } from '@tanstack/react-router';

import { rootRoute } from './root';

import { coursesRoutes } from '../features/courses';
import { miscRoutes } from '../features/misc/routes';
import { tutorialsRoutes } from '../features/tutorials';
import { dashboardRoutes } from '../features/dashboard';
import { resourcesRoutes } from '../features/resources';

const routeTree = rootRoute.addChildren([
  coursesRoutes,
  dashboardRoutes,
  resourcesRoutes,
  tutorialsRoutes,
  ...miscRoutes,
]);
export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
