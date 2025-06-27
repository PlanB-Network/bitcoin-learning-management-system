import { sql } from '@blms/database';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';

export interface LanguageInfo {
  code: string;
  name: string;
}

/**
 * Service to get available languages
 */
export const createGetAvailableLanguages = ({ postgres }: Dependencies) => {
  return async (): Promise<LanguageInfo[]> => {
    try {
      const result = await postgres.exec(sql`
        SELECT
          l.code,
          l.name
        FROM users.languages l
        ORDER BY l.name
      `);
      return result as LanguageInfo[];
    } catch (error) {
      console.error('Error fetching available languages:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch available languages',
      });
    }
  };
};

/**
 * Service to assign language to contributor
 */
export const createAssignLanguageToContributor = ({
  postgres,
}: Dependencies) => {
  return async ({
    contributorId,
    languageCode,
  }: {
    contributorId: string;
    languageCode: string;
  }) => {
    try {
      // First, update the user's role to 'contributor' if not already
      await postgres.exec(sql`
        UPDATE users.accounts
        SET role = 'contributor'
        WHERE uid = ${contributorId}
        AND role NOT IN ('contributor', 'admin', 'superadmin')
      `);

      // Insert or update the reviewer language assignment
      await postgres.exec(sql`
        INSERT INTO users.reviewer_languages (reviewer_id, language_code, proficiency_level)
        VALUES (${contributorId}, ${languageCode}, 1)
        ON CONFLICT (reviewer_id, language_code)
        DO UPDATE SET proficiency_level = EXCLUDED.proficiency_level
      `);

      return;
    } catch (error) {
      console.error('Error assigning language to contributor:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to assign language to contributor',
      });
    }
  };
};
