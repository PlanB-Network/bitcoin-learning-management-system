/* Content Types */
export const supportedContentTypes = [
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
  id: 'id',
  en: 'en',
  fi: 'fi',
  et: 'et',
  ru: 'ru',
  vi: 'vi',
  pt: 'po',
  ja: 'ja',
  cs: 'cs',
  'zh-hans': 'zh',
  'nb-no': 'nn',
  it: 'it',
  es: 'es',
  de: 'de',
  fr: 'fr',
} as const;

export type Language = keyof typeof ISO_639_LANGUAGES;
