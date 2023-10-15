import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../dependencies';
import { getCourseChaptersQuery, getCourseQuery } from '../queries';
import { getCoursePartsQuery } from '../queries/get-course-parts';

export const createGetCourse =
  (dependencies: Dependencies) => async (id: string, language: string) => {
    const { postgres } = dependencies;

    const course = await postgres
      .exec(getCourseQuery(id, language))
      .then(firstRow);

    if (!course) {
      throw new Error(`Course ${id} not found`);
    }

    const parts = await postgres.exec(getCoursePartsQuery(id, language));
    const chapters = await postgres.exec(
      getCourseChaptersQuery({ courseId: id, language }),
    );

    const partsWithChapters = parts.map((part) => ({
      ...part,
      chapters: chapters.filter((chapter) => chapter.part === part.part),
    }));

    return {
      ...course,
      parts: partsWithChapters,
      partsCount: parts.length,
      chaptersCount: chapters.length,
    };
  };
