import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { getCourseChapterQuery } from '../queries/index.js';

import { createGetCourse } from './get-course.js';

export const createGetCourseChapter =
  (dependencies: Dependencies) =>
  async (
    courseId: string,
    partIndex: number,
    chapterIndex: number,
    language: string,
  ) => {
    const { postgres } = dependencies;
    const getCourse = createGetCourse(dependencies);

    const chapter = await postgres
      .exec(getCourseChapterQuery(courseId, partIndex, chapterIndex, language))
      .then(firstRow);

    const course = await getCourse(courseId, language);
    const part = course.parts.find((part) => part.part === partIndex);

    // Should never happen if a chapter was found
    if (!chapter || !part) throw new Error('Chapter not found');

    return {
      ...chapter,
      course,
      part,
    };
  };
