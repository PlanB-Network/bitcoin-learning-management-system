import { Router } from '@tanstack/router';

import { rootRoute } from './root';

import { coursesRoutes } from '../features/courses';
import { miscRoutes } from './misc';

const routeTree = rootRoute.addChildren([coursesRoutes, miscRoutes]);

export const router = new Router({ routeTree });

declare module '@tanstack/router' {
  interface Register {
    router: typeof router;
  }
}
