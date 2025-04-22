import { sql } from '@blms/database';
import type { ScheduledCourseAnnouncement } from '@blms/types';

interface Options {
  courseId: string;
  isPublishedOnly?: boolean;
}

export const getScheduledCourseAnnouncementsQuery = ({
  courseId,
  isPublishedOnly = true,
}: Options) => {
  return sql<ScheduledCourseAnnouncement[]>`
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

    ORDER BY scheduled_at ASC;
  `;
};
