import type { JoinedTutorialLight } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getTutorialsQuery } from '../queries/get-tutorials.js';

export const createGetTutorials = ({ postgres }: Dependencies) => {
  return (
    category?: string,
    language?: string,
  ): Promise<JoinedTutorialLight[]> => {
    return postgres.exec(getTutorialsQuery(category, language));
  };
};
