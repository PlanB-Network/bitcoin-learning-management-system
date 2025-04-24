import type { NotificationType, StudentGroup } from '@blms/constants';
import { sql } from '@blms/database';

interface UpdateOptions {
  id: string;
  type: NotificationType;
  content: string;
  scheduledAt: Date;
  timezone: string;
  studentGroup: StudentGroup;
  courseId: string;
  professorId: string;
}

export const updateScheduledCourseAnnouncementQuery = ({
  id,
  type,
  content,
  courseId,
  professorId,
  studentGroup,
  scheduledAt,
  timezone,
}: UpdateOptions) => {
  return sql<{ id: string }[]>`
        WITH updated_user_notification AS (
            UPDATE users.notifications
            SET content = ${content},
                    type = ${type},
                    course_id = ${courseId}
            WHERE id = (SELECT notification_id FROM users.scheduled_course_notifications WHERE id = ${id})
            RETURNING id
        )
        UPDATE users.scheduled_course_notifications
        SET professor_id = ${professorId},
                course_id = ${courseId},
                student_group = ${studentGroup},
                content = ${content},
                type = ${type},
                scheduled_at = ${scheduledAt.toUTCString()},
                timezone = ${timezone}
        WHERE id = ${id}
        RETURNING id;
    `;
};
