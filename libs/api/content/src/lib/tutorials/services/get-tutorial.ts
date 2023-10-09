import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../dependencies';
import { getTutorialQuery } from '../queries';

export const createGetTutorial =
  (dependencies: Dependencies) => async (id: number, language: string) => {
    const { postgres } = dependencies;

    const tutorial = await postgres
      .exec(getTutorialQuery(id, language))
      .then(firstRow);

    return tutorial;
  };
