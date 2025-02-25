import {
  createCalculateEventSeats,
  createIndexContent,
  createRefreshCoursesRatings,
} from '@blms/service-content';
import {
  createExamTimestampService,
  createGetPendingCoursePayments,
  createGetPendingEventPayments,
  createGetSbpCheckout,
  createStartCourse,
  createUpdateCoursePayment,
  createUpdateEventPayment,
} from '@blms/service-user';

import type { Dependencies } from '#src/dependencies.js';

export const registerCronTasks = async (ctx: Dependencies) => {
  const timestampService = await createExamTimestampService(ctx);
  const refreshCoursesRatings = createRefreshCoursesRatings(ctx);

  // One time exec - index content in the search engine 30 seconds after the server starts
  {
    const indexContent = createIndexContent(ctx);
    setTimeout(
      () => indexContent([]).catch((error) => console.error(error)),
      30_000,
    );
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
