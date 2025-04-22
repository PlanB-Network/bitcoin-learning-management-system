import { sql } from '@blms/database';

interface DeleteOptions {
  id: string;
}

export const deleteScheduledCourseAnnouncementQuery = ({
  id,
}: DeleteOptions) => {
  return sql<{ id: string }[]>`
                WITH deleted_user_notification AS (
                        DELETE FROM users.notifications
                        WHERE id = (SELECT notification_id FROM users.scheduled_course_notifications WHERE id = ${id})
                        RETURNING id
                )
                DELETE FROM users.scheduled_course_notifications
                WHERE id = ${id}
                RETURNING id;
        `;
};
