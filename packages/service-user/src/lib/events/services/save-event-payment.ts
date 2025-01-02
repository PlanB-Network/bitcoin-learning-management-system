import { v4 as uuidv4 } from 'uuid';

import { firstRow, sql } from '@blms/database';
import type { CouponCode, Event } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import {
  checkSatsPrice,
  createSbpPayment,
  createStripePayment,
} from '../../payments/services/payment-service.js';
import { insertEventPayment } from '../queries/insert-event-payment.js';
import { updateEventCoupon } from '../queries/update-event-coupon.js';
import { updateEventPaymentQuery } from '../queries/update-event-payment.js';

interface Options {
  uid: string;
  eventId: string;
  satsPrice: number;
  dollarPrice: number;
  method: string;
  couponCode?: string;
  withPhysical: boolean;
}

export const createSaveEventPayment = (dependencies: Dependencies) => {
  const { postgres, config, stripe } = dependencies;

  const sbpPayment = createSbpPayment(config.swissBitcoinPay);
  const stripePayment = createStripePayment({ stripe });

  return async ({
    uid,
    eventId,
    satsPrice,
    dollarPrice,
    method,
    couponCode,
    withPhysical,
  }: Options) => {
    const event = await postgres
      .exec(sql<Event[]>`SELECT * FROM content.events WHERE id = ${eventId}`)
      .then(firstRow);

    if (!event || !event.priceDollars) {
      throw new Error(`Event ${eventId} is missing`);
    }

    let eventPriceInDollars = event.priceDollars;

    if (couponCode) {
      const coupon = await postgres
        .exec(
          sql<
            CouponCode[]
          >`SELECT * FROM content.coupon_code WHERE code = ${couponCode} AND item_id = ${eventId} and (is_used = false OR is_unique = false)`,
        )
        .then(firstRow);

      if (!coupon || !coupon.reductionPercentage) {
        throw new Error(
          `Coupon code ${coupon} does not exist or is already used`,
        );
      }

      eventPriceInDollars = Math.ceil(
        (event.priceDollars * (100 - coupon.reductionPercentage)) / 100,
      );
    }

    if (eventPriceInDollars !== dollarPrice) {
      throw new Error('Price is not the correct one');
    }

    if (eventPriceInDollars === 0) {
      const randomUUID = uuidv4();

      const payment = await postgres.exec(
        insertEventPayment({
          eventId: eventId,
          withPhysical: withPhysical,
          uid: uid,
          couponCode: couponCode,
          paymentStatus: 'paid',
          amount: 0,
          paymentId: randomUUID,
          method: 'free',
          invoiceUrl: '',
        }),
      );

      if (payment && payment.length > 0) {
        await postgres.exec(
          updateEventCoupon({
            paymentId: payment[0].paymentId,
          }),
        );
      }
    }

    if (method === 'sbp') {
      await checkSatsPrice(dollarPrice, satsPrice);
    }

    if (method === 'sbp') {
      const checkoutData = await sbpPayment(eventId, satsPrice, 'events');

      await postgres.exec(
        insertEventPayment({
          uid,
          eventId,
          paymentStatus: 'pending',
          amount: checkoutData.amount,
          paymentId: checkoutData.id,
          invoiceUrl: checkoutData.checkoutUrl,
          method,
          withPhysical,
        }),
      );

      return checkoutData;
    } else if (method === 'stripe') {
      const paymentId = uuidv4();
      const session = await stripePayment(
        `${event.name}: ${withPhysical ? 'inperson' : 'online'} event`,
        'event',
        dollarPrice,
        paymentId,
      );

      await postgres.exec(
        insertEventPayment({
          uid,
          eventId,
          withPhysical,
          paymentId,
          amount: dollarPrice,
          paymentStatus: 'pending',
          invoiceUrl: '',
          method,
          couponCode,
        }),
      );

      return {
        id: paymentId,
        pr: '',
        onChainAddr: undefined,
        amount: dollarPrice,
        checkoutUrl: session.id,
        clientSecret: session.client_secret as string,
      };
    } else {
      throw new Error(`Unsupported payment method ${method}`);
    }
  };
};

export const createUpdateEventPaymentStatus = ({ postgres }: Dependencies) => {
  return async ({
    paymentId,
    paymentIntentId,
  }: {
    paymentId: string;
    paymentIntentId: string;
  }) => {
    await postgres.exec(
      updateEventPaymentQuery({
        id: paymentId,
        intentId: paymentIntentId,
        isPaid: true,
        isExpired: false,
      }),
    );
  };
};
