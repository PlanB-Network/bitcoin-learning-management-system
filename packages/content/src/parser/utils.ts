import yaml from 'js-yaml';

// TODO: import all languages list
export const supportedLanguages = ['en', 'fr', 'es'] as const;

// TODO: get these from the database
export const supportedTypes = ['book', 'podcasts', 'articles'] as const;

export const yamlToObject = (data: string) => yaml.load(data);

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}
