import type { JoinedCourseWithProfessors } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../../professors/queries/get-professors.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { getCoursesQuery } from '../queries/get-courses.js';

export const createGetCourses = (dependencies: Dependencies) => {
  return async (language?: string): Promise<JoinedCourseWithProfessors[]> => {
    const { postgres } = dependencies;

    const courses = await postgres.exec(getCoursesQuery(language));

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

    return courses.map((course) => ({
      ...course,
      professors: professors.filter(
        (professor) =>
          professor.contributorId !== undefined &&
          course.professors.some((p) => String(p) === professor.contributorId),
      ),
    }));
  };
};
