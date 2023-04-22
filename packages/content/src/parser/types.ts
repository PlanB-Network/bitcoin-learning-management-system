import { ChangedAsset, ChangedFile } from '@sovereign-academy/types';

import { ChangedContent } from '../types';

import { supportedLanguages, supportedTypes } from './utils';

export * from '../types';
export type ResourceType = (typeof supportedTypes)[number];
export type Language = (typeof supportedLanguages)[number];
export type Tag = string;

export interface ChangedResource extends ChangedContent {
  type: ResourceType;
  files: (ChangedFile & { language: Language })[];
  assets: ChangedAsset[];
}

export interface Resource {
  type: ResourceType;
  original: Language;
  tags: Tag[];
}

interface BaseResource {
  contributors?: string[];
}

export interface Book extends BaseResource {
  title: string;
  author: string;
  description: string;
  publication_date: string;
  cover: string;
}

export interface Podcast extends BaseResource {
  name: string;
  description: string;
  platform_url: string;
}

export interface Article extends BaseResource {
  title: string;
  author: string;
  description: string;
  publication_date: string;
  article_url: string;
}
