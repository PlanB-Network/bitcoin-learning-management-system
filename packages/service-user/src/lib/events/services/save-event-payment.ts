import type { CheckoutData } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { insertEventPayment } from '../queries/insert-event-payment.js';

interface Options {
  uid: string;
  eventId: string;
  amount: number;
  withPhysical: boolean;
}

export const createSaveEventPayment = ({ postgres }: Dependencies) => {
  return async ({ uid, eventId, amount, withPhysical }: Options) => {
    const paymentData = {
      title: eventId,
      amount: amount,
      unit: 'sat',
      onChain: true,
      webhook: `${process.env['PUBLIC_PROXY_URL']}/users/events/payment/webhooks`,
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

      const checkoutData = (await response.json()) as CheckoutData;

      await postgres.exec(
        insertEventPayment({
          uid,
          eventId,
          paymentStatus: 'pending',
          amount: checkoutData.amount,
          paymentId: checkoutData.id,
          invoiceUrl: checkoutData.checkoutUrl,
          withPhysical: withPhysical,
        }),
      );

      return checkoutData;
    } catch (error) {
      console.log('Checkout error : ');
      console.log(error);
    }

    throw new Error('Checkout error');
  };
};
