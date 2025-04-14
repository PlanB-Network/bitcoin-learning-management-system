import { sql } from '@blms/database';

interface Options {
  uid: string;
  notificationIds: string[];
}

export const markUserNotificationsAsReadQuery = ({
  notificationIds,
  uid,
}: Options) => {
  return sql`
        UPDATE users.user_notification_status
        SET read_date = NOW()
        WHERE uid = ${uid}
        AND notification_id IN (${notificationIds.map((id, i) =>
          i === 0 ? sql`${id}` : sql`, ${id}`,
        )})
        AND read_date IS NULL
    `;
};
