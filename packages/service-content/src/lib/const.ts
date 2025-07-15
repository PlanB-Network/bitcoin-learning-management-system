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
  'nb-no': 'nn',
  pt: 'po',
  pl: 'pl',
  ru: 'ru',
  'sr-Latn': 'sr',
  sv: 'sv',
  vi: 'vi',
  'zh-hans': 'zh',
} as const;

export type Language = keyof typeof ISO_639_LANGUAGES;
