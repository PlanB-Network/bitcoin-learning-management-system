import type { FormattedProfessor } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../queries/get-professors.js';

import { formatProfessor } from './utils.js';

export const createGetProfessors = ({ postgres }: Dependencies) => {
  return (language?: string): Promise<FormattedProfessor[]> => {
    return postgres
      .exec(getProfessorsQuery({ language }))
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );
  };
};
