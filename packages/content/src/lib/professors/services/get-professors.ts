import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../queries/index.js';

import { formatProfessor } from './utils.js';

export const createGetProfessors =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const professors = await postgres.exec(getProfessorsQuery({ language }));

    return professors.map((element) => formatProfessor(element));
  };
