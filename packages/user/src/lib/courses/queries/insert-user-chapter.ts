import { sql } from '@sovereign-university/database';
import type { CourseUserChapter } from '@sovereign-university/types';

export const insertUserChapter = ({
  uid,
  courseId,
  part,
  chapter,
  booked,
}: {
  uid: string;
  courseId: string;
  part: number;
  chapter: number;
  booked: boolean;
}) => {
  return sql<CourseUserChapter[]>`
  INSERT INTO users.course_user_chapter (
    uid, course_id, part, chapter, booked
  ) VALUES (
    ${uid}, ${courseId}, ${part}, ${chapter}, ${booked}
  )
  ON CONFLICT (uid, course_id, part, chapter) DO UPDATE SET
    booked = EXCLUDED.booked
  RETURNING *;
  `;
};
