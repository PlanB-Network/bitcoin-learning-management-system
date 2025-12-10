export const supportedCategories = [
  'bet',
  'books',
  'channels',
  'conferences',
  'glossary',
  'movies',
  'newsletters',
  'papers',
  'podcasts',
  'projects',
] as const;

export type ResourceCategory = (typeof supportedCategories)[number];

type AssertSupportedCategory = (
  path: string,
) => asserts path is ResourceCategory;

export const assertSupportedCategoryPath: AssertSupportedCategory = (path) => {
  if (!supportedCategories.includes(path as ResourceCategory)) {
    throw new Error(`Invalid resource category path: ${path}`);
  }
};
