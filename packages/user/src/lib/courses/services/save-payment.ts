import axios from 'axios';

import type { Dependencies } from '../../../dependencies.js';
import { insertPayment } from '../queries/insert-payment.js';

export const createSavePayment =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    amount,
  }: {
    uid: string;
    courseId: string;
    amount: number;
  }) => {
    const { postgres } = dependencies;

    const paymentData = {
      title: courseId,
      amount: amount,
      unit: 'sat',
      onChain: true,
      webhook: `${process.env['PUBLIC_PROXY_URL']}/api/users/courses/payment/webhooks`,
    };

    try {
      const { data: checkoutData } = await axios.post<{
        id: string;
        pr: string;
        onChainAddr: string;
        amount: number;
        checkoutUrl: string;
      }>(`https://api.swiss-bitcoin-pay.ch/checkout`, paymentData, {
        headers: {
          'api-key': process.env['SBP_API_KEY'],
        },
      });

      await postgres.exec(
        insertPayment({
          uid,
          courseId,
          paymentStatus: 'pending',
          amount: checkoutData.amount,
          paymentId: checkoutData.id,
          invoiceUrl: checkoutData.checkoutUrl,
        }),
      );

      return checkoutData;
    } catch (error) {
      console.log('Checkout error : ');
      console.log(error);
    }

    throw new Error('Checkout error');
  };
