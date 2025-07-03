import { firstRow } from '@blms/database';
import type { FullProfessor } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { indexBy } from '../../utils.js';
import { getProfessorQuery } from '../queries/get-professor.js';
import { getProfessorCoursesQuery } from '../queries/get-professor-courses.js';
import { getProfessorTutorialsQuery } from '../queries/get-professor-tutorials.js';
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
        language,
        professorId: professor.id,
      }),
    );

    const mainProfessors = await postgres
      .exec(
        getProfessorsQuery({
          language,
          professorIds: courses.flatMap((course) => course.mainProfessorIds),
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const associatedProfessors = await postgres
      .exec(
        getProfessorsQuery({
          language,
          professorIds: courses.flatMap(
            (course) => course.associatedProfessorIds,
          ),
        }),
      )
      .then((professors) =>
        professors.map((element) => formatProfessor(element)),
      );

    const tutorials = await postgres.exec(
      getProfessorTutorialsQuery({
        language,
        professorId: professor.id,
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
          associatedProfessors: sortedAssociatedProfessors.filter(
            (professor) =>
              professor?.id !== undefined &&
              course.associatedProfessorIds.some(
                (p) => String(p) === professor.id,
              ),
          ),
          mainProfessors: mainProfessors.filter(
            (professor) =>
              professor !== undefined &&
              course.mainProfessorIds.some((p) => String(p) === professor.id),
          ),
        };
      }),
      tutorials,
    };
  };
};
