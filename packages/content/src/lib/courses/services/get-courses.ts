import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../../professors/queries/index.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { getCoursesQuery } from '../queries/index.js';

export const createGetCourses =
  (dependencies: Dependencies) => async (language?: string) => {
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
          course.professors.some(
            (p) => p.id === Number(professor.contributorId),
          ),
      ),
    }));
  };
