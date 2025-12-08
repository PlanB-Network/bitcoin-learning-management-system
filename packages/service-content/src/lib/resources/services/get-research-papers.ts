import type { JoinedResearchPaper } from '@blms/types';

import type { Dependencies } from '#src/lib/dependencies.js';

import { getResearchPapersQuery } from '../queries/get-research-papers.js';

export const createGetResearchPapers = ({ postgres }: Dependencies) => {
  return (): Promise<JoinedResearchPaper[]> => {
    return postgres.exec(getResearchPapersQuery());
  };
};
