import { sql } from '@sovereign-university/database';
import { CourseChapter } from '@sovereign-university/types';

export const getCourseChaptersQuery = ({
  courseId,
  partIndex,
  language,
}: {
  courseId: string;
  partIndex?: number;
  language?: string;
}) => {
  return sql<CourseChapter[]>`
    SELECT part, chapter, language, title, sections
    FROM content.course_chapters_localized
    WHERE course_id = ${courseId} 
    ${language ? sql`AND language = ${language}` : sql``}
    ${partIndex ? sql`AND part = ${partIndex}` : sql``}
    ORDER BY part, chapter ASC
  `;
};
