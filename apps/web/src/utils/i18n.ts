import * as i18n from 'i18next';
import Detector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import type { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { build } from './cache.ts';

export const LANGUAGES = [
  'cs',
  'de',
  'en',
  'es',
  'et',
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
  'sw',
  'vi',
  'zh-Hans',
  'zh-Hant',
];

export const LANGUAGES_MAP: { [key: string]: string } = {
  cs: 'Čeština',
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  et: 'Eesti keel',
  fi: 'Suomi',
  fr: 'Français',
  hi: 'हिंदी',
  id: 'Bahasa indonesia',
  it: 'Italiano',
  ja: '日本語',
  nbno: 'Norsk bokmål',
  pl: 'Polski',
  pt: 'Português',
  ru: 'Русский',
  srlatn: 'Srpski',
  sw: 'Kiswahili',
  vi: 'Tiếng Việt',
  zhhans: '简体中文',
  zhhant: '繁體',
};

export const getLanguageName = (language: string) =>
  LANGUAGES_MAP[language.replace('-', '').toLowerCase()] ?? language;

void i18n
  .use(Detector)
  .use(Backend)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    load: 'all',
    backend: {
      loadPath: `/locales/{{lng}}.json${build ? `?c=${build}` : ''}`,
      requestOptions: {
        cache: 'no-store',
      },
    },
    debug: false,
    fallbackLng: 'en',
    returnNull: false,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
