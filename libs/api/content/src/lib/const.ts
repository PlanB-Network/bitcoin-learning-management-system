/* Content Types */
export const supportedContentTypes = [
  'courses',
  'resources',
  'tutorials',
  'quizzes/questions',
] as const;

export type ContentType = (typeof supportedContentTypes)[number];

/* Languages */

// TODO: import all languages list
export const supportedLanguages = ['en', 'fr', 'es'] as const;
export type Language = (typeof supportedLanguages)[number];
