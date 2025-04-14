import {
  createCalculateEventSeats,
  createGetCourseChapters,
  createGetPlanBSchoolCoursesIds,
  createIndexContent,
  createRefreshCoursesRatings,
} from '@blms/service-content';
import {
  createExamTimestampService,
  createGetPendingCoursePayments,
  createGetPendingEventPayments,
  createGetSbpCheckout,
  createInsertUserNotifications,
  createStartCourse,
  createUpdateCoursePayment,
  createUpdateEventPayment,
  createUserNotificationsService,
} from '@blms/service-user';

import { NotificationType } from '@blms/constants';
import type { Dependencies } from '#src/dependencies.js';

export const registerCronTasks = async (ctx: Dependencies) => {
  const timestampService = await createExamTimestampService(ctx);
  const userNotificationsService = await createUserNotificationsService(ctx);
  const refreshCoursesRatings = createRefreshCoursesRatings(ctx);

  // One time exec - index content in the search engine 30 seconds after the server starts
  {
    const indexContent = createIndexContent(ctx);
    setTimeout(
      () => indexContent([]).catch((error) => console.error(error)),
      30_000,
    );
  }

  // Every minute, check before sending automated notifications to Plan B School students
  {
    const getPlanBSchoolCoursesIds = createGetPlanBSchoolCoursesIds(ctx);
    const getCourseChapters = createGetCourseChapters(ctx);
    const insertUserNotifications = createInsertUserNotifications(ctx);

    ctx.crons.addTask('1m', async () => {
      const planBSchoolCoursesIds = await getPlanBSchoolCoursesIds();
      if (planBSchoolCoursesIds.length === 0) return;

      const now = new Date();
      const notificationStartDate = new Date(
        now.getTime() + 20 * 60 * 60 * 1000,
      );
      const notificationEndDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const startingSoonDate = new Date(now.getTime() + 5 * 60 * 1000);

      for (const courseId of planBSchoolCoursesIds) {
        const chapters = await getCourseChapters(courseId);
        if (chapters.length === 0) continue;

        const chaptersInNotificationWindow = chapters.filter((chapter) => {
          if (!chapter.startDate) return false;
          const startDate = new Date(chapter.startDate);
          return (
            startDate >= notificationStartDate &&
            startDate <= notificationEndDate
          );
        });

        const chaptersStartingSoon = chapters.filter((chapter) => {
          if (!chapter.startDate) return false;
          const startDate = new Date(chapter.startDate);
          return startDate > now && startDate <= startingSoonDate;
        });

        if (chaptersInNotificationWindow.length > 0) {
          const uids = await userNotificationsService.getUidsByCourse(courseId);
          if (uids.length === 0) continue;

          const chapter = chaptersInNotificationWindow[0];
          if (!chapter.startDate) continue;

          await insertUserNotifications({
            uids,
            courseId,
            chapterId: chapter.chapterId,
            type: NotificationType.Calendar24HoursCourse,
          });
        }

        if (chaptersStartingSoon.length > 0) {
          const uids = await userNotificationsService.getUidsByCourse(courseId);
          if (uids.length === 0) continue;

          const chapter = chaptersStartingSoon[0];
          if (!chapter.startDate) continue;

          await insertUserNotifications({
            uids,
            courseId,
            chapterId: chapter.chapterId,
            type: NotificationType.Calendar5MinutesCourse,
          });
        }
      }
    });
  }

  if (timestampService) {
    // Every five minutes
    ctx.crons.addTask('5m', () => refreshCoursesRatings());
    ctx.crons.addTask('5m', () => timestampService.timestampAllExams());
    ctx.crons.addTask('5m', () => timestampService.upgradeAllTimeStamps());
    ctx.crons.addTask('5m', () => timestampService.validateAllTimeStamps());
    ctx.crons.addTask('5m', () => timestampService.generateAllCertificates());
    ctx.crons.addTask('5m', () => timestampService.generateAllThumbnails());
  }

  // Poll swiss bitcoin pay payments status
  // This is useful for payments that are
  // not confirmed from webhook (missed or failed)
  {
    const getCheckout = createGetSbpCheckout(ctx);
    const getPendingCoursePayments = createGetPendingCoursePayments(ctx);
    const getPendingEventsPayments = createGetPendingEventPayments(ctx);
    const updateEventPayment = createUpdateEventPayment(ctx);
    const updateCoursePayment = createUpdateCoursePayment(ctx);
    const calculateEventSeats = createCalculateEventSeats(ctx);
    const startCourse = createStartCourse(ctx);

    ctx.crons.addTask('1m', async () => {
      // Events payments
      {
        let refreshEventsSeats = false;
        const payments = await getPendingEventsPayments();

        for (const payment of payments) {
          console.log('[Cron] Refreshing event payment', payment.paymentId);
          const status = await getCheckout(payment.paymentId);
          if (!status.isPaid && !status.isExpired) {
            continue;
          }

          await updateEventPayment(status);
          refreshEventsSeats ||= status.isPaid;
        }

        if (refreshEventsSeats) {
          await calculateEventSeats();
        }
      }

      // Courses payments
      {
        const payments = await getPendingCoursePayments();

        for (const payment of payments) {
          console.log('[Cron] Refreshing course payment', payment.paymentId);
          const status = await getCheckout(payment.paymentId);
          if (!status.isPaid && !status.isExpired) {
            continue;
          }

          const coursePayment = await updateCoursePayment(status);

          if (coursePayment) {
            await startCourse({
              courseId: coursePayment.courseId,
              uid: coursePayment.uid,
            });
          }
        }
      }
    });
  }
};
