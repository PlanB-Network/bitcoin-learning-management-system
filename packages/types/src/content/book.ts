import type { default as Book } from '../sql/content/Books';
import type { default as BookLocalized } from '../sql/content/BooksLocalized';

import type { Resource } from '.';

export type { default as Book } from '../sql/content/Books';
export type { default as BookLocalized } from '../sql/content/BooksLocalized';

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
  >;
