import { firstRow } from '@sovereign-university/database';
import { Resource } from '@sovereign-university/types';

import { BaseResource, ChangedResource } from '..';
import { Dependencies } from '../../../dependencies';
import { separateContentFiles, yamlToObject } from '../../../utils';
import { createProcessMainFile } from '../main';

/** Base book information, same for all translations */
interface BookMain {
  /** The level of the book (beginner, intermediate, advanced) */
  level: string;
  /** The author of the book*/
  author: string;
  /** The website URL of the book or author */
  website_url?: string;
}

interface BookLocal extends BaseResource {
  title: string;
  /** Name of the author or collective of authors of the translation */
  translator?: string;
  description: string;
  publisher?: string;
  publication_year?: number;
  summary?: {
    by?: string;
    text: string;
  };
  /** Relative path to the cover image, or URL */
  cover: string;
  /** Whether this is the original language of the book */
  original?: boolean;
  shop_url?: string;
  download_url?: string;
}

export const createProcessChangedBook = (
  dependencies: Dependencies,
  errors: string[],
) => {
  const { postgres } = dependencies;

  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main, files } = separateContentFiles(resource, 'book.yml');

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(`Error processing file ${resource?.path}: ${error}`);
          return;
        }

        const id = await transaction<Resource[]>`
          SELECT id FROM content.resources WHERE path = ${resource.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!id) {
          throw new Error(`Resource not found for path ${resource.path}`);
        }

        let parsed: BookMain | null = null;
        try {
          if (main && main.kind !== 'removed') {
            parsed = yamlToObject<BookMain>(main.data);

            await transaction`
              INSERT INTO content.books (resource_id, author, level, website_url)
              VALUES (${id}, ${parsed.author}, ${parsed.level}, ${parsed.website_url})
              ON CONFLICT (resource_id) DO UPDATE SET
                author = EXCLUDED.author,
                level = EXCLUDED.level,
                website_url = EXCLUDED.website_url
        `;
          }
        } catch (error) {
          errors.push(
            `Error processing main file ${main?.path} ${parsed?.author}: ${error}`,
          );
          return;
        }

        for (const file of files) {
          try {
            if (file.kind === 'removed') {
              // If file was deleted, delete the translation from the database

              await transaction`
                DELETE FROM content.books_localized
                WHERE book_id = ${id} AND language = ${file.language}
              `;

              continue;
            }

            const parsed = yamlToObject<BookLocal>(file.data);

            await transaction`
              INSERT INTO content.books_localized (
                book_id, language, original, title, translator, description, publisher, 
                publication_year, cover, summary_text, summary_contributor_id, shop_url, 
                download_url
              )
              VALUES (
                ${id},
                ${file.language},
                ${parsed.original ?? false},
                ${parsed.title},
                ${parsed.translator},
                ${parsed.description.trim()},
                ${parsed.publisher},
                ${parsed.publication_year},
                ${parsed.cover},
                ${parsed.summary?.text.trim()},
                ${parsed.summary?.by},
                ${parsed.shop_url},
                ${parsed.download_url}
              )
              ON CONFLICT (book_id, language) DO UPDATE SET
                title = EXCLUDED.title,
                translator = EXCLUDED.translator,
                description = EXCLUDED.description,
                publisher = EXCLUDED.publisher,
                publication_year = EXCLUDED.publication_year,
                cover = EXCLUDED.cover,
                summary_text = EXCLUDED.summary_text,
                summary_contributor_id = EXCLUDED.summary_contributor_id,
                shop_url = EXCLUDED.shop_url,
                download_url = EXCLUDED.download_url
            `.then(firstRow);
          } catch (error) {
            errors.push(`Error processing one file ${file?.path}: ${error}`);
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};
