import * as i18n from 'i18next';
import Detector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import type { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

export const LANGUAGES = ['fr', 'en', 'es', 'de', 'it', 'pt'];

export const LANGUAGES_MAP: { [key: string]: string } = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
};

void i18n
  .use(Detector)
  .use(Backend)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    load: 'languageOnly',
    backend: {
      loadPath: '/locales/{{lng}}.json',
      requestOptions: {
        cache: 'no-store',
      },
    },
    debug: false,
    fallbackLng: 'en',
    returnNull: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
