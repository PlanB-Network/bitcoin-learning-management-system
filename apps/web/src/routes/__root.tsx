import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import type { i18n } from 'i18next';
import React, { Suspense } from 'react';

import { LANGUAGES } from '../utils/i18n.ts';

// eslint-disable-next-line react-refresh/only-export-components
const Root = () => {
  const TanStackRouterDevtools =
    process.env.NODE_ENV === 'production'
      ? () => null // Render nothing in production
      : React.lazy(() =>
          // Lazy load in development
          import('@tanstack/router-devtools').then((res) => ({
            default: res.TanStackRouterDevtools,
            // For Embedded Mode
            // default: res.TanStackRouterDevtoolsPanel
          })),
        );

  return (
    <>
      <ScrollRestoration />
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
};

// Create a root route
export const Route = createRootRouteWithContext<{
  i18n?: i18n;
}>()({
  beforeLoad: async ({ context, location, preload }) => {
    const { i18n } = context;

    if (!i18n || preload) {
      return;
    }

    // Parse language as the second element of the pathname
    // (the first one is always the basepath == current language, as the redirection occurs before)
    const pathLanguage = location.pathname.split('/')[2];

    if (
      pathLanguage &&
      LANGUAGES.includes(pathLanguage) &&
      i18n.language !== pathLanguage
    ) {
      // Change i18n language if the URL language is different
      await i18n.changeLanguage(pathLanguage);
    }
  },
  component: Root,
});
