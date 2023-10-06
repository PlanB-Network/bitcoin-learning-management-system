import { Router } from '@tanstack/react-router';

import { rootRoute } from './root';

import { coursesRoutes } from '../features/courses';
import { miscRoutes } from '../features/misc/routes';
import { tutorialsRoutes } from '../features/tutorials';

const routeTree = rootRoute.addChildren([
  coursesRoutes,
  miscRoutes,
  tutorialsRoutes,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
