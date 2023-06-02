import {
  firstRow,
  getCourseChaptersQuery,
  getCourseQuery,
} from '@sovereign-academy/database';

import { Dependencies } from '../../dependencies';

export const createGetCourse =
  (dependencies: Dependencies) =>
  async (id: string, language: string, includeChapters = false) => {
    const { postgres } = dependencies;

    const course = await postgres
      .exec(getCourseQuery(id, language))
      .then(firstRow);

    if (course) {
      return {
        ...course,
        ...(includeChapters && {
          chapters: await postgres.exec(getCourseChaptersQuery(id, language)),
        }),
      };
    }

    return;
  };
