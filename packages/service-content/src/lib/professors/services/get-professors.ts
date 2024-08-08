import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../queries/get-professors.js';

import { formatProfessor } from './utils.js';

export const createGetProfessors = (dependencies: Dependencies) => {
  // TODO: Add return type
  return async (language?: string) => {
    const { postgres } = dependencies;

    const professors = await postgres.exec(getProfessorsQuery({ language }));

    return professors.map((element) => formatProfessor(element));
  };
};
