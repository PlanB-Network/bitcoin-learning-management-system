import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { i18n } from 'i18next';

import { LANGUAGES } from '#src/utils/i18n.ts';

const Root = () => {
  // Uncomment for dev tools in development mode
  // const TanStackRouterDevtools =
  //   process.env.NODE_ENV === 'production'
  //     ? () => null // Render nothing in production
  //     : React.lazy(() =>
  //         // Lazy load in development
  //         import('@tanstack/router-devtools').then((res) => ({
  //           default: res.TanStackRouterDevtools,
  //         })),
  //       );

  return (
    <>
      <Outlet />
      {/* <Suspense>
        <TanStackRouterDevtools />
      </Suspense> */}
    </>
  );
};

// Create a root route with context for i18n support
export const Route = createRootRouteWithContext<{
  i18n?: i18n;
}>()({
  component: Root,
  beforeLoad: ({ location }) => {
    const locationLang = (location.pathname || '').split('/')[1];

    // If language is there but is not supported, fallback to /en/
    if (locationLang && !LANGUAGES.includes(locationLang)) {
      throw location.pathname === '/' ? '/en/' : `/en${location.pathname}`;
    }

    // If no language is there, fallback to /en/
    if (!locationLang) {
      throw '/en/';
    }
  },
  errorComponent: function ErrorComp({ error }) {
    return (
      <div className="flex flex-col p-4 text-white">
        <span className="mt-6">An error occurred: {error.message} </span>
        <a className="text-orange-500" href="/">
          Go back Home
        </a>
      </div>
    );
  },
});
