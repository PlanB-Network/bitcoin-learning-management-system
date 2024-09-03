import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getProofreadingQuery } from '../queries/get-proofreading.js';

export const createGetProofreading =
  (dependencies: Dependencies) =>
  async (
    language: string,
    courseId: string | undefined,
    tutorialId: string | undefined,
    resourceId: number | undefined,
  ) => {
    const { postgres } = dependencies;
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
