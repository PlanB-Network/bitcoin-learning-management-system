import type { NotificationType } from '@blms/constants';
import { sql } from '@blms/database';

type Options = {
  uids: string[];
  type: NotificationType;
  content?: string;
  courseId?: string;
  chapterId?: string;
  eventId?: string;
  blogId?: string;
};

export const insertUserNotificationsQuery = ({
  uids,
  type,
  content,
  courseId,
  chapterId,
  blogId,
  eventId,
}: Options) => {
  return sql`
    WITH inserted_notification AS (
      INSERT INTO users.notifications (content, type, course_id, chapter_id, event_id, blog_id)
      VALUES (${content || null}, ${type}, ${courseId || null}, ${chapterId || null}, ${eventId || null}, ${blogId || null})
      RETURNING id
    )
    INSERT INTO users.user_notification_status (uid, notification_id, created_at)
    SELECT
      uid,
      (SELECT id FROM inserted_notification),
      NOW()
    FROM unnest(${uids}::uuid[]) AS uid;
  `;
};
