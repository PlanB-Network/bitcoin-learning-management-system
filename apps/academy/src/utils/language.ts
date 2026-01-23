import { normalizeString } from './string.js';

export const getSystemLanguage = (): string => {
  if (typeof navigator === 'undefined' || !navigator.language) {
    return '';
  }

  return normalizeString(navigator.language);
};

export const isLanguageMatch = (
  courseLanguage: string,
  appLanguage: string,
  systemLanguage: string,
  additionalLangs: string[] = [],
): boolean => {
  const normCourseLang = normalizeString(courseLanguage);

  const normAppFull = normalizeString(appLanguage);
  const normAppBase = normalizeString(appLanguage.split('-')[0]);

  const normSystemFull = normalizeString(systemLanguage);
  const normSystemBase = normalizeString(systemLanguage.split('-')[0]);

  return (
    normCourseLang === normAppFull ||
    normCourseLang === normAppBase ||
    normCourseLang === normSystemFull ||
    normCourseLang === normSystemBase ||
    additionalLangs.some((lang) => normCourseLang === normalizeString(lang))
  );
};
