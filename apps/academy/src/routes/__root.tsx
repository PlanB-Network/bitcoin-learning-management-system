import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { i18n } from 'i18next';
import { ErrorBoundary } from '#src/components/error-boundary.tsx';
import { LANGUAGES } from '#src/utils/i18n.ts';
import PlanBLogo from '../assets/logo/pba-horizontal-black.svg?react';
import { router } from './-router.tsx';

// Create a root route
export const Route = createRootRouteWithContext<{
  i18n?: i18n;
}>()({
  component: () => (
    <>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>

      {process.env.NODE_ENV === 'development' ? (
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      ) : null}
    </>
  ),
  errorComponent: function ErrorComp({ error }) {
    console.log('An error occurred:', error);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <a href="/">
          <PlanBLogo className="h-auto w-40 mb-6" />
        </a>
        <h2 className="text-3xl font-bold">Something went wrong.</h2>
        <p className="my-4 text-center">
          We've updated the application. Please refresh the page to continue, or
          go to home page.
        </p>
        <a href={'/'}>
          <button
            type="button"
            className="rounded bg-orange-500 px-4 py-2 text-white"
          >
            Home page
          </button>
        </a>
      </div>
    );
  },
  // Add language for navigation inside the app
  onStay: async ({ context, preload }) => {
    const { i18n } = context;
    if (!i18n || preload) {
      return;
    }
    const pathLanguage = location.pathname.split('/')[1];

    const newUrl = `/${i18n.language}${location.pathname}${location.hash}${location.search}`;

    // If no language in the path, redirect to language
    if (!pathLanguage) {
      console.log('-- Redirect(1) to ', newUrl);
      router.navigate({
        replace: true,
        to: newUrl,
      });
    }

    // If language in the path is missing or wrong
    if (pathLanguage && !LANGUAGES.includes(pathLanguage)) {
      console.log('-- Redirect(2) to ', newUrl);
      router.navigate({
        replace: true,
        to: newUrl,
      });
    }
  },
});
