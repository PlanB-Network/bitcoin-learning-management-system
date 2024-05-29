import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import {
  type PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import PageMeta from '#src/components/Head/PageMeta/index.js';
import { SITE_NAME } from '#src/utils/meta.js';

import { useTrpc } from '../hooks/index.ts';
import { router } from '../routes/index.tsx';
import { LANGUAGES } from '../utils/i18n.ts';
import { trpc } from '../utils/trpc.ts';

import { UserProvider } from './user.tsx';

export const AppProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();

  const { trpcQueryClient, trpcClient } = useTrpc();
  const [queryClient] = useState(() => new QueryClient());

  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Temporary fix: the default language can be en-GB (or equivalent), until it is properly set with the selector
  // and these aren't supported. Fallback to 'en' in that case for now.
  useLayoutEffect(() => {
    if (i18n.language.includes('-')) {
      i18n.changeLanguage('en');
      setCurrentLanguage('en');
    }
  }, [i18n]);

  useEffect(() => {
    if (
      i18n.language !== currentLanguage &&
      LANGUAGES.includes(i18n.language)
    ) {
      const previousLanguage = currentLanguage;
      const newLanguage = i18n.language;

      setCurrentLanguage(newLanguage);

      router.update({
        basepath: newLanguage,
        context: router.options.context,
      });

      router.navigate({
        // TODO: fix this
        to: window.location.pathname.replace(`/${previousLanguage}`, '') as '/',
      });

      router.load();
    }
  }, [currentLanguage, i18n.language, setCurrentLanguage]);

  return (
    <HelmetProvider>
      <trpc.Provider
        client={trpcClient}
        // @ts-expect-error TODO: fix this, open issue, idk
        queryClient={queryClient}
      >
        <QueryClientProvider client={trpcQueryClient}>
          <UserProvider>
            <RouterProvider
              router={router}
              context={{ i18n }}
              basepath={currentLanguage}
            />
            <PageMeta
              title={SITE_NAME}
              description="Let's build together the Bitcoin educational layer"
              type="website"
              imageSrc="/share-default.jpg"
            />
            {children}
          </UserProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </HelmetProvider>
  );
};
