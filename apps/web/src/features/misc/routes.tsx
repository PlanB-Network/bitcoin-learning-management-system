import { Route } from '@tanstack/react-router';
import { rootRoute } from '../../routes/root';
import { NotFound } from './pages/not-found';
import { UnderConstruction } from './pages/under-construction';
import { Manifesto } from './pages/manifesto';
import { SponsorsAndContributors } from './pages/sponsors-and-contributors';
import { Home } from './pages/home';

export const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

export const manifestoRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/manifesto',
  component: Manifesto,
});

export const notFoundRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: NotFound,
});

export const globalNotFoundRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

export const sponsorsAndContributorsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/sponsors-and-contributors',
  component: SponsorsAndContributors,
});

export const underConstructionRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/under-construction',
  component: UnderConstruction,
});

export const miscRoutes = [
  globalNotFoundRoute,
  homeRoute,
  manifestoRoute,
  notFoundRoute,
  sponsorsAndContributorsRoute,
  underConstructionRoute,
];
