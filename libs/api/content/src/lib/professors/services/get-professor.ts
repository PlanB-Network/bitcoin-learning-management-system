import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../dependencies';
import {
  getProfessorCoursesQuery,
  getProfessorQuery,
  getProfessorTutorialsQuery,
  getProfessorsQuery,
} from '../queries';

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

    const professors = await postgres
      .exec(
        getProfessorsQuery({
          contributorIds: courses.flatMap((course) => course.professors),
          language,
        }),
      )
      .then((professors) => professors.map(formatProfessor));

    const tutorials = await postgres.exec(
      getProfessorTutorialsQuery({
        contributorId: professor.contributor_id,
        language,
      }),
    );

    return {
      ...formatProfessor(professor),
      courses: courses.map((course) => ({
        ...course,
        professors: professors.filter((professor) =>
          course.professors.includes(professor.contributor_id),
        ),
      })),
      tutorials,
    };
  };
