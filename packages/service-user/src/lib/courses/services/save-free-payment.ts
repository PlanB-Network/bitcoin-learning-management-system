import { v4 as uuidv4 } from 'uuid';

import type { CheckoutData } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { insertPayment } from '../queries/insert-payment.js';
import { updateCoupon } from '../queries/update-coupon.js';

interface Options {
  uid: string;
  courseId: string;
  couponCode?: string;
}

export const createSaveFreePayment = ({ postgres }: Dependencies) => {
  return async (opts: Options): Promise<CheckoutData> => {
    try {
      const randomUUID = uuidv4();

      const payment = await postgres.exec(
        insertPayment({
          paymentStatus: 'paid',
          amount: 0,
          paymentId: randomUUID,
          invoiceUrl: '',
          ...opts,
        }),
      );

      if (payment && payment.length > 0) {
        await postgres.exec(
          updateCoupon({
            paymentId: payment[0].paymentId,
          }),
        );
      }

      return {
        id: '',
        pr: '',
        onChainAddr: '',
        amount: 0,
        checkoutUrl: '',
      };
    } catch (error) {
      console.log(error);
    }

    throw new Error('createSaveFreePayment error');
  };
};
