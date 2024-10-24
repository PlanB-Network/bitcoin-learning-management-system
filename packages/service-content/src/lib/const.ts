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
] as const;

export type ContentType = (typeof supportedContentTypes)[number];

/* Languages */

// TODO: import all languages list
export const supportedLanguages = ['en', 'fr', 'es'] as const;
export type Language = (typeof supportedLanguages)[number];
