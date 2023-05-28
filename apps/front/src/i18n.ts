import * as i18n from 'i18next';
import Detector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import type { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Detector)
  .use(Backend)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    load: 'languageOnly',
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    debug: true,
    fallbackLng: 'en',
    returnNull: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
