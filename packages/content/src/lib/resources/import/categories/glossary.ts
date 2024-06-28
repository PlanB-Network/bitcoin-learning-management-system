import matter from 'gray-matter';

import { firstRow } from '@sovereign-university/database';
import type { Resource } from '@sovereign-university/types';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { BaseResource, ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

/** Base glossary word information, same for all translations */
interface GlossaryWordMain {
  en_word: string;
  related_words: string[];
}

interface GlossaryWordLocal extends BaseResource {
  term: string;
  definition: string;
}

export const createProcessChangedGlossaryWord = (
  dependencies: Dependencies,
  errors: string[],
) => {
  const { postgres } = dependencies;

  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const { main, files } = separateContentFiles(resource, 'word.yml');

        try {
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(glossary words) ${resource?.fullPath}: ${error}`,
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

        try {
          if (main && main.kind !== 'removed') {
            const parsed = yamlToObject<GlossaryWordMain>(main.data);

            await transaction`
          INSERT INTO content.glossary_words (resource_id, original_word, related_words)
          VALUES (
            ${id}, ${parsed.en_word}, ${parsed.related_words}
          )
          ON CONFLICT (resource_id) DO UPDATE SET
            original_word = EXCLUDED.original_word,
            related_words = EXCLUDED.related_words
        `;
          }
        } catch (error) {
          errors.push(
            `Error processing file ${main?.path} ((${resource.fullPath})): ${error}`,
          );
          return;
        }

        for (const file of files) {
          try {
            // To complete
            if (file.kind === 'removed') {
              continue;
            }

            const header = matter(file.data, {
              excerpt: false,
            });

            const data = header.data;

            console.log(file.data);
          } catch (error) {
            errors.push(
              `Error processing one file (words) ${resource.path} - ${file?.path} (${resource.fullPath}): ${error}`,
            );
          }

          //   try {
          //     const parsed = yamlToObject<GlossaryWordLocal>(file.data);

          //     await transaction`
          //   INSERT INTO content.builders_localized (builder_id, language, description)
          //   VALUES (${id}, ${file.language}, ${parsed.description.trim()})
          //   ON CONFLICT (builder_id, language) DO UPDATE SET
          //     description = EXCLUDED.description
          // `.then(firstRow);
          //   } catch (error) {
          //     errors.push(
          //       `Error processing file ${file?.path} (${resource.fullPath}): ${error}`,
          //     );
          //   }
        }
      })
      .catch(() => {
        return;
      });
  };
};
