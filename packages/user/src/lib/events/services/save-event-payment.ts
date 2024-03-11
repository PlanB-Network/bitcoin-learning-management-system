import axios from 'axios';

import type { Dependencies } from '../../../dependencies.js';
import { insertEventPayment } from '../queries/insert-event-payment.js';

export const createSaveEventPayment =
  (dependencies: Dependencies) =>
  async ({
    uid,
    eventId,
    amount,
  }: {
    uid: string;
    eventId: string;
    amount: number;
  }) => {
    const { postgres } = dependencies;

    const paymentData = {
      title: eventId,
      amount: amount,
      unit: 'sat',
      onChain: true,
      webhook: `${process.env['PUBLIC_PROXY_URL']}/users/events/payment/webhooks`,
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
        insertEventPayment({
          uid,
          eventId,
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
