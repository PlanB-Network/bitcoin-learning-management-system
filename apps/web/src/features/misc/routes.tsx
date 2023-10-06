import { Route } from '@tanstack/react-router';
import { rootRoute } from '../../routes/root';
import { NotFound } from './pages/not-found';
import { UnderConstruction } from './pages/under-construction';
import { Manifesto } from './pages/manifesto';
import { SponsorsAndContributors } from './pages/sponsors-and-contributors';

const miscRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
});

// export const homeRoute = new Route({
//   getParentRoute: () => miscRootRoute,
//   path: '/',
// });

export const manifestoRoute = new Route({
  getParentRoute: () => miscRootRoute,
  path: 'manifesto',
  component: Manifesto,
});

export const notFoundRoute = new Route({
  getParentRoute: () => miscRootRoute,
  path: '/404',
  component: NotFound,
});

export const sponsorsAndContributorsRoute = new Route({
  getParentRoute: () => miscRootRoute,
  path: 'sponsors-and-contributors',
  component: SponsorsAndContributors,
});

export const underConstructionRoute = new Route({
  getParentRoute: () => miscRootRoute,
  path: '/under-construction',
  component: UnderConstruction,
});

export const miscRoutes = miscRootRoute.addChildren([
  //homeRoute,
  manifestoRoute,
  notFoundRoute,
  sponsorsAndContributorsRoute,
  underConstructionRoute,
]);
