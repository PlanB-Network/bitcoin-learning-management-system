import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router';
import type { i18n } from 'i18next';

import { LANGUAGES } from '../utils/i18n.ts';

// eslint-disable-next-line react-refresh/only-export-components
const Root = () => {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
};

// Create a root route
export const rootRoute = createRootRouteWithContext<{
  i18n?: i18n;
}>()({
  beforeLoad: async ({ context, location, navigate, preload }) => {
    const { i18n } = context as { i18n: i18n };

    if (!i18n || preload) {
      return;
    }

    const pathname = location.pathname;
    const maskedPathname = location.maskedLocation?.pathname;

    const pathLanguage = pathname.split('/')[1];
    const maskedPathLanguage = maskedPathname?.split('/')[1];

    if (pathLanguage && LANGUAGES.includes(pathLanguage)) {
      if (i18n.language !== pathLanguage && !maskedPathLanguage) {
        await i18n.changeLanguage(pathLanguage);
      }

      const actualPathname = pathname.replace(`/${pathLanguage}`, '');
      const maskedPathname = pathname.replace(
        `/${pathLanguage}`,
        `/${i18n.language}`,
      );

      if (location.maskedLocation?.pathname !== maskedPathname) {
        throw redirect({
          to: actualPathname === '' ? '/' : actualPathname,
          mask: {
            to: maskedPathname === '' ? '/' : maskedPathname,
          },
          search: location.search,
          replace: true,
        });
      }
    } else if (
      !maskedPathLanguage ||
      (maskedPathLanguage && !LANGUAGES.includes(maskedPathLanguage))
    ) {
      await navigate({
        to: `/${i18n.language}${pathname}`,
        search: location.search,
        replace: true,
      });
    }
  },
  component: Root,
});
