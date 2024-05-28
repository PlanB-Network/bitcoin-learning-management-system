import { sql } from '@sovereign-university/database';
import type { CourseUserChapter } from '@sovereign-university/types';

export const insertUserChapter = ({
  uid,
  courseId,
  chapterId,
  booked,
}: {
  uid: string;
  courseId: string;
  chapterId: string;
  booked: boolean;
}) => {
  return sql<CourseUserChapter[]>`
  INSERT INTO users.course_user_chapter (
    uid, course_id, chapter_id, booked
  ) VALUES (
    ${uid}, ${courseId}, ${chapterId}, ${booked}
  )
  ON CONFLICT (uid, course_id, chapter_id) DO UPDATE SET
    booked = EXCLUDED.booked
  RETURNING *;
  `;
};
