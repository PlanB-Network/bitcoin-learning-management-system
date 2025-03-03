import type {
  DocumentSchema,
  SearchResponseHit,
} from 'typesense/lib/Typesense/Documents.js';

export interface Searchable<L = string> extends Record<string, unknown> {
  language: L;
  endDate?: number;
  premium?: boolean;
  title: string;
  body: string;
  link: string;
}

// Re-export types from typesense
export type SearchResultItem<T extends DocumentSchema = DocumentSchema> =
  SearchResponseHit<T>;

export interface SearchResult<T extends DocumentSchema = DocumentSchema> {
  results: Array<SearchResultItem<T>>;
  language: string;
  query: string;
  found: number;
  time: number;
  // Pagination
  nextCursor: number;
  remaining: number;
}
