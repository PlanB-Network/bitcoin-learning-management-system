import matter from 'gray-matter';

import { firstRow } from '@blms/database';
import type { GlossaryWord, Proofreading, Resource } from '@blms/types';

import type { ProofreadingEntry } from '#src/lib/types.js';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

/** Base glossary word information, same for all translations */
interface GlossaryWordMain {
  en_word: string;
  related_words: string[];
  original_language: string;
  proofreading: ProofreadingEntry[];
}

export const createProcessChangedGlossaryWord = (
  { postgres }: Dependencies,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const { main, files } = separateContentFiles(resource, 'word.yml');
        if (!main) return;

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
          const parsedWord = yamlToObject<GlossaryWordMain>(main.data);
          // TODO remove when data fixed
          if (parsedWord.original_language === undefined) {
            parsedWord.original_language = '';
          }

          const fileName = resource.path.split('/').slice(-1);

          const result = await transaction<GlossaryWord[]>`
              INSERT INTO content.glossary_words (resource_id, original_word, file_name, related_words, original_language)
              VALUES (
                ${id}, ${parsedWord.en_word}, ${fileName}, ${parsedWord.related_words}, ${parsedWord.original_language}
              )
              ON CONFLICT (resource_id) DO UPDATE SET
                original_word = EXCLUDED.original_word,
                file_name = EXCLUDED.file_name,
                related_words = EXCLUDED.related_words,
                original_language = EXCLUDED.original_language
              RETURNING *
            `.then(firstRow);

          // If the resource has proofreads
          if (parsedWord.proofreading) {
            for (const p of parsedWord.proofreading) {
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
            `Error processing file ${main?.path} ((${resource.fullPath})): ${error}`,
          );
          return;
        }

        for (const file of files) {
          try {
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
