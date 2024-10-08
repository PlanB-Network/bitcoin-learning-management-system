import type { CheckoutData } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { insertPayment } from '../queries/insert-payment.js';

interface Options {
  uid: string;
  courseId: string;
  amount: number;
  couponCode?: string;
  format: string;
}

export const createSavePayment = ({ postgres }: Dependencies) => {
  return async ({ uid, courseId, amount, couponCode, format }: Options) => {
    const paymentData = {
      title: courseId,
      amount: amount,
      unit: 'sat',
      onChain: true,
      webhook: `${process.env['PUBLIC_PROXY_URL']}/users/courses/payment/webhooks`,
    };
    const headers = new Headers({
      'Content-Type': 'application/json',
      'api-key': process.env['SBP_API_KEY'] || '',
    });

    try {
      const response = await fetch(
        `https://api.swiss-bitcoin-pay.ch/checkout`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(paymentData),
        },
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const checkoutData = (await response.json()) as CheckoutData;

      await postgres.exec(
        insertPayment({
          uid,
          courseId,
          paymentStatus: 'pending',
          format: format,
          amount: checkoutData.amount,
          paymentId: checkoutData.id,
          invoiceUrl: checkoutData.checkoutUrl,
          couponCode: couponCode,
        }),
      );

      return checkoutData;
    } catch (error) {
      console.log('Checkout error : ');
      console.log(error);
      throw new Error('Checkout error');
    }
  };
};
