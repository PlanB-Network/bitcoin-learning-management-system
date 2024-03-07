import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import {
  getProfessorCoursesQuery,
  getProfessorQuery,
  getProfessorTutorialsQuery,
  getProfessorsQuery,
} from '../queries/index.js';

import { formatProfessor } from './utils.js';

export const createGetProfessor =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const professor = await postgres
      .exec(getProfessorQuery(id, language))
      .then(firstRow);

    if (!professor) throw new Error(`Professor not found`);

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
              (p) => p.id === Number(professor.contributorId),
            ),
        ),
      })),
      tutorials,
    };
  };
