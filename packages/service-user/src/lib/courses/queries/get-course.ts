import { sql } from '@blms/database';
import type { Course, CourseLocalized } from '@blms/types';

export const getCourseInfo = (courseId: string) => {
  return sql<Course[]>`
        SELECT *
        FROM content.courses
        WHERE id = ${courseId}
    `;
};

export const getCourseLocalized = (language: string, courseId: string) => {
  return sql<CourseLocalized[]>`
        SELECT *
        FROM content.courses_localized
        WHERE course_id = ${courseId} AND language = ${language}
    `;
};
