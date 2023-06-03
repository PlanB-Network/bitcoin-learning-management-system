import {
  firstRow,
  getCourseChapterQuery,
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

export const createGetCourseChapter =
  (dependencies: Dependencies) =>
  async (courseId: string, chapterIndex: number, language: string) => {
    const { postgres } = dependencies;
    const getCourse = createGetCourse(dependencies);

    const chapter = await postgres
      .exec(getCourseChapterQuery(courseId, chapterIndex, language))
      .then(firstRow);

    if (chapter) {
      const course = await getCourse(courseId, language, true);

      return {
        ...chapter,
        course,
      };
    }

    return;
  };
