import { sql } from '@blms/database';

export const publishScheduledCourseAnnouncementQuery = ({
  scheduledAnnouncementId,
}: { scheduledAnnouncementId: string }) => {
  return sql<{ id: string; notificationId: string }[]>`
        WITH scheduled_data AS (
            SELECT notification_id, course_id, id AS scheduled_id, student_group
            FROM users.scheduled_course_notifications
            WHERE id = ${scheduledAnnouncementId}
            AND is_published = false
            FOR UPDATE
        ),
        users_to_notify AS (
            SELECT cp.uid, sd.notification_id, sd.scheduled_id
            FROM users.course_progress cp
            JOIN scheduled_data sd ON cp.course_id = sd.course_id
            JOIN users.account_settings uas ON cp.uid = uas.uid
            WHERE uas.platform_notify_courses = true
            AND (
                sd.student_group = 'all'
                OR (sd.student_group = 'assignment' AND cp.is_selected_for_assignment = true)
                OR (sd.student_group = 'summer' AND cp.is_selected_for_final_lesson = true)
            )
        ),
        inserted_status AS (
            INSERT INTO users.user_notification_status (uid, notification_id, created_at)
            SELECT uid, notification_id, NOW()
            FROM users_to_notify
            ON CONFLICT (uid, notification_id) DO NOTHING
            RETURNING uid
        )
        UPDATE users.scheduled_course_notifications usn
        SET is_published = true, updated_at = NOW()
        FROM scheduled_data
        WHERE usn.id = scheduled_data.scheduled_id
        RETURNING usn.id, usn.notification_id;
    `;
};
