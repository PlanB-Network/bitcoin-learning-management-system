import { LANGUAGES_MAP } from '@blms/shared';
import * as i18n from 'i18next';
import Detector from 'i18next-browser-languagedetector';
import type { HttpBackendOptions } from 'i18next-http-backend';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { build } from './cache.ts';

export const LANGUAGES = [
  'cs',
  'de',
  'en',
  'es',
  'et',
  'fa',
  'fi',
  'fr',
  'hi',
  'id',
  'it',
  'ja',
  'nb-NO',
  'pt',
  'pl',
  'ru',
  'sr-Latn',
  'sv',
  'sw',
  'vi',
  'zh-Hans',
  'zh-Hant',
];

export const LANGUAGES_WITH_NATIVE_VERTICAL_SCRIPT = [
  'ja',
  'zh-Hans',
  'zh-Hant',
];

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
