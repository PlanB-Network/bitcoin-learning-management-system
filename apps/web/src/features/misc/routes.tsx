import { Route } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root';

import { Home } from './pages/home';
import { Manifesto } from './pages/manifesto';
import { NotFound } from './pages/not-found';
import { ProfessorExplorer } from './pages/professor-explorer';
import { SponsorsAndContributors } from './pages/sponsors-and-contributors';
import { UnderConstruction } from './pages/under-construction';

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

export const professorExplorer = new Route({
  getParentRoute: () => rootRoute,
  path: '/professors',
  component: ProfessorExplorer,
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
  professorExplorer,
  underConstructionRoute,
];
