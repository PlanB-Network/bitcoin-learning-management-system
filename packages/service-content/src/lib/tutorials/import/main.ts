import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { ChangedFile, Proofreading, Tutorial } from '@blms/types';

import type { ProofreadingEntry } from '#src/lib/types.js';

import { yamlToObject } from '../../utils.js';

import type { ChangedTutorial } from './index.js';

interface TutorialMain {
  id: string;
  level: string;
  category?: string;
  original_language: string;
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
  proofreading: ProofreadingEntry[];
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (tutorial: ChangedTutorial, file?: ChangedFile) => {
    if (!file) return;
    // Only get the tags from the main tutorial file
    const parsedTutorial = yamlToObject<TutorialMain>(file.data);

    // TODO remove this when data is fixed
    if (parsedTutorial.original_language === undefined) {
      parsedTutorial.original_language = '';
    }

    const lastUpdated = tutorial.files.sort((a, b) => b.time - a.time)[0];

    const result = await transaction<Tutorial[]>`
        INSERT INTO content.tutorials (id, path, name, category, subcategory, original_language, level, builder, last_updated, last_commit, last_sync)
        VALUES (
          ${parsedTutorial.id},
          ${tutorial.path},
          ${tutorial.name},
          ${tutorial.category},
          ${parsedTutorial.category},
          ${parsedTutorial.original_language},
          ${parsedTutorial.level},
          ${parsedTutorial.builder},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          path = EXCLUDED.path,
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          original_language = EXCLUDED.original_language,
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
            parsedTutorial.tags.map((tag) => ({ name: tag.toLowerCase() })),
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

    // If the resource has proofreads
    if (parsedTutorial.proofreading) {
      for (const p of parsedTutorial.proofreading) {
        const proofreadResult = await transaction<Proofreading[]>`
          INSERT INTO content.proofreading (tutorial_id, language, last_contribution_date, urgency, reward)
          VALUES (${result.id}, ${p.language.toLowerCase()}, ${p.last_contribution_date}, ${p.urgency}, ${p.reward})
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
  };
};
