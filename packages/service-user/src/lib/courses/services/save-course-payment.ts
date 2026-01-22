import { firstRow, sql } from '@blms/database';
import type { CouponCode, Course, CoursePayment } from '@blms/types';
import { v4 as uuidv4 } from 'uuid';

import type { Dependencies } from '../../../dependencies.js';
import {
  checkSatsPrice,
  createSbpPayment,
  createStripePayment,
} from '../../payments/services/payment-service.js';
import { insertCoursePayment } from '../queries/insert-course-payment.js';
import { updateCourseCoupon } from '../queries/update-course-coupon.js';
import {
  updateCoursePaymentQuery,
  updatePaymentInvoiceId,
} from '../queries/update-payment.js';
import { createSendCourseWelcomeEmail } from './send-course-welcome-email.js';
import { createStartCourse } from './start-course.js';

interface Options {
  uid: string;
  courseId: string;
  courseIndex: string;
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
    courseIndex,
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
          sql<CouponCode[]>`
          SELECT * FROM content.coupon_code
          WHERE code = ${couponCode}
            AND deleted_at IS NULL
            AND item_id = ${courseId} AND (uses < max_uses)`,
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
          amount: 0,
          couponCode: couponCode,
          courseId: courseId,
          format: format,
          invoiceUrl: '',
          method: 'free',
          paymentId: randomUUID,
          paymentStatus: 'paid',
          uid: uid,
        }),
      );

      if (payment && payment.length > 0) {
        await postgres.exec(
          updateCourseCoupon({
            paymentId: payment[0].paymentId,
          }),
        );
      }

      // Send email to user if course payment is validated and course is part of PlanB School
      if (payment && payment.length === 1) {
        const courseId = payment[0].courseId;
        const userId = payment[0].uid;

        await createSendCourseWelcomeEmail(dependencies)({
          courseId: courseId,
          userId: userId,
        });
      }

      return {
        amount: dollarPrice,
        checkoutUrl: '',
        clientSecret: '',
        id: 'free',
        onChainAddr: undefined,
        pr: '',
      };
    }

    if (method === 'sbp') {
      await checkSatsPrice(coursePriceInDollars, satsPrice);
    }

    if (method === 'sbp') {
      const checkoutData = await sbpPayment(courseId, satsPrice, 'courses');

      await postgres.exec(
        insertCoursePayment({
          amount: checkoutData.amount,
          couponCode: couponCode,
          courseId,
          format: format,
          invoiceUrl: checkoutData.checkoutUrl,
          method: method,
          paymentId: checkoutData.id,
          paymentStatus: 'pending',
          uid,
        }),
      );

      return checkoutData;
    }

    if (method === 'stripe') {
      const paymentId = uuidv4();
      const session = await stripePayment(
        `${courseIndex}:${format} course`,
        'course',
        dollarPrice,
        paymentId,
      );

      await postgres.exec(
        insertCoursePayment({
          amount: dollarPrice,
          couponCode: couponCode,
          courseId,
          format,
          invoiceUrl: '',
          method: method,
          paymentId,
          paymentStatus: 'pending',
          uid,
        }),
      );

      return {
        amount: dollarPrice,
        checkoutUrl: session.id,
        clientSecret: session.client_secret as string,
        id: paymentId,
        onChainAddr: undefined,
        pr: '',
      };
    }

    throw new Error(`Unsupported payment method ${method}`);
  };
};

export const createUpdateCoursePaymentStatus = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    paymentId,
    paymentIntentId,
  }: {
    paymentId: string;
    paymentIntentId: string;
  }) => {
    const { postgres } = dependencies;
    const coursePayments = await postgres.exec(
      updateCoursePaymentQuery({
        id: paymentId,
        intentId: paymentIntentId,
        isExpired: false,
        isPaid: true,
      }),
    );
    const coursePayment =
      coursePayments && coursePayments.length === 1 ? coursePayments[0] : null;

    if (coursePayment) {
      await postSuccessfulCoursePaymentHandling(
        dependencies,
        coursePayment.paymentId,
        coursePayment,
      );
    }

    return coursePayment;
  };
};

type Options2 = { id: string } & (
  | { isPaid: true; isExpired: false }
  | { isPaid: false; isExpired: true }
);

export const createUpdateCoursePayment = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async (options: Options2) => {
    const { postgres } = dependencies;

    const coursePayments = await postgres.exec(
      updateCoursePaymentQuery(options),
    );

    const coursePayment =
      coursePayments && coursePayments.length === 1 ? coursePayments[0] : null;

    if (options.isPaid && coursePayment) {
      await postSuccessfulCoursePaymentHandling(
        dependencies,
        options.id,
        coursePayment,
      );
    }

    return coursePayment;
  };
};

interface Options3 {
  intentId: string;
  stripeInvoiceId: string;
  invoiceUrl: string;
}

export const createUpdateCoursePaymentInvoiceId = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async (options: Options3) => {
    const { postgres } = dependencies;

    const coursePayments = await postgres.exec(updatePaymentInvoiceId(options));
    const coursePayment =
      coursePayments && coursePayments.length === 1 ? coursePayments[0] : null;

    return coursePayment;
  };
};

const postSuccessfulCoursePaymentHandling = async (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
  paymentId: string,
  coursePayment: CoursePayment,
) => {
  const { postgres } = dependencies;

  await createStartCourse(dependencies)({
    courseId: coursePayment.courseId,
    uid: coursePayment.uid,
  });

  await postgres.exec(updateCourseCoupon({ paymentId: paymentId }));

  await createSendCourseWelcomeEmail(dependencies)({
    courseId: coursePayment.courseId,
    userId: coursePayment.uid,
  });
};
