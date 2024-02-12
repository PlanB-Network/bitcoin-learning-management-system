import type { default as Book } from '../sql/content/Books.js';
import type { default as BookLocalized } from '../sql/content/BooksLocalized.js';

import type { Resource } from './index.js';

export type { default as Book } from '../sql/content/Books.js';
export type { default as BookLocalized } from '../sql/content/BooksLocalized.js';

export type JoinedBook = Pick<
  Resource,
  'id' | 'path' | 'last_updated' | 'last_commit'
> &
  Pick<Book, 'author' | 'level' | 'website_url'> &
  Pick<
    BookLocalized,
    | 'language'
    | 'title'
    | 'translator'
    | 'description'
    | 'publisher'
    | 'publication_year'
    | 'cover'
    | 'summary_text'
    | 'summary_contributor_id'
    | 'shop_url'
    | 'download_url'
    | 'original'
  > & {
    tags: string[];
  };
