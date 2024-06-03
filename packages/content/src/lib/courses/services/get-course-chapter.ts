/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../../professors/queries/get-professors.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { getCourseChapterQuery } from '../queries/index.js';

import { createGetCourse } from './get-course.js';

export const createGetCourseChapter =
  (dependencies: Dependencies) =>
  async (chapterId: string, language: string) => {
    const { postgres } = dependencies;
    const getCourse = createGetCourse(dependencies);

    const chapter = await postgres
      .exec(getCourseChapterQuery(chapterId, language))
      .then(firstRow);

    if (!chapter) throw new Error('Chapter not found');

    const course = await getCourse(chapter.courseId, language);
    const part = course.parts.find((part) => part.partId === chapter?.partId);

    const professors = await postgres.exec(
      getProfessorsQuery({ contributorIds: chapter?.professors, language }),
    );

    // Should never happen if a chapter was found
    if (!part) throw new Error('Chapter not found');

    return {
      ...chapter,
      ...(professors
        ? { professors: professors.map((element) => formatProfessor(element)) }
        : {}),
      course,
      part,
    };
  };
