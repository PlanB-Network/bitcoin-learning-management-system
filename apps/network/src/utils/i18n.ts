import { LANGUAGES_MAP } from '@blms/shared';
import * as i18n from 'i18next';
import Detector from 'i18next-browser-languagedetector';
import type { HttpBackendOptions } from 'i18next-http-backend';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { build } from './cache.ts';

export const getLanguageName = (language: string) =>
  LANGUAGES_MAP[language.replace('-', '').toLowerCase()] ?? language;

void i18n
  .use(Detector)
  .use(Backend)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    backend: {
      loadPath: `/locales/{{lng}}.json${build ? `?c=${build}` : ''}`,
      requestOptions: {
        cache: 'no-store',
      },
    },
    supportedLngs: ['en'],
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    load: 'all',
    returnEmptyString: false,
    returnNull: false,
  });

export default i18n;
