/* Content Types */
export const supportedContentTypes = [
  'courses',
  'events',
  'resources',
  'tutorials',
  'quizzes/questions',
  'professors',
] as const;

export type ContentType = (typeof supportedContentTypes)[number];

/* Languages */

// TODO: import all languages list
export const supportedLanguages = ['en', 'fr', 'es'] as const;
export type Language = (typeof supportedLanguages)[number];
