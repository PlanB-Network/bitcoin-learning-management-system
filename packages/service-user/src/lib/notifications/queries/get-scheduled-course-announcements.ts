import { sql } from '@blms/database';
import type { ScheduledCourseAnnouncement } from '@blms/types';

interface Options {
  courseId: string;
  isPublishedOnly?: boolean;
  isProfessor?: boolean;
}

export const getScheduledCourseAnnouncementsQuery = ({
  courseId,
  isPublishedOnly = true,
  isProfessor = false,
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
    ${!isProfessor ? sql`AND student_group = 'all'` : sql``}
    ${isPublishedOnly ? sql`AND is_published = true` : sql``}

    ORDER BY scheduled_at ASC;
  `;
};
