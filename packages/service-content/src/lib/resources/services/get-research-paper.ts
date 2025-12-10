import { firstRow } from '@blms/database';
import type { JoinedResearchPaper } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getResearchPaperQuery } from '../queries/get-research-paper.js';

export const createGetResearchPaper = ({ postgres }: Dependencies) => {
  return async (id: string): Promise<JoinedResearchPaper> => {
    const researchPaper = await postgres
      .exec(getResearchPaperQuery(id))
      .then(firstRow);

    if (!researchPaper) {
      throw new Error('Research paper not found');
    }

    return researchPaper;
  };
};
