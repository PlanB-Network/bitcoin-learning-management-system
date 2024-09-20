import { sql } from '@blms/database';
import type { JoinedCourseChapterWithContent } from '@blms/types';

type CourseChapterMeta = Pick<
  JoinedCourseChapterWithContent,
  | 'courseId'
  | 'partId'
  | 'chapterId'
  | 'language'
  | 'title'
  | 'sections'
  | 'releasePlace'
  | 'rawContent'
  | 'liveLanguage'
  | 'lastCommit'
>;

export const getCourseChapterMetaQuery = (
  chapterId: string,
  language?: string,
) => {
  return sql<CourseChapterMeta[]>`
    SELECT
      cl.course_id,
      cl.chapter_id,
      language,
      title,
      sections,
      release_place,
      raw_content,
      live_language,
      c.last_commit
    FROM content.course_chapters_localized cl
    JOIN content.courses c ON c.id = cl.course_id
    WHERE
      cl.chapter_id = ${chapterId}
    ${language ? sql`AND cl.language = ${language}` : sql``}
  `;
};
