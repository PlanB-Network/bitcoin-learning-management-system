import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { TutorialCategory } from './pages/category.tsx';
import { TutorialExplorer } from './pages/explorer.tsx';

const tutorialsRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tutorials',
});

export const tutorialsIndexRoute = createRoute({
  getParentRoute: () => tutorialsRootRoute,
  path: '/',
  component: TutorialExplorer,
});

export const tutorialCategoryRoute = createRoute({
  getParentRoute: () => tutorialsRootRoute,
  path: '/$category',
  component: TutorialCategory,
});

export const tutorialDetailsRoute = createRoute({
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
