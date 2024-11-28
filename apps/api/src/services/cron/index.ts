import {
  createCalculateEventSeats,
  createRefreshCoursesRatings,
} from '@blms/service-content';
import {
  createExamTimestampService,
  createGetCheckout,
  createGetPendingPayments,
  createUpdateEventPayment,
} from '@blms/service-user';

import type { Dependencies } from '#src/dependencies.js';

export const registerCronTasks = async (ctx: Dependencies) => {
  const timestampService = await createExamTimestampService(ctx);
  const refreshCoursesRatings = createRefreshCoursesRatings(ctx);

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
    const getCheckout = createGetCheckout(ctx);
    const getPendingPayments = createGetPendingPayments(ctx);
    const updateEventPayment = createUpdateEventPayment(ctx);
    const calculateEventSeats = createCalculateEventSeats(ctx);
    ctx.crons.addTask('1m', async () => {
      const payments = await getPendingPayments();

      for (const payment of payments) {
        const status = await getCheckout(payment.paymentId);

        await updateEventPayment(status);

        if (status.isPaid) {
          await calculateEventSeats();
        }
      }
    });
  }
};
