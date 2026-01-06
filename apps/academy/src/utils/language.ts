import { normalizeString } from './string.js';

export const getSystemLanguage = (): string => {
  if (typeof navigator === 'undefined' || !navigator.language) {
    return '';
  }

  return normalizeString(navigator.language.split('-')[0]);
};

export const isLanguageMatch = (
  courseLanguage: string,
  appLanguage: string,
  systemLanguage: string,
  additionalLangs: string[] = [],
): boolean => {
  const normCourseLang = normalizeString(courseLanguage);
  const normAppLang = normalizeString(appLanguage.split('-')[0]);
  const normSystemLang = normalizeString(systemLanguage);

  return (
    normCourseLang === normAppLang ||
    normCourseLang === normSystemLang ||
    additionalLangs.some((lang) => normCourseLang === normalizeString(lang))
  );
};
