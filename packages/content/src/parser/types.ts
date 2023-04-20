import { supportedLanguages, supportedTypes } from './utils';

export * from '../types';
export type ResourceType = (typeof supportedTypes)[number];
export type Language = (typeof supportedLanguages)[number];
export type Tag = string;

export interface Resource {
  type: ResourceType;
  original: Language;
  tags: Tag[];
}
