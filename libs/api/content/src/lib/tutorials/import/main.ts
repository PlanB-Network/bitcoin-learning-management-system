import { TransactionSql, firstRow } from '@sovereign-university/database';
import {
  ChangedFile,
  ModifiedFile,
  RenamedFile,
  Tutorial,
} from '@sovereign-university/types';

import { yamlToObject } from '../../utils';

import { ChangedTutorial, parseDetailsFromPath } from '.';

interface TutorialMain {
  level: string;
  category?: string;
  builder?: string;
  credits?:
    | {
        professor: string;
        link: string;
      }
    | {
        name: string;
        link: string;
        tips?: {
          lightning_address?: string;
          lnurl_pay?: string;
          paynym?: string;
          silent_payment?: string;
          url?: string;
        };
      };
  tags?: string[];
}

export const createProcessMainFile =
  (transaction: TransactionSql) =>
  async (tutorial: ChangedTutorial, file?: ChangedFile) => {
    if (!file) return;

    if (file.kind === 'removed') {
      // If tutorial file was removed, delete the main tutorial and all its translations (with cascade)

      await transaction`
        DELETE FROM content.tutorials WHERE path = ${tutorial.path} 
      `;

      return;
    }

    if (file.kind === 'renamed') {
      // If tutorial file was moved, update the path

      const { path: previousPath } = parseDetailsFromPath(file.previousPath);

      await transaction`
        UPDATE content.tutorials
        SET path = ${tutorial.path}
        WHERE path = ${previousPath}
      `;
    }

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
      // If new or updated tutorial file, insert or update tutorial

      // Only get the tags from the main tutorial file
      const parsedTutorial = yamlToObject<TutorialMain>(file.data);

      const lastUpdated = tutorial.files
        .filter(
          (file): file is ModifiedFile | RenamedFile => file.kind !== 'removed',
        )
        .sort((a, b) => b.time - a.time)[0];

      const result = await transaction<Tutorial[]>`
        INSERT INTO content.tutorials (path, name, category, subcategory, level, builder, last_updated, last_commit, last_sync)
        VALUES (
          ${tutorial.path},
          ${tutorial.name},
          ${tutorial.category},
          ${parsedTutorial.category}, 
          ${parsedTutorial.level},
          ${parsedTutorial.builder},
          ${lastUpdated.time}, 
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (path) DO UPDATE SET
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          level = EXCLUDED.level,
          builder = EXCLUDED.builder,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING *
      `.then(firstRow);

      if (!result) {
        throw new Error('Could not insert tutorial');
      }

      if (parsedTutorial.credits) {
        if ('professor' in parsedTutorial.credits) {
          await transaction`
            INSERT INTO content.contributors (id)
            VALUES (${parsedTutorial.credits.professor})
            ON CONFLICT DO NOTHING
          `;

          await transaction`
            INSERT INTO content.tutorial_credits (tutorial_id, contributor_id, link)
            VALUES (${result.id}, ${parsedTutorial.credits.professor}, ${parsedTutorial.credits.link})
            ON CONFLICT (tutorial_id) DO UPDATE SET
              contributor_id = EXCLUDED.contributor_id,
              link = EXCLUDED.link,
              name = NULL,
              lightning_address = NULL,
              lnurl_pay = NULL,
              paynym = NULL,
              silent_payment = NULL,
              tips_url = NULL
          `;
        } else {
          await transaction`
            INSERT INTO content.tutorial_credits (
              tutorial_id, name, link, lightning_address, 
              lnurl_pay, paynym, silent_payment, tips_url
            ) VALUES (
              ${result.id},
              ${parsedTutorial.credits.name},
              ${parsedTutorial.credits.link},
              ${parsedTutorial.credits.tips?.lightning_address},
              ${parsedTutorial.credits.tips?.lnurl_pay},
              ${parsedTutorial.credits.tips?.paynym},
              ${parsedTutorial.credits.tips?.silent_payment},
              ${parsedTutorial.credits.tips?.url}
            )
            ON CONFLICT (tutorial_id) DO UPDATE SET
              contributor_id = NULL,
              name = EXCLUDED.name,
              link = EXCLUDED.link,
              lightning_address = EXCLUDED.lightning_address,
              lnurl_pay = EXCLUDED.lnurl_pay,
              paynym = EXCLUDED.paynym,
              silent_payment = EXCLUDED.silent_payment,
              tips_url = EXCLUDED.tips_url
          `;
        }
      }

      // If the resource has tags, insert them into the tags table and link them to the resource
      if (parsedTutorial.tags && parsedTutorial.tags?.length > 0) {
        await transaction`
          INSERT INTO content.tags ${transaction(
            parsedTutorial.tags.map((tag) => ({ name: tag })),
          )}
          ON CONFLICT (name) DO NOTHING
        `;

        await transaction`
          INSERT INTO content.tutorial_tags (tutorial_id, tag_id)
          SELECT
            ${result.id}, 
            id FROM content.tags WHERE name = ANY(${parsedTutorial.tags})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  };
