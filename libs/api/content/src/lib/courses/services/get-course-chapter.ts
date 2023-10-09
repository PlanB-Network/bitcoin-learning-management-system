import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../dependencies';
import { getCourseChapterQuery } from '../queries';

import { createGetCourse } from './get-course';

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
