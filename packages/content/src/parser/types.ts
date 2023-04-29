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

export interface FullResource {
  type: ResourceType;
  original: Language;
  level?: string;
  tags?: Tag[];
}

interface BaseResource {
  contributors?: string[];
}

export interface ParsedBook extends BaseResource {
  title: string;
  author: string;
  description: string;
  publication_date: string;
  summary?: {
    by?: string;
    text: string;
  }
  cover: string;
}

export interface ParsedPodcast extends BaseResource {
  name: string;
  description: string;
  platform_url: string;
}

export interface ParsedArticle extends BaseResource {
  title: string;
  author: string;
  description: string;
  publication_date: string;
  article_url: string;
}
