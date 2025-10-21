import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { routeTree } from './routeTree.gen.js';
import { TRPCProvider, trpcClient } from './utils/trpc.ts';

import './utils/i18n';

import '../../../packages/ui/src/styles/global.css';
import { HelmetProvider } from 'react-helmet-async';
import PageMeta from './components/Head/PageMeta/index.tsx';
import { NotFound } from './components/not-found.tsx';
import { SITE_NAME } from './utils/meta.ts';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: NotFound,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

const queryClient = getQueryClient();

// Render the app
const root = ReactDOM.createRoot(
  document.querySelector('#root') as HTMLElement,
);

root.render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <RouterProvider router={router} />
          <PageMeta
            title={SITE_NAME}
            description="Let's build together the Bitcoin educational layer"
            type="website"
            imageSrc="/share-default.png"
          />
        </TRPCProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
