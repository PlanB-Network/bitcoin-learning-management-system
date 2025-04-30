import {
  createCalculateEventSeats,
  // createGetBlogs,
  createGetCourseChapters,
  createGetCourses,
  createGetCoursesIds,
  createGetUpcomingEventsInfos,
  createIndexContent,
  createRefreshCoursesRatings,
} from '@blms/service-content';
import {
  createExamTimestampService,
  createGetPendingCoursePayments,
  createGetPendingEventPayments,
  createGetSbpCheckout,
  createInsertUserNotifications,
  createPublishScheduledCourseAnnouncement,
  createSendCourseWeeklyRecapEmail,
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

  // Every 5 minutes, check before sending automated notifications to students from courses with live/in-person chapters'
  {
    const getCoursesIds = createGetCoursesIds(ctx);
    const getCourseChapters = createGetCourseChapters(ctx);
    const insertUserNotifications = createInsertUserNotifications(ctx);

    ctx.crons.addTask('5m', async () => {
      const coursesId = await getCoursesIds();
      if (coursesId.length === 0) return;

      const now = new Date();
      const notificationStartDate = new Date(
        now.getTime() + 20 * 60 * 60 * 1000,
      );
      const notificationEndDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const startingSoonDate = new Date(now.getTime() + 5 * 60 * 1000);

      for (const courseId of coursesId) {
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

          for (const chapter of chaptersInNotificationWindow) {
            if (!chapter.startDate) continue;

            await insertUserNotifications({
              uids,
              courseId,
              chapterId: chapter.chapterId,
              type: NotificationType.Calendar24HoursCourse,
            });
          }
        }

        if (chaptersStartingSoon.length > 0) {
          const uids = await userNotificationsService.getUidsByCourse(courseId);
          if (uids.length === 0) continue;

          for (const chapter of chaptersStartingSoon) {
            if (!chapter.startDate) continue;

            await insertUserNotifications({
              uids,
              courseId,
              chapterId: chapter.chapterId,
              type: NotificationType.Calendar5MinutesCourse,
            });
          }
        }
      }
    });

    // Every week (Sunday at 6pm), send a weekly recap of the upcoming week to Plan B School enrolled students
    // Only send a mail if there are chapters starting in the next 7 days
    {
      const getCourses = createGetCourses(ctx);
      const getCourseChapters = createGetCourseChapters(ctx);
      const sendCourseWeeklyRecapEmail = createSendCourseWeeklyRecapEmail(ctx);

      ctx.crons.addTask('sun6pm', async () => {
        const courses = await getCourses('en');
        if (getCourses.length === 0) return;

        const now = new Date();

        for (const course of courses) {
          if (!course.isPlanbSchool) continue;

          const chapters = await getCourseChapters(course.id, 'en');
          if (chapters.length === 0) continue;

          const chaptersStartingSoon = chapters.filter((chapter) => {
            if (!chapter.startDate) return false;
            const startDate = new Date(chapter.startDate);
            return (
              startDate > now &&
              startDate.getTime() <= now.getTime() + 7 * 24 * 60 * 60 * 1000
            );
          });

          if (chaptersStartingSoon.length > 0) {
            const uids = await userNotificationsService.getUidsByCourse(
              course.id,
            );
            if (uids.length === 0) continue;

            for (const uid of uids) {
              await sendCourseWeeklyRecapEmail({
                userId: uid,
                course: course,
                courseChapters: chaptersStartingSoon,
              });
            }
          }
        }
      });
    }
  }

  // Every 5 minutes, check for online events that are starting in 48 hours / 5 minutes OR inperson events starting in 24 hours and send a notification to people who booked these events
  {
    const getUpcomingEventsInfos = createGetUpcomingEventsInfos(ctx);
    const insertUserNotifications = createInsertUserNotifications(ctx);

    ctx.crons.addTask('5m', async () => {
      const now = new Date();

      const upcomingEvents = await getUpcomingEventsInfos();
      if (upcomingEvents.length === 0) return;

      // Online events starting in 48-44 hours
      const onlineEvents48h = upcomingEvents.filter((event) => {
        if (!event.startDate || !event.bookOnline) return false;
        const startDate = new Date(event.startDate);

        const timeToEvent = startDate.getTime() - now.getTime();
        return (
          timeToEvent >= 44 * 60 * 60 * 1000 &&
          timeToEvent <= 48 * 60 * 60 * 1000
        );
      });

      for (const event of onlineEvents48h) {
        const uids = await userNotificationsService.getUidsByEvent(event.id);
        if (uids.length === 0) continue;

        await insertUserNotifications({
          uids,
          eventId: event.id,
          type: NotificationType.Calendar48HoursOnlineEvent,
        });
      }

      // online events starting in less than 5 minutes
      const onlineEvents5m = upcomingEvents.filter((event) => {
        if (!event.startDate || !event.bookOnline) return false;
        const startDate = new Date(event.startDate);
        return (
          startDate > now &&
          startDate.getTime() <= now.getTime() + 5 * 60 * 1000
        );
      });

      for (const event of onlineEvents5m) {
        const uids = await userNotificationsService.getUidsByEvent(event.id);
        if (uids.length === 0) continue;

        await insertUserNotifications({
          uids,
          eventId: event.id,
          type: NotificationType.Calendar5MinutesOnlineEvent,
        });
      }

      // in-person events starting in 24-20 hours
      const inPersonEvents24h = upcomingEvents.filter((event) => {
        if (!event.startDate || !event.bookInPerson) return false;
        const startDate = new Date(event.startDate);

        const timeToEvent = startDate.getTime() - now.getTime();
        return (
          timeToEvent >= 20 * 60 * 60 * 1000 &&
          timeToEvent <= 24 * 60 * 60 * 1000
        );
      });

      for (const event of inPersonEvents24h) {
        const uids = await userNotificationsService.getUidsByEvent(event.id);
        if (uids.length === 0) continue;

        await insertUserNotifications({
          uids,
          eventId: event.id,
          type: NotificationType.Calendar24HoursInPersonEvent,
        });
      }
    });
  }

  // Every hour, check for newly created blog posts and send a notification to all users -- OFF until we figure out a solution for untranslated blogs
  // {
  //   const getBlogs = createGetBlogs(ctx);
  //   const insertUserNotifications = createInsertUserNotifications(ctx);

  //   ctx.crons.addTask('h', async () => {
  //     const blogs = await getBlogs();
  //     if (blogs.length === 0) return;

  //     const now = new Date();
  //     const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  //     for (const blog of blogs) {
  //       if (!blog.createdAt) continue;
  //       const blogCreationDate = new Date(blog.createdAt);
  //       if (blogCreationDate < oneDayAgo) continue;

  //       const uids = await userNotificationsService.getAllUids();
  //       if (uids.length === 0) continue;

  //       await insertUserNotifications({
  //         uids,
  //         blogId: blog.id,
  //         type: NotificationType.Blog,
  //       });
  //     }
  //   });
  // }

  // Every 5 minutes, check for newly created course announcements and send a notification to enrolled students
  {
    const publishCourseAnnouncement =
      createPublishScheduledCourseAnnouncement(ctx);

    ctx.crons.addTask('5m', async () => {
      const unpublishedCourseAnnouncementsIds =
        await userNotificationsService.getUnpublishedCourseAnnouncementsIds();

      for (const id of unpublishedCourseAnnouncementsIds) {
        await publishCourseAnnouncement({
          scheduledAnnouncementId: id,
        });
      }
    });
  }

  // Once a day, check for read notifications that are older than 30 days and delete them
  ctx.crons.addTask('d', async () => {
    await userNotificationsService.deleteOldReadNotifications();
  });

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
