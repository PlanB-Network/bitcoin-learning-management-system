import { Dependencies } from '../../dependencies';
import { getProfessorsQuery } from '../queries';

import { formatProfessor } from './utils';

export const createGetProfessors =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const professors = await postgres.exec(getProfessorsQuery(language));

    return professors.map(formatProfessor);
  };
