import type { Dependencies } from '../../../dependencies.js';
import type { GetPaymentQueryOutput } from '../queries/get-payment.js';
import { getPaymentQuery } from '../queries/get-payment.js';

export type GetPaymentOutput = GetPaymentQueryOutput;

export const createGetPayment = (dependencies: Dependencies) => {
  return async ({ uid }: { uid: string }): Promise<GetPaymentOutput> => {
    const { postgres } = dependencies;

    return postgres.exec(getPaymentQuery(uid));
  };
};
