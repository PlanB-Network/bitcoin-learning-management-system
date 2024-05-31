import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../../professors/queries/get-professors.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { getCourseChapterQuery } from '../queries/index.js';

import { createGetCourse } from './get-course.js';

export const createGetCourseChapter =
  (dependencies: Dependencies) =>
  async (courseId: string, chapterId: string, language: string) => {
    const { postgres } = dependencies;
    const getCourse = createGetCourse(dependencies);

    const chapter = await postgres
      .exec(getCourseChapterQuery(courseId, chapterId, language))
      .then(firstRow);

    const course = await getCourse(courseId, language);
    const part = course.parts.find((part) => part.partId === chapter?.partId);

    const professors = await postgres.exec(
      getProfessorsQuery({ contributorIds: chapter?.professors, language }),
    );

    // Should never happen if a chapter was found
    if (!chapter || !part) throw new Error('Chapter not found');

    return {
      ...chapter,
      ...(professors
        ? { professors: professors.map((element) => formatProfessor(element)) }
        : {}),
      course,
      part,
    };
  };
