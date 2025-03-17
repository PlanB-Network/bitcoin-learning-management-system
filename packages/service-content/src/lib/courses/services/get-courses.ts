import type { JoinedCourse } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../../professors/queries/get-professors.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { indexBy } from '../../utils.js';
import {
  getCoursesQuery,
  getProfessorCoursesQuery,
} from '../queries/get-courses.js';

export const createGetCourses = ({ postgres }: Dependencies) => {
  return async (language?: string): Promise<JoinedCourse[]> => {
    const courses = await postgres.exec(getCoursesQuery(language));

    const professors = await postgres
      .exec(
        getProfessorsQuery({
          professorIds: courses.flatMap((course) => course.professors),
          language,
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const professorsMap = indexBy(professors, 'id');

    return courses.map((course) => {
      const sortedProfessors = course.professors
        .map((id) => professorsMap.get(id))
        .filter((p) => p !== undefined);

      return {
        ...course,
        professors: sortedProfessors.filter(
          (professor) =>
            professor?.id !== undefined &&
            course.professors.some((p) => String(p) === professor.id),
        ),
      };
    });
  };
};

export const createGetProfessorCourses = ({ postgres }: Dependencies) => {
  return async (
    coursesId: string[],
    language?: string,
  ): Promise<JoinedCourse[]> => {
    const courses = await postgres.exec(
      getProfessorCoursesQuery(coursesId, language),
    );

    const professors = await postgres
      .exec(
        getProfessorsQuery({
          professorIds: courses.flatMap((course) => course.professors),
          language,
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const professorsMap = indexBy(professors, 'id');

    return courses.map((course) => {
      const sortedProfessors = course.professors
        .map((id) => professorsMap.get(id))
        .filter((p) => p !== undefined);

      return {
        ...course,
        professors: sortedProfessors.filter(
          (professor) =>
            professor?.id !== undefined &&
            course.professors.includes(professor.id),
        ),
      };
    });
  };
};
