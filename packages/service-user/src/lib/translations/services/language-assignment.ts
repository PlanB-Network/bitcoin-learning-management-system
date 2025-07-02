import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../../dependencies.js';
import {
  assignLanguageToContributorQuery,
  getAvailableLanguagesQuery,
  updateUserRoleToContributorQuery,
} from '../queries/language-assignment.js';

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
      const result = await postgres.exec(getAvailableLanguagesQuery());
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
      await postgres.exec(updateUserRoleToContributorQuery(contributorId));

      // Insert or update the reviewer language assignment
      await postgres.exec(
        assignLanguageToContributorQuery(contributorId, languageCode),
      );

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
