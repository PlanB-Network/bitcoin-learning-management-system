import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../dependencies';
import { getProfessorQuery } from '../queries';
import { getProfessorCoursesQuery } from '../queries/get-professor-courses';

import { formatProfessor } from './utils';

export const createGetProfessor =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const professor = await postgres
      .exec(getProfessorQuery(id, language))
      .then(firstRow);

    if (!professor) return;

    const courses = await postgres.exec(
      getProfessorCoursesQuery({
        contributorId: professor.contributor_id,
        language,
      }),
    );

    return { ...formatProfessor(professor), courses };
  };
