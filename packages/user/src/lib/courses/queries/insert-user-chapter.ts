import { sql } from '@sovereign-university/database';
import type { CourseUserChapter } from '@sovereign-university/types';

export const insertUserChapter = ({
  uid,
  courseId,
  chapterId,
  part,
  chapter,
  booked,
}: {
  uid: string;
  courseId: string;
  chapterId: string;
  part: number;
  chapter: number;
  booked: boolean;
}) => {
  return sql<CourseUserChapter[]>`
  INSERT INTO users.course_user_chapter (
    uid, course_id, chapter_id, part, chapter, booked
  ) VALUES (
    ${uid}, ${courseId}, ${chapterId}, ${part}, ${chapter}, ${booked}
  )
  ON CONFLICT (uid, course_id, part, chapter) DO UPDATE SET
    chapter_id = EXCLUDED.chapter_id,
    booked = EXCLUDED.booked
  RETURNING *;
  `;
};
