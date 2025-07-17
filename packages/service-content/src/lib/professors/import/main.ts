import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { ChangedFile, Professor } from '@blms/types';

import { yamlToObject } from '../../utils.js';

import type { ChangedProfessor } from './index.js';

interface ProfessorMain {
  id: string;
  name: string;
  company?: string;
  affiliations?: string[];
  links?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    nostr?: string;
  };
  tips?: {
    lightning_address?: string;
    lnurl_pay?: string;
    paynym?: string;
    silent_payment?: string;
    url?: string;
  };
  tags?: string[];
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (professor: ChangedProfessor, file?: ChangedFile) => {
    if (!file) return;

    const parsedProfessor = await yamlToObject<ProfessorMain>(file);

    const lastUpdated = professor.files.sort((a, b) => b.time - a.time)[0];

    const result = await transaction<Professor[]>`
        INSERT INTO content.professors (
          id,
          path,
          name,
          company,
          affiliations,
          website_url,
          twitter_url,
          linkedin_url,
          github_url,
          nostr,
          lightning_address,
          lnurl_pay,
          paynym,
          silent_payment,
          tips_url,
          last_updated,
          last_commit,
          last_sync
        )
        VALUES (
          ${parsedProfessor.id},
          ${professor.path},
          ${parsedProfessor.name},
          ${parsedProfessor.company},
          ${parsedProfessor.affiliations},
          ${parsedProfessor.links?.website},
          ${parsedProfessor.links?.twitter},
          ${parsedProfessor.links?.linkedin},
          ${parsedProfessor.links?.github},
          ${parsedProfessor.links?.nostr},
          ${parsedProfessor.tips?.lightning_address},
          ${parsedProfessor.tips?.lnurl_pay},
          ${parsedProfessor.tips?.paynym},
          ${parsedProfessor.tips?.silent_payment},
          ${parsedProfessor.tips?.url},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          path = EXCLUDED.path,
          name = EXCLUDED.name,
          company = EXCLUDED.company,
          affiliations = EXCLUDED.affiliations,
          website_url = EXCLUDED.website_url,
          twitter_url = EXCLUDED.twitter_url,
          linkedin_url = EXCLUDED.linkedin_url,
          github_url = EXCLUDED.github_url,
          nostr = EXCLUDED.nostr,
          lightning_address = EXCLUDED.lightning_address,
          lnurl_pay = EXCLUDED.lnurl_pay,
          paynym = EXCLUDED.paynym,
          silent_payment = EXCLUDED.silent_payment,
          tips_url = EXCLUDED.tips_url,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING *
      `.then(firstRow);

    // Remove tags related to the resource before inserting the new one
    if (result) {
      await transaction`
        DELETE FROM content.professor_tags
        WHERE professor_id = ${result.id}
      `;
    }

    // If the professor has tags, insert them into the tags table and link them to the professor
    if (result && parsedProfessor.tags && parsedProfessor.tags?.length > 0) {
      const lowercaseTags = parsedProfessor.tags.map((tag) =>
        tag.toLowerCase(),
      );

      await transaction`
        DELETE FROM content.professor_tags WHERE professor_id = ${result.id}
      `;

      await transaction`
        INSERT INTO content.tags ${transaction(lowercaseTags.map((tag) => ({ name: tag })))}
        ON CONFLICT (name) DO NOTHING
      `;

      await transaction`
          INSERT INTO content.professor_tags (professor_id, tag_id)
          SELECT
            ${result.id},
            id
            FROM content.tags
            WHERE name = ANY(${lowercaseTags})
          ON CONFLICT DO NOTHING
        `;
    }
  };
};
