import type { Dependencies } from '../../../dependencies.js';
import { updateCourseCoupon } from '../queries/update-course-coupon.js';
import {
  updateCoursePaymentQuery,
  updatePaymentInvoiceId,
} from '../queries/update-payment.js';
import { createSendCourseWelcomeEmail } from './send-course-welcome-email.js';

type Options = { id: string } & (
  | { isPaid: true; isExpired: false }
  | { isPaid: false; isExpired: true }
);

export const createUpdateCoursePayment = (dependencies: Dependencies) => {
  return async (options: Options) => {
    const { postgres } = dependencies;

    const coursePayment = await postgres.exec(
      updateCoursePaymentQuery(options),
    );

    if (options.isPaid) {
      await postgres.exec(updateCourseCoupon({ paymentId: options.id }));
    }

    // Send email to user if course payment is validated and course is teacher-led
    if (options.isPaid && coursePayment && coursePayment.length === 1) {
      const courseId = coursePayment[0].courseId;
      const userId = coursePayment[0].uid;

      await createSendCourseWelcomeEmail(dependencies)({
        courseId: courseId,
        userId: userId,
      });
    }

    return coursePayment && coursePayment.length === 1
      ? coursePayment[0]
      : null;
  };
};

interface Options2 {
  intentId: string;
  stripeInvoiceId: string;
  invoiceUrl: string;
}

export const createUpdateCoursePaymentInvoiceId = ({
  postgres,
}: Dependencies) => {
  return async (options: Options2) => {
    const coursePayments = await postgres.exec(updatePaymentInvoiceId(options));
    return coursePayments && coursePayments.length === 1
      ? coursePayments[0]
      : null;
  };
};
