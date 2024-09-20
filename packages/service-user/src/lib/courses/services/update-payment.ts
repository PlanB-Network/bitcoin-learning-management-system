import type { Dependencies } from '../../../dependencies.js';
import { updateCoupon } from '../queries/update-coupon.js';
import { updatePayment } from '../queries/update-payment.js';

interface Options {
  id: string;
  isPaid: boolean;
  isExpired: boolean;
}

export const createUpdatePayment = ({ postgres }: Dependencies) => {
  return async (options: Options) => {
    await postgres.exec(updatePayment(options));

    if (options.isPaid) {
      await postgres.exec(updateCoupon({ paymentId: options.id }));
    }
  };
};
