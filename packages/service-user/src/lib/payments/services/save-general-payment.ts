import { v4 as uuidv4 } from 'uuid';

import { firstRow, sql } from '@blms/database';
import type { CouponCode, GeneralPaymentLight } from '@blms/types';

import { GeneralPaymentItem } from '@blms/constants';
import type { Dependencies } from '../../../dependencies.js';
import { getGeneralPaymentsQuery } from '../queries/get-general-payments.js';
import { insertGeneralPayment } from '../queries/insert-general-payment.js';
import { updateGeneralCoupon } from '../queries/update-general-coupon.js';
import {
  updateGeneralPaymentInvoiceId,
  updateGeneralPaymentQuery,
} from '../queries/update-general-payment.js';
import {
  checkSatsPrice,
  createSbpPayment,
  createStripePayment,
} from './payment-service.js';

interface Options {
  uid: string;
  item: GeneralPaymentItem;
  satsPrice: number;
  dollarPrice: number;
  method: string;
  couponCode?: string;
}

export const createSaveGeneralPayment = (dependencies: Dependencies) => {
  const { postgres, config, stripe } = dependencies;

  const sbpPayment = createSbpPayment(config.swissBitcoinPay);
  const stripePayment = createStripePayment({ stripe });

  return async ({
    uid,
    item,
    satsPrice,
    dollarPrice,
    method,
    couponCode,
  }: Options) => {
    let priceInDollars: number;
    if (item === GeneralPaymentItem.SummerSchool2025) {
      priceInDollars = 2500;
    } else {
      throw new Error(`Wrong payment item: ${item}`);
    }

    let couponId = '';
    if (item === GeneralPaymentItem.SummerSchool2025) {
      couponId = 'c762773a-9017-4129-bc0e-06adf86050ef';
    }

    if (couponCode) {
      const coupon = await postgres
        .exec(
          sql<CouponCode[]>`
          SELECT * FROM content.coupon_code
          WHERE code = ${couponCode}
            AND deleted_at IS NULL
            AND item_id = ${couponId} AND (uses < max_uses)`,
        )
        .then(firstRow);

      if (!coupon || !coupon.reductionPercentage) {
        throw new Error(
          `Coupon code ${coupon} does not exist or is already used`,
        );
      }

      priceInDollars = Math.ceil(
        (priceInDollars * (100 - coupon.reductionPercentage)) / 100,
      );
    }

    if (priceInDollars !== dollarPrice) {
      throw new Error('Price is not the correct one');
    }

    if (priceInDollars === 0) {
      const randomUUID = uuidv4();

      const payment = await postgres.exec(
        insertGeneralPayment({
          item: item,
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
          updateGeneralCoupon({
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
      await checkSatsPrice(priceInDollars, satsPrice);
    }

    if (method === 'sbp') {
      const checkoutData = await sbpPayment(item, satsPrice, 'general');

      await postgres.exec(
        insertGeneralPayment({
          uid,
          item,
          paymentStatus: 'pending',
          amount: checkoutData.amount,
          paymentId: checkoutData.id,
          invoiceUrl: checkoutData.checkoutUrl,
          method: method,
          couponCode: couponCode,
        }),
      );

      return checkoutData;
    }

    if (method === 'stripe') {
      const paymentId = uuidv4();
      const session = await stripePayment(
        `${item}`,
        item,
        dollarPrice,
        paymentId,
      );

      await postgres.exec(
        insertGeneralPayment({
          uid,
          item,
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
    }

    throw new Error(`Unsupported payment method ${method}`);
  };
};

export const createUpdateGeneralPaymentStatus = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async ({
    paymentId,
    paymentIntentId,
  }: {
    paymentId: string;
    paymentIntentId: string;
  }) => {
    await postgres.exec(
      updateGeneralPaymentQuery({
        id: paymentId,
        intentId: paymentIntentId,
        isPaid: true,
        isExpired: false,
      }),
    );
  };
};

type Options2 = { id: string } & (
  | { isPaid: true; isExpired: false }
  | { isPaid: false; isExpired: true }
);

export const createUpdateGeneralPayment = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (options: Options2) => {
    const query = updateGeneralPaymentQuery(options);
    await postgres.exec(query);
  };
};

interface Options3 {
  intentId: string;
  stripeInvoiceId: string;
  invoiceUrl: string;
}

export const createUpdateGeneralPaymentInvoiceId = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (options: Options3) => {
    await postgres.exec(updateGeneralPaymentInvoiceId(options));
  };
};

export const createGetGeneralPayments = ({ postgres }: Dependencies) => {
  return ({ uid }: { uid: string }): Promise<GeneralPaymentLight[]> => {
    return postgres.exec(getGeneralPaymentsQuery(uid));
  };
};
