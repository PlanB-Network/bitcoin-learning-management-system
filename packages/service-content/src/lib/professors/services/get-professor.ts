import { firstRow } from '@blms/database';
import type { FullProfessor } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { indexBy } from '../../utils.js';
import { getProfessorCoursesQuery } from '../queries/get-professor-courses.js';
import { getProfessorTutorialsQuery } from '../queries/get-professor-tutorials.js';
import { getProfessorQuery } from '../queries/get-professor.js';
import { getProfessorsQuery } from '../queries/get-professors.js';

import { formatProfessor } from './utils.js';

export const createGetProfessor = ({ postgres }: Dependencies) => {
  return async (id: string, language?: string): Promise<FullProfessor> => {
    console.log('IDDDDD', id, '--', language);
    const professor = await postgres
      .exec(getProfessorQuery(id, language))
      .then(firstRow);

    if (!professor) {
      throw new Error('Professor not found');
    }

    const courses = await postgres.exec(
      getProfessorCoursesQuery({
        contributorId: professor.contributorId,
        language,
      }),
    );

    const professors = await postgres
      .exec(
        getProfessorsQuery({
          contributorIds: courses.flatMap((course) => course.professors),
          language,
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const tutorials = await postgres.exec(
      getProfessorTutorialsQuery({
        contributorId: professor.contributorId,
        language,
      }),
    );

    const professorsMap = indexBy(professors, 'contributorId');

    return {
      ...formatProfessor(professor),
      courses: courses.map((course) => {
        const sortedProfessors = course.professors
          .map((contributorId) => professorsMap.get(contributorId))
          .filter((p) => p !== undefined);

        return {
          ...course,
          professors: sortedProfessors.filter(
            (professor) =>
              professor.contributorId !== undefined &&
              course.professors.includes(professor.contributorId),
          ),
        };
      }),
      tutorials,
    };
  };
};
