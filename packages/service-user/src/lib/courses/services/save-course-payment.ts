import { v4 as uuidv4 } from 'uuid';

import { firstRow, sql } from '@blms/database';
import type { CouponCode, Course } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import {
  checkSatsPrice,
  createSbpPayment,
  createStripePayment,
} from '../../payments/services/payment-service.js';
import { insertCoursePayment } from '../queries/insert-course-payment.js';
import { updateCourseCoupon } from '../queries/update-course-coupon.js';
import { updateCoursePaymentQuery } from '../queries/update-payment.js';

interface Options {
  uid: string;
  courseId: string;
  satsPrice: number;
  dollarPrice: number;
  method: string;
  couponCode?: string;
  format: string;
}

export const createSaveCoursePayment = (dependencies: Dependencies) => {
  const { postgres, config, stripe } = dependencies;

  const sbpPayment = createSbpPayment(config.swissBitcoinPay);
  const stripePayment = createStripePayment({ stripe });

  return async ({
    uid,
    courseId,
    satsPrice,
    dollarPrice,
    method,
    couponCode,
    format,
  }: Options) => {
    const course = await postgres
      .exec(sql<Course[]>`SELECT * FROM content.courses WHERE id = ${courseId}`)
      .then(firstRow);

    if (!course) {
      throw new Error(`Course ${courseId} is missing`);
    }

    let coursePriceInDollars: number;

    if (format === 'inperson') {
      coursePriceInDollars = course.inpersonPriceDollars as number;
    } else if (format === 'online') {
      coursePriceInDollars = course.onlinePriceDollars as number;
    } else {
      throw new Error(`Wrong course format: ${format}`);
    }

    if (couponCode) {
      const coupon = await postgres
        .exec(
          sql<
            CouponCode[]
          >`SELECT * FROM content.coupon_code WHERE code = ${couponCode} AND item_id = ${courseId} and (is_used = false OR is_unique = false)`,
        )
        .then(firstRow);

      if (!coupon || !coupon.reductionPercentage) {
        throw new Error(
          `Coupon code ${coupon} does not exist or is already used`,
        );
      }

      coursePriceInDollars = Math.ceil(
        (coursePriceInDollars * (100 - coupon.reductionPercentage)) / 100,
      );
    }

    if (coursePriceInDollars !== dollarPrice) {
      throw new Error('Price is not the correct one');
    }

    if (coursePriceInDollars === 0) {
      const randomUUID = uuidv4();

      const payment = await postgres.exec(
        insertCoursePayment({
          courseId: courseId,
          format: format,
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
          updateCourseCoupon({
            paymentId: payment[0].paymentId,
          }),
        );
      }

      return {
        id: 'free',
        pr: '',
        onChainAddr: undefined,
        amount: dollarPrice,
        checkoutUrl: '',
        clientSecret: '',
      };
    }

    if (method === 'sbp') {
      await checkSatsPrice(coursePriceInDollars, satsPrice);
    }

    if (method === 'sbp') {
      const checkoutData = await sbpPayment(courseId, satsPrice, 'courses');

      await postgres.exec(
        insertCoursePayment({
          uid,
          courseId,
          paymentStatus: 'pending',
          format: format,
          amount: checkoutData.amount,
          paymentId: checkoutData.id,
          invoiceUrl: checkoutData.checkoutUrl,
          method: method,
          couponCode: couponCode,
        }),
      );

      return checkoutData;
    } else if (method === 'stripe') {
      const paymentId = uuidv4();
      const session = await stripePayment(
        `${courseId}: ${format} course`,
        'course',
        dollarPrice,
        paymentId,
      );

      await postgres.exec(
        insertCoursePayment({
          uid,
          courseId,
          format,
          paymentId,
          amount: dollarPrice,
          paymentStatus: 'pending',
          invoiceUrl: '',
          method: method,
          couponCode: couponCode,
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

export const createUpdateCoursePaymentStatus = ({ postgres }: Dependencies) => {
  return async ({
    paymentId,
    paymentIntentId,
  }: {
    paymentId: string;
    paymentIntentId: string;
  }) => {
    await postgres.exec(
      updateCoursePaymentQuery({
        id: paymentId,
        intentId: paymentIntentId,
        isPaid: true,
        isExpired: false,
      }),
    );
  };
};
