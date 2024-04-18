import { v4 as uuidv4 } from 'uuid';

import type { Dependencies } from '../../../dependencies.js';
import { insertPayment } from '../queries/insert-payment.js';
import { updateCoupon } from '../queries/update-coupon.js';

export const createSaveFreePayment =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    couponCode,
  }: {
    uid: string;
    courseId: string;
    couponCode?: string;
  }) => {
    const { postgres } = dependencies;

    try {
      const randomUUID = uuidv4();

      const payment = await postgres.exec(
        insertPayment({
          uid,
          courseId,
          paymentStatus: 'paid',
          amount: 0,
          paymentId: randomUUID,
          invoiceUrl: '',
          couponCode: couponCode,
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
