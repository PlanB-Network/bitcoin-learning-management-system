import { firstRow } from '@blms/database';
import type { JoinedProofreading } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getProofreadingQuery } from '../queries/get-proofreading.js';

export const createGetProofreading = ({ postgres }: Dependencies) => {
  return async (
    language: string,
    courseId: string | undefined,
    tutorialId: string | undefined,
    resourceId: number | undefined,
  ): Promise<JoinedProofreading | null> => {
    try {
      const result = await postgres
        .exec(
          getProofreadingQuery({ language, courseId, tutorialId, resourceId }),
        )
        .then(firstRow);

      if (!result) {
        return null;
      }

      return result;
    } catch {
      throw new Error('Proofreading not found');
    }
  };
};
