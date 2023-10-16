import { Route } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root';

import { TutorialCategory } from './pages/category';
import { TutorialDetails } from './pages/details';
import { TutorialExplorer } from './pages/explorer';

const tutorialsRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'tutorials',
});

export const tutorialsIndexRoute = new Route({
  getParentRoute: () => tutorialsRootRoute,
  path: '/',
  component: TutorialExplorer,
});

export const tutorialCategoryRoute = new Route({
  getParentRoute: () => tutorialsRootRoute,
  path: '/$category',
  component: TutorialCategory,
});

export const tutorialDetailsRoute = new Route({
  getParentRoute: () => tutorialsRootRoute,
  path: '/$category/$tutorialId',
  component: TutorialDetails,
});

export const tutorialsRoutes = tutorialsRootRoute.addChildren([
  tutorialsIndexRoute,
  tutorialCategoryRoute,
  tutorialDetailsRoute,
]);
