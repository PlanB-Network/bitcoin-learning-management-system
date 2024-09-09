import { firstRow } from '@blms/database';
// import type {
//   JoinedCourseChapterWithContent,
//   JoinedProfessor,
// } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getProfessorsQuery } from '../../professors/queries/get-professors.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { getCourseChapterQuery } from '../queries/get-course-chapter.js';

import { createGetCourse } from './get-course.js';

// interface Output extends JoinedCourseChapterWithContent {
//   professors?: JoinedProfessor[];
//   course: any;
//   part: any;
// }

export const createGetCourseChapter = (dependencies: Dependencies) => {
  const { postgres } = dependencies;

  const getCourse = createGetCourse(dependencies);

  // TODO: Add return type
  return async (chapterId: string, language: string) => {
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
        ? {
            professors: professors.map((element) => formatProfessor(element)),
          }
        : {}),
      course,
      part,
    };
  };
};
