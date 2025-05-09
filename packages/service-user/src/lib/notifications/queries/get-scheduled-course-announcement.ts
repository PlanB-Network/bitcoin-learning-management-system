import { sql } from '@blms/database';
import type { ScheduledCourseAnnouncement } from '@blms/types';

interface Options {
  announcementId: string;
}

export const getPublishedScheduledCourseAnnouncementByIdQuery = ({
  announcementId,
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
    WHERE id = ${announcementId}
    AND is_published = true
  `;
};
