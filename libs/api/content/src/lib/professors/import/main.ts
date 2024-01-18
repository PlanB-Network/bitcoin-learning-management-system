import { TransactionSql, firstRow } from '@sovereign-university/database';
import {
  ChangedFile,
  ModifiedFile,
  Professor,
  RenamedFile,
} from '@sovereign-university/types';

import { yamlToObject } from '../../utils';

import { ChangedProfessor, parseDetailsFromPath } from '.';

interface ProfessorMain {
  name: string;
  contributor_id: string;
  company?: string;
  affiliations?: string[];
  links?: {
    website?: string;
    twitter?: string;
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

export const createProcessMainFile =
  (transaction: TransactionSql) =>
  async (professor: ChangedProfessor, file?: ChangedFile) => {
    if (!file) return;

    if (file.kind === 'removed') {
      // If professor question file was removed, delete the main professor question and all its translations (with cascade)

      await transaction`
        DELETE FROM content.professors WHERE path = ${professor.path} 
      `;

      return;
    }

    if (file.kind === 'renamed') {
      // If professor question file was moved, update the id

      const { path: previousPath } = parseDetailsFromPath(file.previousPath);

      await transaction`
        UPDATE content.professors
        SET path = ${professor.path}
        WHERE path = ${previousPath}
      `;
    }

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
      // If new or updated professor file, insert or update professor

      // Only get the tags from the main professor file
      const parsedProfessor = yamlToObject<ProfessorMain>(file.data);

      const lastUpdated = professor.files
        .filter(
          (file): file is ModifiedFile | RenamedFile => file.kind !== 'removed',
        )
        .sort((a, b) => b.time - a.time)[0];

      await transaction`
        INSERT INTO content.contributors (id)
        VALUES (${parsedProfessor.contributor_id})
        ON CONFLICT DO NOTHING
      `;

      const result = await transaction<Professor[]>`
        INSERT INTO content.professors (
          path, name, contributor_id, company, affiliations, website_url, twitter_url, github_url, 
          nostr, lightning_address, lnurl_pay, paynym, silent_payment, tips_url,
          last_updated, last_commit, last_sync
        )
        VALUES (
          ${professor.path},
          ${parsedProfessor.name},
          ${parsedProfessor.contributor_id},
          ${parsedProfessor.company},
          ${parsedProfessor.affiliations},
          ${parsedProfessor.links?.website},
          ${parsedProfessor.links?.twitter},
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
        ON CONFLICT (path) DO UPDATE SET
          name = EXCLUDED.name,
          contributor_id = EXCLUDED.contributor_id,
          company = EXCLUDED.company,
          affiliations = EXCLUDED.affiliations,
          website_url = EXCLUDED.website_url,
          twitter_url = EXCLUDED.twitter_url,
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

      // If the professor has tags, insert them into the tags table and link them to the professor
      if (result && parsedProfessor.tags && parsedProfessor.tags?.length > 0) {
        await transaction`
          INSERT INTO content.tags ${transaction(
            parsedProfessor.tags.map((tag) => ({ name: tag })),
          )}
          ON CONFLICT (name) DO NOTHING
        `;

        await transaction`
          INSERT INTO content.professor_tags (professor_id, tag_id)
          SELECT
            ${result.id}, 
            id FROM content.tags WHERE name = ANY(${parsedProfessor.tags})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  };
