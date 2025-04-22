import { sql } from '@blms/database';
import type { Dependencies } from '#src/dependencies.js';

export const createUserNotificationsService = async (ctx: Dependencies) => {
  const getAllUids = () => {
    return ctx.postgres
      .exec(
        sql`
        SELECT uid
        FROM users.accounts;
        `,
      )
      .then((result) => {
        return result.map((row) => row.uid);
      });
  };

  const getUidsByCourse = (courseId: string) => {
    return ctx.postgres
      .exec(
        sql`
        SELECT uid
        FROM users.course_progress
        WHERE course_id = ${courseId};
        `,
      )
      .then((result) => {
        return result.map((row) => row.uid);
      });
  };

  const getUidsByEvent = async (eventId: string) => {
    const bookedEventsUids = await ctx.postgres
      .exec(
        sql`
        SELECT uid
        FROM users.user_event
        WHERE event_id = ${eventId}
        AND booked = TRUE
        `,
      )
      .then((result) => {
        return result.map((row) => row.uid);
      });

    const paidEventsUids = await ctx.postgres
      .exec(
        sql`
        SELECT uid
        FROM users.event_payment
        WHERE event_id = ${eventId}
        AND payment_status = 'paid'
        `,
      )
      .then((result) => {
        return result.map((row) => row.uid);
      });

    // Ensure unique uids
    const uniqueUids = new Set<string>();
    for (const uid of bookedEventsUids) {
      uniqueUids.add(uid);
    }
    for (const uid of paidEventsUids) {
      uniqueUids.add(uid);
    }
    return Array.from(uniqueUids);
  };

  const getUnpublishedCourseAnnouncementsIds = async () => {
    return ctx.postgres
      .exec(
        sql`
        SELECT id
        FROM users.scheduled_course_notifications
        WHERE is_published = false
        AND scheduled_at <= NOW();
        `,
      )
      .then((result) => {
        return result.map((row) => row.id);
      });
  };

  const deleteOldReadNotifications = async () => {
    return ctx.postgres
      .exec(sql`
      DELETE FROM users.user_notification_status
      WHERE read_date < NOW() - INTERVAL '30 days';
    `)
      .then(() => true);
  };

  return {
    getAllUids,
    getUidsByCourse,
    getUidsByEvent,
    getUnpublishedCourseAnnouncementsIds,
    deleteOldReadNotifications,
  };
};
