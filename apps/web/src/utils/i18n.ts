import * as i18n from 'i18next';
import Detector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import type { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

export const LANGUAGES = [
  'cs',
  'de',
  'en',
  'es',
  'et',
  'fi',
  'fr',
  'id',
  'it',
  'ja',
  'pt',
  'ru',
  'vi',
  'zh-hans',
];

export const LANGUAGES_MAP: { [key: string]: string } = {
  cs: 'Čeština',
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  et: 'Eesti keel',
  fi: 'Suomi',
  fr: 'Français',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  pt: 'Português',
  ru: 'Русский',
  vi: 'Tiếng Việt',
  zhhans: '简体中文',
};

void i18n
  .use(Detector)
  .use(Backend)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    load: 'currentOnly',
    backend: {
      loadPath: '/locales/{{lng}}.json',
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
