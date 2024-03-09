import { Route } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { About } from './pages/about.tsx';
import { Home } from './pages/home.tsx';
import { Manifesto } from './pages/manifesto.tsx';
import { NodeNetwork } from './pages/node-network.tsx';
import { NotFound } from './pages/not-found.tsx';
import { ProfessorDetail } from './pages/professor-detail.tsx';
import { ProfessorExplorer } from './pages/professor-explorer.tsx';
import { TermsAndConditions } from './pages/terms-and-conditions.tsx';
import { UnderConstruction } from './pages/under-construction.tsx';

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

export const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
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

export const professorExplorer = new Route({
  getParentRoute: () => rootRoute,
  path: '/professors',
  component: ProfessorExplorer,
});

export const professorDetail = new Route({
  getParentRoute: () => rootRoute,
  path: '/professor/$professorId',
  component: ProfessorDetail,
});

export const underConstructionRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/under-construction',
  component: UnderConstruction,
});

export const nodeNetworkRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/node-network',
  component: NodeNetwork,
});

export const termsAndConditionsROute = new Route({
  getParentRoute: () => rootRoute,
  path: '/terms-and-conditions',
  component: TermsAndConditions,
});

export const miscRoutes = [
  globalNotFoundRoute,
  homeRoute,
  aboutRoute,
  nodeNetworkRoute,
  manifestoRoute,
  notFoundRoute,
  professorExplorer,
  professorDetail,
  underConstructionRoute,
  termsAndConditionsROute,
];
