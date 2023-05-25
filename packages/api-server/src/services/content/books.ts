import { computeAssetRawUrl } from '@sovereign-academy/content';
import { Book, BookLocalized, Resource } from '@sovereign-academy/types';

import { Dependencies } from '../../dependencies';

type JoinedBook = Pick<
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
    | 'publication_date'
    | 'cover'
    | 'summary_text'
    | 'summary_contributor_id'
    | 'shop_url'
    | 'download_url'
    | 'original'
  >;

export const createGetBooks =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres<JoinedBook[]>`
      SELECT 
        r.id, r.path, bl.language, b.level, bl.title, b.author, bl.translator, 
        bl.description, bl.publisher, bl.publication_date, bl.cover, bl.summary_text, 
        bl.summary_contributor_id, bl.shop_url, bl.download_url, b.website_url,
        bl.original, r.last_updated, r.last_commit
      FROM content.books b
      JOIN content.resources r ON r.id = b.resource_id
      JOIN content.books_localized bl ON bl.book_id = b.resource_id
      ${language ? postgres`WHERE bl.language = ${language}` : postgres``}
    `;

    return result.map((row) => ({
      ...row,
      cover:
        row.cover !== undefined && row.cover !== null
          ? computeAssetRawUrl(
              'https://github.com/DecouvreBitcoin/sovereign-university-data',
              row.last_commit,
              row.path,
              row.cover
            )
          : undefined,
    }));
  };
