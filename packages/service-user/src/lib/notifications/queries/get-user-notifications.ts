import { sql } from '@blms/database';
import type { JoinedUserNotification } from '@blms/types';

export const getUserNotificationsQuery = (uid: string) => {
  return sql<JoinedUserNotification[]>`
    SELECT
      n.id,
      n.content,
      n.type,
      n.course_id,
      n.chapter_id,
      n.event_id,
      uns.created_at,
      uns.read_date
    FROM users.user_notification_status uns
    INNER JOIN users.notifications n
      ON n.id = uns.notification_id
    WHERE uns.uid = ${uid};
  `;
};
