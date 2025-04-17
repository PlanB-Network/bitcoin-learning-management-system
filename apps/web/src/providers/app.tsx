import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { ToastContainer } from '@blms/ui';

import PageMeta from '#src/components/Head/PageMeta/index.js';
import { router } from '#src/routes/-router.js';
import { SITE_NAME } from '#src/utils/meta.js';

import { useTrpc } from '../hooks/index.ts';
import { LANGUAGES } from '../utils/i18n.ts';
import { trpc } from '../utils/trpc.ts';

import { AuthModalProvider } from './auth.tsx';
import { AppContextProvider } from './context.tsx';
import { ConversionRateProvider } from './conversionRateContext.tsx';
import { NotificationsProvider } from './userNotificationsContext.tsx';

interface LangContext {
  setCurrentLanguage: (lang: string) => void;
}

export const LangContext = createContext<LangContext>({
  setCurrentLanguage: () => {},
});

export const AppProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();

  const { trpcQueryClient, trpcClient } = useTrpc();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
          },
        },
      }),
  );

  const locationLanguage = ((l) =>
    l && (LANGUAGES.includes(l) ? l : undefined))(
    location.pathname.split('/')[1],
  );
  const [currentLanguage, setCurrentLanguage] = useState(locationLanguage);

  function cleanUpdateLanguage(newLanguage: string): string {
    if (LANGUAGES.includes(newLanguage)) {
      i18n.changeLanguage(newLanguage);
      return newLanguage;
    }

    for (const lan of i18n.languages) {
      if (LANGUAGES.includes(lan)) {
        i18n.changeLanguage(lan);
        return lan;
      }
    }

    i18n.changeLanguage('en');
    return 'en';
  }

  async function updateCurrentLanguage(newLanguage: string, path: string) {
    const newLanguageUpdated = cleanUpdateLanguage(newLanguage);

    if (path === '/') {
      router.navigate({
        to: `/${newLanguageUpdated}${location.hash}${location.search}`,
        replace: true,
      });
    }

    const pathLanguage = location.pathname.split('/')[1];

    if (pathLanguage && !LANGUAGES.includes(pathLanguage)) {
      router.navigate({
        to: `/${newLanguageUpdated}${location.pathname}${location.hash}${location.search}`,
        replace: true,
      });
    }

    router.load();
  }

  // useLayoutEffect(() => {
  //   setCurrentLanguage(i18n.resolvedLanguage);
  // }, [i18n]);

  // Handle language change
  useEffect(() => {
    const newLanguage = currentLanguage ? currentLanguage : i18n.language;

    const newLanguageUpdated = cleanUpdateLanguage(newLanguage);

    if (
      newLanguageUpdated &&
      (!currentLanguage || currentLanguage !== newLanguageUpdated)
    ) {
      updateCurrentLanguage(
        newLanguageUpdated,
        `${location.pathname}${location.hash}${location.search}`,
      );
    }
  }, [currentLanguage, locationLanguage]);

  // Handle browser's back() and next()
  useEffect(() => {
    const handlePopState = () => {
      const pathName = location.pathname;
      const newLanguage = pathName.split('/')[1];
      const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '');

      if (LANGUAGES.includes(newLanguage)) {
        updateCurrentLanguage(
          newLanguage,
          `${pathWithoutLang}${location.hash}${location.search}`,
        );
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentLanguage]);

  return (
    <HelmetProvider>
      <trpc.Provider
        client={trpcClient}
        // @ts-expect-error TODO: fix this, open issue, idk
        queryClient={queryClient}
      >
        <QueryClientProvider client={trpcQueryClient}>
          <LangContext.Provider value={{ setCurrentLanguage }}>
            <AppContextProvider>
              <NotificationsProvider>
                <ConversionRateProvider>
                  <AuthModalProvider>
                    <RouterProvider router={router} context={{ i18n }} />
                    <PageMeta
                      title={SITE_NAME}
                      description="Let's build together the Bitcoin educational layer"
                      type="website"
                      imageSrc="/share-default.jpg"
                    />
                    <ToastContainer autoClose={5000} />
                    {children}
                  </AuthModalProvider>
                </ConversionRateProvider>
              </NotificationsProvider>
            </AppContextProvider>
          </LangContext.Provider>
        </QueryClientProvider>
      </trpc.Provider>
    </HelmetProvider>
  );
};
