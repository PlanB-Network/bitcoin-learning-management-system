import { firstRow } from '@blms/database';
import type { CoursePaymentLight } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getPaymentQuery, getPaymentsQuery } from '../queries/get-payment.js';

export const createGetPayment = ({ postgres }: Dependencies) => {
  return async ({
    paymentId,
    uid,
  }: {
    paymentId: string;
    uid: string;
  }): Promise<CoursePaymentLight> => {
    const payment = await postgres
      .exec(getPaymentQuery(paymentId, uid))
      .then(firstRow);

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  };
};

export const createGetPayments = ({ postgres }: Dependencies) => {
  return ({ uid }: { uid: string }): Promise<CoursePaymentLight[]> => {
    return postgres.exec(getPaymentsQuery(uid));
  };
};
