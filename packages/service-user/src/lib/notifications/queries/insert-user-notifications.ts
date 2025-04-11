import type { NotificationType } from '@blms/constants';
import { sql } from '@blms/database';

type Options = {
  uids: string[];
  type: NotificationType;
  content: string;
  courseId?: string;
  chapterId?: string;
  eventId?: string;
};

// TODO: Check for error (probably in unnest)

export const insertUserNotificationsQuery = ({
  uids,
  type,
  content,
  courseId,
  chapterId,
  eventId,
}: Options) => {
  return sql`
    WITH inserted_notification AS (
      INSERT INTO users.notifications (content, type, course_id, chapter_id, event_id)
      VALUES (${content}, ${type}, ${courseId || null}, ${chapterId || null}, ${eventId || null})
      RETURNING id
    )
    INSERT INTO users.user_notification_status (uid, notification_id, created_at)
    SELECT
      uid,
      (SELECT id FROM inserted_notification),
      NOW()
    FROM unnest(${sql(uids)}) AS uid;
  `;
};
