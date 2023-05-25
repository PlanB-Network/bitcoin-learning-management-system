import { Course, CourseLocalized } from '@sovereign-academy/types';

import { Dependencies } from '../../dependencies';

type JoinedCourse = Pick<
  Course,
  'id' | 'level' | 'hours' | 'last_updated' | 'last_commit'
> &
  Pick<CourseLocalized, 'language' | 'name' | 'goal' | 'raw_description'>;

export const createGetCourses =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres<JoinedCourse[]>`
      SELECT 
        c.id, cl.language, c.level, c.hours, cl.name, cl.goal,
        cl.raw_description, c.last_updated, c.last_commit
      FROM content.courses c
      JOIN content.courses_localized cl ON c.id = cl.course_id
      ${language ? postgres`WHERE cl.language = ${language}` : postgres``}
    `;

    return result;
  };

export const createGetCoursesChapters =
  (dependencies: Dependencies) => async (id: string, language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres<any[]>`
      SELECT chapter AS index, title, raw_content
      FROM content.course_chapters_localized
      WHERE course_id = ${id} 
      ${language ? postgres`AND language = ${language}` : postgres``}
    `;

    return result;
  };
