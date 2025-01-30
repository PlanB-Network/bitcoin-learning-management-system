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
          contributorIds: courses.flatMap((course) => course.professors),
          language,
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const professorsMap = indexBy(professors, 'contributorId');

    return courses.map((course) => {
      const sortedProfessors = course.professors
        .map((contributorId) => professorsMap.get(contributorId))
        .filter((p) => p !== undefined);

      return {
        ...course,
        professors: sortedProfessors.filter(
          (professor) =>
            professor?.contributorId !== undefined &&
            course.professors.some(
              (p) => String(p) === professor.contributorId,
            ),
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
          contributorIds: courses.flatMap((course) => course.professors),
          language,
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const professorsMap = indexBy(professors, 'contributorId');

    return courses.map((course) => {
      const sortedProfessors = course.professors
        .map((contributorId) => professorsMap.get(contributorId))
        .filter((p) => p !== undefined);

      return {
        ...course,
        professors: sortedProfessors.filter(
          (professor) =>
            professor?.contributorId !== undefined &&
            course.professors.includes(professor.contributorId),
        ),
      };
    });
  };
};
