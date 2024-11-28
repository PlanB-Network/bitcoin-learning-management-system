import type { Dependencies } from '../../../dependencies.js';
import { updateCourseCoupon } from '../queries/update-course-coupon.js';
import {
  updateCoursePaymentQuery,
  updatePaymentInvoiceId,
} from '../queries/update-payment.js';

type Options = { id: string } & (
  | { isPaid: true; isExpired: false }
  | { isPaid: false; isExpired: true }
);

export const createUpdateCoursePayment = ({ postgres }: Dependencies) => {
  return async (options: Options) => {
    await postgres.exec(updateCoursePaymentQuery(options));

    if (options.isPaid) {
      await postgres.exec(updateCourseCoupon({ paymentId: options.id }));
    }
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
    await postgres.exec(updatePaymentInvoiceId(options));
  };
};
