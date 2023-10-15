/* Content Types */
export const supportedContentTypes = [
  'courses',
  'resources',
  'tutorials',
  'quizzes',
] as const;

export type ContentType = (typeof supportedContentTypes)[number];

type AssertSupportedContentType = (path: string) => asserts path is ContentType;

export const assertSupportedContentPath: AssertSupportedContentType = (
  path,
) => {
  if (!supportedContentTypes.includes(path as ContentType)) {
    throw new Error(`Invalid content type path: ${path}`);
  }
};

/* Languages */

// TODO: import all languages list
export const supportedLanguages = ['en', 'fr', 'es'] as const;
export type Language = (typeof supportedLanguages)[number];
