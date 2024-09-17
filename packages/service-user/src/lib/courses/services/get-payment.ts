import type { Dependencies } from '../../../dependencies.js';
import type { GetPaymentQueryOutput } from '../queries/get-payment.js';
import { getPaymentQuery } from '../queries/get-payment.js';

export type GetPaymentOutput = GetPaymentQueryOutput;

interface Options {
  uid: string;
}

export const createGetPayment = ({ postgres }: Dependencies) => {
  return ({ uid }: Options): Promise<GetPaymentOutput> => {
    return postgres.exec(getPaymentQuery(uid));
  };
};
