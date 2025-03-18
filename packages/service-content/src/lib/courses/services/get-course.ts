import { firstRow } from '@blms/database';
import type { CourseResponse } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../../professors/queries/get-professors.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { indexBy } from '../../utils.js';
import { getCourseChaptersQuery } from '../queries/get-course-chapters.js';
import { getCoursePartsQuery } from '../queries/get-course-parts.js';
import { getCourseQuery } from '../queries/get-course.js';

export const createGetCourse = ({ postgres }: Dependencies) => {
  return async (id: string, language: string): Promise<CourseResponse> => {
    const course = await postgres
      .exec(getCourseQuery(id, language))
      .then(firstRow);

    if (!course) {
      throw new Error(`Course ${id} not found`);
    }

    const parts = await postgres.exec(getCoursePartsQuery(id, course.language));
    const chapters = await postgres.exec(
      getCourseChaptersQuery({ courseId: id, language: course.language }),
    );

    const mainProfessors = await postgres.exec(
      getProfessorsQuery({ professorIds: course.mainProfessorIds, language }),
    );

    const associatedProfessors = await postgres.exec(
      getProfessorsQuery({
        professorIds: course.associatedProfessorIds,
        language,
      }),
    );
    const associatedProfessorsMap = indexBy(associatedProfessors, 'id');
    const sortedAssociatedProfessors = course.associatedProfessorIds
      .map((id) => associatedProfessorsMap.get(id))
      .filter((p) => p !== undefined);

    const partsWithChapters = parts.map((part) => ({
      ...part,
      chapters: chapters.filter((chapter) => chapter.partId === part.partId),
    }));

    return {
      ...course,
      mainProfessors: mainProfessors.map((element) => formatProfessor(element)),
      associatedProfessors: sortedAssociatedProfessors.map((element) =>
        formatProfessor(element),
      ),
      parts: partsWithChapters,
      partsCount: parts.length,
      chaptersCount: chapters.length,
    };
  };
};
