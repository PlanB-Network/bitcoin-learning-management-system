import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { i18n } from 'i18next';

import { LANGUAGES } from '#src/utils/i18n.ts';
import PlanBLogoOrange from '../assets/logo/planb_logo_horizontal_white_orangepill_whitetext.svg?react';
import { router } from './-router.tsx';

const Root = () => {
  // const TanStackRouterDevtools =
  //   process.env.NODE_ENV === 'production'
  //     ? () => null // Render nothing in production
  //     : React.lazy(() =>
  //         // Lazy load in development
  //         import('@tanstack/router-devtools').then((res) => ({
  //           default: res.TanStackRouterDevtools,
  //           // For Embedded Mode
  //           // default: res.TanStackRouterDevtoolsPanel
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

// Create a root route
export const Route = createRootRouteWithContext<{
  i18n?: i18n;
}>()({
  // Add language for navigation inside the app
  onStay: async ({ context, preload }) => {
    const { i18n } = context;
    if (!i18n || preload) {
      return;
    }
    const pathLanguage = location.pathname.split('/')[1];

    // If no language in the path, redirect to language
    if (!pathLanguage) {
      console.log('-- Redirect(1) to ', i18n.language);
      router.navigate({
        to: `/${i18n.language}${location.pathname}${location.hash}${location.search}`,
        replace: true,
      });
    }

    // If language in the path is not available
    if (pathLanguage && !LANGUAGES.includes(pathLanguage)) {
      console.log('-- Redirect(2) to /');
      router.navigate({
        to: '/',
        replace: true,
      });
    }
  },
  component: Root,
  errorComponent: function ErrorComp({ error }) {
    return (
      <div className="flex flex-col p-4 text-white">
        <a href="/">
          <PlanBLogoOrange className="h-auto lg:w-32 xl:w-40" />
        </a>
        <span className="mt-6">An error occurred : {error.message} </span>
        <a className="text-orange-500" href="/">
          Go back Home
        </a>
      </div>
    );
  },
});
