import type { NotificationType } from '@blms/constants';
import { sql } from '@blms/database';
import type { JoinedUserNotification } from '@blms/types';

export const getExistingNotificationsQuery = (
  type: NotificationType,
  chapterId?: string,
  eventId?: string,
  blogId?: string,
) => {
  return sql<JoinedUserNotification[]>`
    SELECT
      n.id,
      n.content,
      n.type,
      n.course_id,
      n.chapter_id,
      n.event_id,
      n.blog_id
    FROM users.notifications n
    WHERE n.type = ${type}
      ${chapterId ? sql`AND n.chapter_id = ${chapterId}` : sql``}
      ${eventId ? sql`AND n.event_id = ${eventId}` : sql``}
      ${blogId ? sql`AND n.blog_id = ${blogId}` : sql``}
  `;
};
