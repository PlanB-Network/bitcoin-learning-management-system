/* Content Types */
export const supportedContentTypes = [
  'bcert',
  'courses',
  'events',
  'professors',
  'quizzes/questions',
  'resources/conference', // Must be placed before 'resources'
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
