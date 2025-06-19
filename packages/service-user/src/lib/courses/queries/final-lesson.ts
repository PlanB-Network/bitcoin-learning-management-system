import { sql } from '@blms/database';

export const withdrawUserFromCourseFinalLesson = ({
  uid,
  courseId,
}: {
  uid: string;
  courseId: string;
}) => {
  return sql`
    UPDATE
      users.course_progress
    SET
      is_selected_for_final_lesson = false
    WHERE
      uid = ${uid}
      AND course_id = ${courseId}
    ;
  `;
};
