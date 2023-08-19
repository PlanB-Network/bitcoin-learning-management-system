import {
  CourseCompletedChapters,
  CourseProgress,
  CourseProgressWithName,
} from '@sovereign-academy/types';

import { sql } from '../../index';

export const getUserCompletedChaptersQuery = (uid: string) => {
  return sql<Omit<CourseCompletedChapters, 'uid'>[]>`
    SELECT course_id, language, chapter, completed_at FROM users.course_completed_chapters
    WHERE uid = ${uid};
  `;
};

export const getUserCompletedChaptersByCourseQuery = (
  uid: string,
  courseId: string,
  language: string
) => {
  return sql<Pick<CourseCompletedChapters, 'chapter' | 'completed_at'>[]>`
    SELECT
      chapter,
      completed_at
    FROM users.course_completed_chapters
    WHERE
      uid = ${uid}
      AND course_id = ${courseId}
      AND language = ${language};
  `;
};

export const completeChapterQuery = (
  uid: string,
  courseId: string,
  language: string,
  chapter: number
) => {
  return sql<CourseProgress[]>`
    WITH 
    -- Insert into course_completed_chapters and return the affected rows
    inserted AS (
        INSERT INTO users.course_completed_chapters (uid, course_id, language, chapter)
        VALUES (${uid}, ${courseId}, ${language}, ${chapter})
        RETURNING *
    ),

    -- Calculate the count of completed chapters for the user and course after the insertion
    chapter_count AS (
        SELECT COUNT(*) as completed_count 
        FROM users.course_completed_chapters
        WHERE
          uid = ${uid}
          AND course_id = ${courseId}
          AND language = ${language}
    ),

    -- Calculate the total number of chapters for the course in the specified language
    total_chapters AS (
        SELECT COUNT(*) as total 
        FROM content.course_chapters_localized 
        WHERE
          course_id = ${courseId}
          AND language = ${language}
    )

    -- Update the course_progress table with the new data
    INSERT INTO users.course_progress
    SELECT
      ${uid} as uid,
      ${courseId} as course_id,
      ${language} as language,
      chapter_count.completed_count + 1 as completed_chapters_count,
      NOW() as last_updated,
      ((chapter_count.completed_count::FLOAT + 1) / total_chapters.total) * 100 as progress_percentage
    FROM chapter_count, total_chapters
    ON CONFLICT (uid, course_id, language) DO UPDATE
    SET
      completed_chapters_count = EXCLUDED.completed_chapters_count,
      last_updated = NOW(),
      progress_percentage = EXCLUDED.progress_percentage
    RETURNING *;
  `;
};

export const getCoursesProgressQuery = (uid: string) => {
  return sql<CourseProgressWithName[]>`
    SELECT 
      cp.*,
      c.name
    FROM users.course_progress cp
    JOIN content.courses_localized c ON c.course_id = cp.course_id AND c.language = cp.language
    WHERE uid = ${uid};
  `;
};
