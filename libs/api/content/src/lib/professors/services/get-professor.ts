import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../dependencies';
import { getProfessorQuery } from '../queries';

import { formatProfessor } from './utils';

export const createGetProfessor =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const professor = await postgres
      .exec(getProfessorQuery(id, language))
      .then(firstRow);

    if (!professor) return;

    return formatProfessor(professor);
  };
