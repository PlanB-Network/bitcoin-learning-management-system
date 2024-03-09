import { Router } from '@tanstack/react-router';

import { coursesRoutes } from '../features/courses/index.ts';
import { dashboardRoutes } from '../features/dashboard/index.ts';
import { miscRoutes } from '../features/misc/index.ts';
import { resourcesRoutes } from '../features/resources/index.ts';
import { tutorialsRoutes } from '../features/tutorials/index.ts';

import { rootRoute } from './root.tsx';

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
