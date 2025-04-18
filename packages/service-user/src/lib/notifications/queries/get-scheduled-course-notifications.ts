import { sql } from '@blms/database';
import type { ScheduledCourseNotification } from '@blms/types';

interface Options {
  courseId: string;
  isPublishedOnly?: boolean;
}

export const getScheduledCourseNotificationsQuery = ({
  courseId,
  isPublishedOnly = true,
}: Options) => {
  return sql<ScheduledCourseNotification[]>`
    SELECT
        id,
        notification_id,
        professor_id,
        course_id,
        student_group,
        content,
        type,
        scheduled_at,
        timezone,
        is_published,
        created_at,
        updated_at
    FROM users.scheduled_course_notifications
    WHERE course_id = ${courseId}
    ${isPublishedOnly ? sql`AND is_published = true` : sql``}

    ORDER BY scheduled_at DESC, created_at DESC;
  `;
};
