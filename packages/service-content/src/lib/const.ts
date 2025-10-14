/* Content Types */
export const supportedContentTypes = [
  'assignments',
  'bcert/editions',
  'courses',
  'events',
  'professors',
  'quizzes/questions',
  'resources',
  'tutorials',
  'blogposts',
  'legals',
  'labs',
] as const;

export type ContentType = (typeof supportedContentTypes)[number];

/* Languages */

// https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
// https://typesense.org/docs/guide/locale.html#commonly-used-languages
export const ISO_639_LANGUAGES = {
  cs: 'cs',
  de: 'de',
  en: 'en',
  es: 'es',
  et: 'et',
  fa: 'fa',
  fi: 'fi',
  fr: 'fr',
  id: 'id',
  it: 'it',
  ja: 'ja',
  ko: 'ko',
  'nb-no': 'nn',
  nl: 'nl',
  pt: 'po',
  pl: 'pl',
  rn: 'rn',
  ru: 'ru',
  'sr-Latn': 'sr',
  sv: 'sv',
  tr: 'tr',
  vi: 'vi',
  zhhans: 'zh-hans',
} as const;

export type Language = keyof typeof ISO_639_LANGUAGES;
