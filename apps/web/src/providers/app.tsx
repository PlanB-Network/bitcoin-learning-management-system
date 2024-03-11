import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { useTrpc } from '../hooks/index.ts';
import { router } from '../routes/index.tsx';
import { persistor, store } from '../store/index.ts';
import { trpc } from '../utils/trpc.ts';

export const AppProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();
  const { trpcQueryClient, trpcClient } = useTrpc();
  const [queryClient] = useState(() => new QueryClient());

  // Temporary fix: the default language can be en-GB (or equivalent), until it is properly set with the selector
  // and these aren't supported. Fallback to 'en' in that case for now.
  useEffect(() => {
    if (i18n.language.includes('-')) {
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <trpc.Provider
          client={trpcClient}
          // @ts-expect-error TODO: fix this, open issue, idk
          queryClient={queryClient}
        >
          <QueryClientProvider client={trpcQueryClient}>
            <RouterProvider router={router} context={{ i18n }} />
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      </PersistGate>
    </Provider>
  );
};
