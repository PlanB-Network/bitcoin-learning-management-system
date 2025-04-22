import type { NotificationType } from '@blms/constants';
import { sql } from '@blms/database';

interface Options {
  type: NotificationType;
  content: string;
  scheduledAt: Date;
  timezone: string;
  studentGroup: 'all' | 'summer' | 'assignment';
  courseId: string;
  professorId: string;
}

export const insertScheduledCourseAnnouncementQuery = ({
  type,
  content,
  courseId,
  professorId,
  studentGroup,
  scheduledAt,
  timezone,
}: Options) => {
  return sql<{ id: string }[]>`
        WITH inserted_user_notification AS (
            INSERT INTO users.notifications (content, type, course_id)
            VALUES (${content}, ${type}, ${courseId})
            RETURNING id
        )
        INSERT INTO users.scheduled_course_notifications (
            notification_id,
            professor_id,
            course_id,
            student_group,
            content,
            type,
            scheduled_at,
            timezone
        )
        SELECT
            inserted_user_notification.id,
            ${professorId},
            ${courseId},
            ${studentGroup},
            ${content},
            ${type},
            ${scheduledAt.toUTCString()},
            ${timezone}
        FROM inserted_user_notification
        RETURNING id;
    `;
};
