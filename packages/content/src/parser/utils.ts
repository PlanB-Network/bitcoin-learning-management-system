import yaml from 'js-yaml';

// TODO: import all languages list
export const supportedLanguages = ['en', 'fr', 'es'] as const;

// TODO: get these from the database
export const supportedTypes = ['book', 'podcast', 'article'] as const;

export const yamlToObject = <T = unknown>(data: string) => yaml.load(data) as T;

export const getContentType = (path: string) => {
  const pathElements = path.split('/');
  if (pathElements.length < 2) return 'unknown';
  return pathElements[0];
};

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const computeAssetRawUrl = (
  repositoryUrl: string,
  commit: string,
  resourcePath: string,
  assetPath: string
) => `${repositoryUrl}/raw/${commit}/${resourcePath}/assets/${assetPath}`;
