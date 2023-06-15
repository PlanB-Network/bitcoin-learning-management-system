import {
  Course,
  CourseChapter,
  CourseChapterLocalized,
  JoinedCourse,
} from '@sovereign-academy/types';

import { sql } from '../../index';

export const getCoursesQuery = (language?: string) => {
  return sql<JoinedCourse[]>`
    SELECT 
      c.id, cl.language, c.level, c.hours, c.teacher, cl.name, cl.goal,
      cl.objectives, cl.raw_description, c.last_updated, c.last_commit
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id
    ${language ? sql`WHERE cl.language = ${language}` : sql``}
  `;
};

export const getCourseQuery = (id: string, language?: string) => {
  return sql<JoinedCourse[]>`
    SELECT 
      c.id, cl.language, c.level, c.hours, c.teacher, cl.name, cl.goal,
      cl.objectives, cl.raw_description, c.last_updated, c.last_commit
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id
    WHERE course_id = ${id} 
    ${language ? sql`AND cl.language = ${language}` : sql``}
  `;
};

export const getCourseChaptersQuery = (id: string, language?: string) => {
  return sql<CourseChapter[]>`
    SELECT chapter, language, title, sections
    FROM content.course_chapters_localized
    WHERE course_id = ${id} 
    ${language ? sql`AND language = ${language}` : sql``}
    ORDER BY chapter ASC
  `;
};

export const getCourseChapterQuery = (
  courseId: string,
  chapterIndex: number,
  language?: string
) => {
  return sql<
    (Pick<
      CourseChapterLocalized,
      'chapter' | 'language' | 'title' | 'raw_content'
    > &
      Pick<Course, 'last_commit' | 'last_updated'>)[]
  >`
    SELECT chapter, language, title, raw_content, c.last_updated, c.last_commit
    FROM content.course_chapters_localized
    JOIN content.courses c ON c.id = course_id
    WHERE
      course_id = ${courseId} 
      AND chapter = ${chapterIndex}
    ${language ? sql`AND language = ${language}` : sql``}
  `;
};
