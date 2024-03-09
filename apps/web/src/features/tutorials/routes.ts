import { Route, lazyRouteComponent } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { TutorialCategory } from './pages/category.tsx';
import { TutorialExplorer } from './pages/explorer.tsx';

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
  path: '/$category/$name',
  component: lazyRouteComponent(
    () => import('./pages/details.tsx'),
    'TutorialDetails',
  ),
});

export const tutorialsRoutes = tutorialsRootRoute.addChildren([
  tutorialsIndexRoute,
  tutorialCategoryRoute,
  tutorialDetailsRoute,
]);
