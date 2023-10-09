import { Route } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root';

import { Dashboard } from './pages/dashboard';

const dashboardRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
});

export const dashboardIndexRoute = new Route({
  getParentRoute: () => dashboardRootRoute,
  path: '/',
  component: Dashboard,
});

export const dashboardRoutes = dashboardRootRoute.addChildren([
  dashboardIndexRoute,
]);
