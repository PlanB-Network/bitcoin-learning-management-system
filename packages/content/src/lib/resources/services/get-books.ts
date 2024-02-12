import { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getBooksQuery } from '../queries/index.js';

export const createGetBooks =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const books = await postgres.exec(getBooksQuery(language));

    return books.map((book) => ({
      ...book,
      cover: book.cover
        ? computeAssetCdnUrl(
            process.env['CDN_URL'] || 'http://localhost:8080',
            book.last_commit,
            book.path,
            book.cover,
          )
        : undefined,
    }));
  };
