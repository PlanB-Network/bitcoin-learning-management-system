import matter from 'gray-matter';

import { firstRow } from '@blms/database';
import type { Resource } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

/** Base glossary word information, same for all translations */
interface GlossaryWordMain {
  en_word: string;
  related_words: string[];
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

            const fileName = resource.path.split('/').slice(-1);

            await transaction`
          INSERT INTO content.glossary_words (resource_id, original_word, file_name, related_words)
          VALUES (
            ${id}, ${parsed.en_word}, ${fileName}, ${parsed.related_words}
          )
          ON CONFLICT (resource_id) DO UPDATE SET
            original_word = EXCLUDED.original_word,
            file_name = EXCLUDED.file_name,
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
            if (file.kind === 'removed') {
              continue;
            }

            const header = matter(file.data, {
              excerpt: false,
            });

            await transaction`
              INSERT INTO content.glossary_words_localized (glossary_word_id, language, term, definition)
              VALUES (${id}, ${file.language}, ${header.data['term']}, ${header.content.trim()})
              ON CONFLICT (glossary_word_id, language) DO UPDATE SET
                term = EXCLUDED.term,
                definition = EXCLUDED.definition
            `.then(firstRow);
          } catch (error) {
            errors.push(
              `Error processing one file (word) ${resource.path} - ${file?.path} (${resource.fullPath}): ${error}`,
            );
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};
