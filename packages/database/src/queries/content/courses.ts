import { CourseChapterLocalized, JoinedCourse } from '@sovereign-academy/types';

import { sql } from '../../index';

export const getCoursesQuery = (language?: string) => {
  return sql<JoinedCourse[]>`
    SELECT 
      c.id, cl.language, c.level, c.hours, cl.name, cl.goal,
      cl.raw_description, c.last_updated, c.last_commit
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id
    ${language ? sql`WHERE cl.language = ${language}` : sql``}
  `;
};

export const getCourseQuery = (id: string, language?: string) => {
  return sql<JoinedCourse[]>`
    SELECT 
      c.id, cl.language, c.level, c.hours, cl.name, cl.goal,
      cl.raw_description, c.last_updated, c.last_commit
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id
    WHERE course_id = ${id} 
    ${language ? sql`AND cl.language = ${language}` : sql``}
  `;
};

export const getCourseChaptersQuery = (id: string, language?: string) => {
  return sql<
    Pick<
      CourseChapterLocalized,
      'chapter' | 'language' | 'title' | 'raw_content'
    >[]
  >`
  SELECT chapter, language, title
  FROM content.course_chapters_localized
  WHERE course_id = ${id} 
  ${language ? sql`AND language = ${language}` : sql``}
  `;
};

export const getCourseChapterQuery = (
  courseId: string,
  chapterIndex: number,
  language?: string
) => {
  return sql<
    Pick<
      CourseChapterLocalized,
      'chapter' | 'language' | 'title' | 'raw_content'
    >[]
  >`
    SELECT chapter, language, title, raw_content
    FROM content.course_chapters_localized
    WHERE
      course_id = ${courseId} 
      AND chapter = ${chapterIndex}
    ${language ? sql`AND language = ${language}` : sql``}
  `;
};
