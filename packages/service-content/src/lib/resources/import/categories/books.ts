import { firstRow } from '@blms/database';
import type { Book, Proofreading, Resource } from '@blms/types';

import type { ProofreadingEntry } from '#src/lib/types.js';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { BaseResource, ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

/** Base book information, same for all translations */
interface BookMain {
  /** The level of the book (beginner, intermediate, advanced) */
  level: string;
  /** The author of the book*/
  author: string;
  /** The website URL of the book or author */
  website_url?: string;
  original_language: string;
  proofreading: ProofreadingEntry[];
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
  { postgres }: Dependencies,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main, files } = separateContentFiles(resource, 'book.yml');
        if (!main) return;

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(books) ${resource?.fullPath}: ${error}`,
          );
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

        let parsedBook: BookMain | null = null;
        try {
          parsedBook = yamlToObject<BookMain>(main.data);

          const result = await transaction<Book[]>`
              INSERT INTO content.books (resource_id, author, level, website_url, original_language)
              VALUES (${id}, ${parsedBook.author}, ${parsedBook.level}, ${parsedBook.website_url}, ${parsedBook.original_language})
              ON CONFLICT (resource_id) DO UPDATE SET
                author = EXCLUDED.author,
                level = EXCLUDED.level,
                website_url = EXCLUDED.website_url,
                original_language = EXCLUDED.original_language
              RETURNING *
            `.then(firstRow);

          // If the resource has proofreads
          if (parsedBook.proofreading) {
            for (const p of parsedBook.proofreading) {
              const proofreadResult = await transaction<Proofreading[]>`
                  INSERT INTO content.proofreading (resource_id, language, last_contribution_date, urgency, reward)
                  VALUES (${result?.resourceId}, ${p.language.toLowerCase()}, ${p.last_contribution_date}, ${p.urgency}, ${p.reward})
                  RETURNING *;
                `.then(firstRow);

              if (p.contributors_id) {
                for (const [index, contrib] of p.contributors_id.entries()) {
                  await transaction`INSERT INTO content.contributors (id) VALUES (${contrib}) ON CONFLICT DO NOTHING`;
                  await transaction`
                      INSERT INTO content.proofreading_contributor(proofreading_id, contributor_id, "order")
                      VALUES (${proofreadResult?.id},${contrib},${index})
                    `;
                }
              }
            }
          }
        } catch (error) {
          errors.push(
            `Error processing main file ${main?.path} (${resource.fullPath}): ${error}`,
          );
          return;
        }

        for (const file of files) {
          try {
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
            errors.push(
              `Error processing one file ${id} ${file?.path} (${resource.fullPath}): ${error}`,
            );
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};
