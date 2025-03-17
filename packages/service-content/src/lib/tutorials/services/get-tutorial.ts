import { firstRow } from '@blms/database';

import type { GetTutorialResponse } from '@blms/types';
import type { Dependencies } from '../../dependencies.js';
import { getProfessorQuery } from '../../professors/queries/get-professor.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { getTutorialQuery } from '../queries/get-tutorial.js';

export const createGetTutorial = ({ postgres }: Dependencies) => {
  return async (options: {
    id: string;
    language: string;
  }): Promise<GetTutorialResponse> => {
    const { id, language } = options;

    const tutorial = await postgres
      .exec(getTutorialQuery(id, language))
      .then(firstRow);

    if (!tutorial) {
      throw new Error('Tutorial not found');
    }

    const professor = tutorial.professorId
      ? await postgres
          .exec(getProfessorQuery(tutorial.professorId, language))
          .then(firstRow)
      : null;

    return {
      ...tutorial,
      professor: professor ? formatProfessor(professor) : undefined,
    };
  };
};
