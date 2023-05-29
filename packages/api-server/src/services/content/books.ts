import { computeAssetRawUrl } from '@sovereign-academy/content';
import { firstRow, getBookQuery } from '@sovereign-academy/database';
import { JoinedBook } from '@sovereign-academy/types';

import { Dependencies } from '../../dependencies';

export const createGetBooks =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const books = await postgres<JoinedBook[]>`
      SELECT 
        r.id, r.path, bl.language, b.level, bl.title, b.author, bl.translator, 
        bl.description, bl.publisher, bl.publication_year, bl.cover, bl.summary_text, 
        bl.summary_contributor_id, bl.shop_url, bl.download_url, b.website_url,
        bl.original, r.last_updated, r.last_commit, ARRAY_AGG(t.name) AS tags
      FROM content.books b
      JOIN content.resources r ON r.id = b.resource_id
      JOIN content.books_localized bl ON bl.book_id = b.resource_id
      LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
      LEFT JOIN content.tags t ON t.id = rt.tag_id
      ${language ? postgres`WHERE bl.language = ${language}` : postgres``}
      GROUP BY r.id, bl.language, b.level, bl.title, b.author, bl.translator, 
      bl.description, bl.publisher, bl.publication_year, bl.cover, bl.summary_text, 
      bl.summary_contributor_id, bl.shop_url, bl.download_url, b.website_url,
      bl.original
    `;

    return books.map((book) => ({
      ...book,
      cover: book.cover
        ? computeAssetRawUrl(
            'https://github.com/DecouvreBitcoin/sovereign-university-data',
            book.last_commit,
            book.path,
            book.cover
          )
        : undefined,
    }));
  };

export const createGetBook =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const book = await postgres.exec(getBookQuery(id, language)).then(firstRow);

    if (book) {
      return {
        ...book,
        cover: book.cover
          ? computeAssetRawUrl(
              'https://github.com/DecouvreBitcoin/sovereign-university-data',
              book.last_commit,
              book.path,
              book.cover
            )
          : undefined,
      };
    }

    return;
  };
