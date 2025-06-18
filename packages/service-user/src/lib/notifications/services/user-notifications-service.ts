import { sql } from '@blms/database';
import type { Dependencies } from '#src/dependencies.js';

export const createUserNotificationsService = async (ctx: Dependencies) => {
  const getAllUids = async () => {
    const result = await ctx.postgres.exec(
      sql`
        SELECT uid
        FROM users.accounts;
        `,
    );
    return result.map((row) => row.uid);
  };

  const getUidsByCourse = async (
    courseId: string,
    hasCoursePlatformNotificationEnabled?: boolean,
    isSelectedForAssignment?: boolean,
    isSelectedForFinalLesson?: boolean,
  ) => {
    const result = await ctx.postgres.exec(
      sql`
        SELECT cp.uid
        FROM users.course_progress cp
        JOIN users.account_settings uas ON cp.uid = uas.uid
        WHERE cp.course_id = ${courseId}
        ${hasCoursePlatformNotificationEnabled ? sql`AND uas.platform_notify_courses = TRUE` : sql``}
        ${isSelectedForAssignment ? sql`AND cp.is_selected_for_assignment = TRUE` : sql``}
        ${isSelectedForFinalLesson ? sql`AND cp.is_selected_for_final_lesson = TRUE` : sql``}
        `,
    );
    return result.map((row) => row.uid);
  };

  const getUidsByEvent = async (eventId: string) => {
    const bookedEventsUids = await ctx.postgres
      .exec(
        sql`
        SELECT ue.uid
        FROM users.user_event ue
        JOIN users.account_settings uas ON ue.uid = uas.uid
        WHERE ue.event_id = ${eventId}
        AND ue.booked = TRUE
        AND uas.platform_notify_events = TRUE
        `,
      )
      .then((result) => {
        return result.map((row) => row.uid);
      });

    const paidEventsUids = await ctx.postgres
      .exec(
        sql`
      SELECT ep.uid
      FROM users.event_payment ep
      JOIN users.account_settings uas ON ep.uid = uas.uid
      WHERE ep.event_id = ${eventId}
      AND ep.payment_status = 'paid'
      AND uas.platform_notify_events = TRUE
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
