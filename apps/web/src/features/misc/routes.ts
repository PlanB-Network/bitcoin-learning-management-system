import { createRoute } from '@tanstack/react-router';

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

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

export const manifestoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manifesto',
  component: Manifesto,
});

export const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
});

export const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: NotFound,
});

export const globalNotFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

export const professorExplorer = createRoute({
  getParentRoute: () => rootRoute,
  path: '/professors',
  component: ProfessorExplorer,
});

export const professorDetail = createRoute({
  getParentRoute: () => rootRoute,
  path: '/professor/$professorId',
  component: ProfessorDetail,
});

export const underConstructionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/under-construction',
  component: UnderConstruction,
});

export const nodeNetworkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/node-network',
  component: NodeNetwork,
});

export const termsAndConditionsROute = createRoute({
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
