import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { ChangedFile, Proofreading, Tutorial } from '@blms/types';

import type { ProofreadingEntry } from '#src/lib/types.js';

import { yamlToObject } from '../../utils.js';

import type { ChangedTutorial } from './index.js';

export interface TutorialMain {
  id: string;
  project_id?: string;
  level: string;
  category?: string;
  original_language: string;
  professor_id: string;
  credit_link: string;
  tags?: string[];
  proofreading: ProofreadingEntry[];
  test_only?: boolean;
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (tutorial: ChangedTutorial, file?: ChangedFile) => {
    if (!file) return;
    const parsedTutorial = await yamlToObject<TutorialMain>(file);

    if (
      parsedTutorial.test_only === true &&
      process.env.PLANB_ENVIRONMENT === 'mainnet'
    ) {
      console.log('[sync] Ignore tutorial', parsedTutorial.id);
      return;
    }

    const lastUpdated = tutorial.files.sort((a, b) => b.time - a.time)[0];

    // If tutorial has no logo, replace it with project logo
    let logoUrl = tutorial.hasLogo ? tutorial.path : undefined;

    if (!logoUrl) {
      logoUrl = await transaction`
        SELECT r.path
        FROM content.projects b
        JOIN content.resources r ON b.resource_id = r.id
        WHERE b.id = ${parsedTutorial.project_id}
      `
        .then(firstRow)
        .then((row) => row?.path);
    }

    const result = await transaction<Tutorial[]>`
        INSERT INTO content.tutorials (id, project_id, professor_id, path, logo_url, name, category, subcategory, original_language, level, credit_link, last_updated, last_commit, last_sync)
        VALUES (
          ${parsedTutorial.id},
          ${parsedTutorial.project_id},
          ${parsedTutorial.professor_id},
          ${tutorial.path},
          ${logoUrl},
          ${tutorial.name},
          ${tutorial.category},
          ${parsedTutorial.category},
          ${parsedTutorial.original_language},
          ${parsedTutorial.level},
          ${parsedTutorial.credit_link},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          project_id = EXCLUDED.project_id,
          professor_id = EXCLUDED.professor_id,
          path = EXCLUDED.path,
          logo_url = EXCLUDED.logo_url,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          original_language = EXCLUDED.original_language,
          level = EXCLUDED.level,
          credit_link = EXCLUDED.credit_link,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING *
      `.then(firstRow);

    if (!result) {
      throw new Error('Could not insert tutorial');
    }

    // If the resource has tags, insert them into the tags table and link them to the resource
    if (parsedTutorial.tags && parsedTutorial.tags?.length > 0) {
      const lowercaseTags = parsedTutorial.tags.map((tag) => tag.toLowerCase());

      await transaction`
        DELETE FROM content.tutorial_tags WHERE tutorial_id = ${result.id}
      `;

      await transaction`
        INSERT INTO content.tags ${transaction(lowercaseTags.map((tag) => ({ name: tag })))}
        ON CONFLICT (name) DO NOTHING
      `;

      await transaction`
        INSERT INTO content.tutorial_tags (tutorial_id, tag_id)
          SELECT
            ${result.id},
            id
            FROM content.tags
            WHERE name = ANY(${lowercaseTags})
        ON CONFLICT DO NOTHING
        `;
    }

    // If the resource has proofreads
    if (parsedTutorial.proofreading) {
      for (const p of parsedTutorial.proofreading) {
        const proofreadResult = await transaction<Proofreading[]>`
          INSERT INTO content.proofreading (tutorial_id, language, last_contribution_date, urgency, reward)
          VALUES (${result.id}, ${p.language.toLowerCase()}, ${p.last_contribution_date}, ${p.urgency}, ${Math.round(p.reward * 100)})
          RETURNING *;
        `.then(firstRow);

        if (p.contributor_names) {
          for (const [index, contrib] of p.contributor_names.entries()) {
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
