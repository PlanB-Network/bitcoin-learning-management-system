import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../dependencies';
import { getCourseChapterQuery } from '../queries';

import { createGetCourse } from './get-course';

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

    if (!chapter) return;

    const course = await getCourse(courseId, language);
    const part = course.parts.find((part) => part.part === partIndex);

    // Should never happen if a chapter was found
    if (!part) return;

    return {
      ...chapter,
      course,
      part,
    };
  };
