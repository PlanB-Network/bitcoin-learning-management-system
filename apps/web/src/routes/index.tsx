import { Router } from '@tanstack/react-router';

import { coursesRoutes } from '../features/courses';
import { dashboardRoutes } from '../features/dashboard';
import { miscRoutes } from '../features/misc/routes';
import { resourcesRoutes } from '../features/resources';
import { tutorialsRoutes } from '../features/tutorials';

import { rootRoute } from './root';

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
