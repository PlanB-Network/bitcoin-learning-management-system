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
    const professor = await postgres
      .exec(getProfessorQuery(id, language))
      .then(firstRow);

    if (!professor) {
      throw new Error('Professor not found');
    }

    const courses = await postgres.exec(
      getProfessorCoursesQuery({
        professorId: professor.id,
        language,
      }),
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

    const tutorials = await postgres.exec(
      getProfessorTutorialsQuery({
        professorId: professor.id,
        language,
      }),
    );

    const associatedProfessorsMap = indexBy(associatedProfessors, 'id');

    return {
      ...formatProfessor(professor),
      courses: courses.map((course) => {
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
      }),
      tutorials,
    };
  };
};
