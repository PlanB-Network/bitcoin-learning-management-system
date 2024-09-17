import { firstRow } from '@blms/database';
import type { FullProfessor } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getProfessorCoursesQuery } from '../queries/get-professor-courses.js';
import { getProfessorTutorialsQuery } from '../queries/get-professor-tutorials.js';
import { getProfessorQuery } from '../queries/get-professor.js';
import { getProfessorsQuery } from '../queries/get-professors.js';

import { formatProfessor } from './utils.js';

export const createGetProfessor = (dependencies: Dependencies) => {
  return async (id: number, language?: string): Promise<FullProfessor> => {
    const { postgres } = dependencies;

    const professor = await postgres
      .exec(getProfessorQuery(id, language))
      .then(firstRow);

    if (!professor) {
      throw new Error(`Professor not found`);
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

    return {
      ...formatProfessor(professor),
      courses: courses.map((course) => ({
        ...course,
        professors: professors.filter(
          (professor) =>
            professor.contributorId !== undefined &&
            course.professors.some(
              (p) => String(p) === professor.contributorId,
            ),
        ),
      })),
      tutorials,
    };
  };
};
