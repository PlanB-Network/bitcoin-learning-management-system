import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import PageMeta from '#src/components/Head/PageMeta/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { router } from '#src/utils/router.js';

import { useTrpc } from '../hooks/index.ts';
import { LANGUAGES } from '../utils/i18n.ts';
import { trpc } from '../utils/trpc.ts';

import { AppContextProvider } from './context.tsx';

interface LangContext {
  setCurrentLanguage: (lang: string) => void;
}

export const LangContext = createContext<LangContext>({
  setCurrentLanguage: () => {},
});

const regexp = new RegExp(`^(/(${LANGUAGES.join('|')}))*`);
const changePathLanguage = (lang: string, path: string) => {
  return path.replace(regexp, `/${lang}`);
};

export const AppProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();

  const { trpcQueryClient, trpcClient } = useTrpc();
  const [queryClient] = useState(() => new QueryClient());

  const locationLanguage = ((l) => l && (LANGUAGES.includes(l) ? l : null))(
    location.pathname.split('/')[1],
  );

  const [currentLanguage, setCurrentLanguage] = useState(
    locationLanguage ?? i18n.language,
  );

  // Temporary fix: the default language can be en-GB (or equivalent), until it is properly set with the selector
  // and these aren't supported. Fallback to 'en' in that case for now.
  useLayoutEffect(() => {
    if (i18n.language.includes('-')) {
      i18n.changeLanguage('en');
      setCurrentLanguage('en');
    }
  }, [i18n]);

  useEffect(() => {
    if (i18n.language === currentLanguage) {
      return;
    }

    i18n.changeLanguage(currentLanguage);

    router.update({
      basepath: currentLanguage,
      context: router.options.context,
    });

    router.navigate({
      to: changePathLanguage(currentLanguage, location.pathname),
    });

    router.load();
  }, [currentLanguage, i18n, i18n.language, locationLanguage]);

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
            </AppContextProvider>
          </LangContext.Provider>
        </QueryClientProvider>
      </trpc.Provider>
    </HelmetProvider>
  );
};
