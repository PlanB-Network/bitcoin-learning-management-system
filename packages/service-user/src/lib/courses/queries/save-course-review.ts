import { sql } from '@blms/database';
import type { CourseReview } from '@blms/types';

export const saveCourseReview = ({
  newReview,
}: {
  newReview: CourseReview;
}) => {
  return sql<CourseReview[]>`
  INSERT INTO users.course_review ${sql(newReview)}
  ON CONFLICT (uid, course_id) DO UPDATE SET
    general = EXCLUDED.general,
    length = EXCLUDED.length,
    difficulty = EXCLUDED.difficulty,
    quality = EXCLUDED.quality,
    faithful = EXCLUDED.faithful,
    recommand = EXCLUDED.recommand,
    public_comment = EXCLUDED.public_comment,
    teacher_comment = EXCLUDED.teacher_comment,
    admin_comment = EXCLUDED.admin_comment
  RETURNING *;
  `;
};
