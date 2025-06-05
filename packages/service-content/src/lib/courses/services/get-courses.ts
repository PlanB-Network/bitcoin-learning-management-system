import type { JoinedCourse } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../../professors/queries/get-professors.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { indexBy } from '../../utils.js';
import {
  getCoursesIdsQuery,
  getCoursesQuery,
  getPlanBSchoolCoursesIdsQuery,
  getProfessorCoursesQuery,
} from '../queries/get-courses.js';

export const createGetCourses = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (language?: string): Promise<JoinedCourse[]> => {
    const courses = await postgres.exec(getCoursesQuery(language));

    const mainProfessors = await postgres
      .exec(
        getProfessorsQuery({
          professorIds: courses.flatMap((course) => course.mainProfessorIds),
          language,
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const associatedProfessors = await postgres
      .exec(
        getProfessorsQuery({
          professorIds: courses.flatMap(
            (course) => course.associatedProfessorIds,
          ),
          language,
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const associatedProfessorsMap = indexBy(associatedProfessors, 'id');

    return courses.map((course) => {
      const sortedAssociatedProfessors = course.associatedProfessorIds
        .map((id) => associatedProfessorsMap.get(id))
        .filter((p) => p !== undefined);

      return {
        ...course,
        mainProfessors: mainProfessors.filter(
          (professor) =>
            professor !== undefined &&
            course.mainProfessorIds.some((p) => String(p) === professor.id),
        ),
        associatedProfessors: sortedAssociatedProfessors.filter(
          (professor) =>
            professor?.id !== undefined &&
            course.associatedProfessorIds.some(
              (p) => String(p) === professor.id,
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

    const mainProfessors = await postgres
      .exec(
        getProfessorsQuery({
          professorIds: courses.flatMap((course) => course.mainProfessorIds),
          language,
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const associatedProfessors = await postgres
      .exec(
        getProfessorsQuery({
          professorIds: courses.flatMap(
            (course) => course.associatedProfessorIds,
          ),
          language,
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const associatedProfessorsMap = indexBy(associatedProfessors, 'id');

    return courses.map((course) => {
      const sortedAssociatedProfessors = course.associatedProfessorIds
        .map((id) => associatedProfessorsMap.get(id))
        .filter((p) => p !== undefined);

      return {
        ...course,
        mainProfessors: mainProfessors.filter(
          (professor) =>
            professor !== undefined &&
            course.mainProfessorIds.some((p) => String(p) === professor.id),
        ),
        associatedProfessors: sortedAssociatedProfessors.filter(
          (professor) =>
            professor?.id !== undefined &&
            course.associatedProfessorIds.some(
              (p) => String(p) === professor.id,
            ),
        ),
      };
    });
  };
};

export const createGetCoursesIds = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (): Promise<string[]> => {
    const courses = await postgres.exec(getCoursesIdsQuery());

    return courses.map((course) => course.id);
  };
};

export const createGetPlanBSchoolCoursesIds = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (): Promise<string[]> => {
    const courses = await postgres.exec(getPlanBSchoolCoursesIdsQuery());

    return courses.map((course) => course.id);
  };
};
