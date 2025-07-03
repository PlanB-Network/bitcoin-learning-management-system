import { ToastContainer } from '@blms/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import {
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import PageMeta from '#src/components/Head/PageMeta/index.js';
import { router } from '#src/routes/-router.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { TRPCProvider, trpcClient } from '#src/utils/trpc.ts';
import { LANGUAGES } from '../utils/i18n.ts';
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
    // biome-ignore lint/style/noUselessElse: explanation
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const AppProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();

  const queryClient = getQueryClient();

  // const { trpcQueryClient, trpcClient } = useTrpc();
  // const [queryClient] = useState(
  //   () =>
  //     new QueryClient({
  //       defaultOptions: {
  //         queries: {
  //           retry: 1,
  //         },
  //       },
  //     }),
  // );

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
        replace: true,
        to: `/${newLanguageUpdated}${location.hash}${location.search}`,
      });
    }

    const pathLanguage = location.pathname.split('/')[1];

    if (pathLanguage && !LANGUAGES.includes(pathLanguage)) {
      router.navigate({
        replace: true,
        to: `/${newLanguageUpdated}${location.pathname}${location.hash}${location.search}`,
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
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
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
        </TRPCProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};
